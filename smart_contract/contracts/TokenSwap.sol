// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TokenSwap
 * @dev Contract để thực hiện trao đổi giữa các token, tương tự như Uniswap/PancakeSwap
 * Triển khai thuật toán AMM (Automated Market Maker) với công thức x*y=k
 */

 /// @custom:dev-run-script scripts/deploy_tokenswap.js

contract TokenSwap is Ownable {
    constructor() Ownable() {}  // Truyền đúng chủ sở hữu ban đầu

    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // Thông tin về pool thanh khoản
    struct Pool {
        IERC20 tokenA;
        IERC20 tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 totalLiquidity;
        mapping(address => uint256) liquidityProvider;
    }
    
    // Mapping từ cặp token (hash của địa chỉ hai token) tới pool
    mapping(bytes32 => Pool) public pools;
    // Danh sách các pool hiện có
    bytes32[] public poolIds;

    // Fee của giao dịch swap (0.3%)
    uint256 public constant SWAP_FEE = 30;
    uint256 public constant FEE_DENOMINATOR = 10000;

    // Events
    event PoolCreated(address indexed tokenA, address indexed tokenB, bytes32 poolId);
    event LiquidityAdded(address indexed provider, bytes32 poolId, uint256 amountA, uint256 amountB, uint256 liquidity);
    event LiquidityRemoved(address indexed provider, bytes32 poolId, uint256 amountA, uint256 amountB, uint256 liquidity);
    event TokenSwapped(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut);

    /**
     * @dev Tạo một pool thanh khoản mới giữa hai token
     * @param _tokenA địa chỉ của token A
     * @param _tokenB địa chỉ của token B
     */
    function createPool(address _tokenA, address _tokenB) external {
        require(_tokenA != _tokenB, "TokenSwap: IDENTICAL_ADDRESSES");
        require(_tokenA != address(0) && _tokenB != address(0), "TokenSwap: ZERO_ADDRESS");
        
        // Đảm bảo thứ tự của token (token có địa chỉ nhỏ hơn sẽ là tokenA)
        (address tokenA, address tokenB) = _tokenA < _tokenB ? (_tokenA, _tokenB) : (_tokenB, _tokenA);
        
        // Tạo pool ID bằng cách băm hai địa chỉ token
        bytes32 poolId = keccak256(abi.encodePacked(tokenA, tokenB));
        
        // Kiểm tra pool không tồn tại
        require(address(pools[poolId].tokenA) == address(0), "TokenSwap: POOL_EXISTS");
        
        // Tạo pool mới
        pools[poolId].tokenA = IERC20(tokenA);
        pools[poolId].tokenB = IERC20(tokenB);
        
        // Thêm pool ID vào danh sách
        poolIds.push(poolId);
        
        emit PoolCreated(tokenA, tokenB, poolId);
    }
    
    /**
     * @dev Thêm thanh khoản vào pool
     * @param _tokenA địa chỉ của token A
     * @param _tokenB địa chỉ của token B
     * @param _amountA số lượng token A
     * @param _amountB số lượng token B
     * @return liquidity số lượng token LP mà người dùng nhận được
     */
    function addLiquidity(
        address _tokenA,
        address _tokenB,
        uint256 _amountA,
        uint256 _amountB
    ) external returns (uint256 liquidity) {
        // Đảm bảo thứ tự của token
        (address tokenA, address tokenB) = _tokenA < _tokenB ? (_tokenA, _tokenB) : (_tokenB, _tokenA);
        uint256 amountA = _tokenA < _tokenB ? _amountA : _amountB;
        uint256 amountB = _tokenA < _tokenB ? _amountB : _amountA;
        
        // Lấy pool ID
        bytes32 poolId = keccak256(abi.encodePacked(tokenA, tokenB));
        
        // Kiểm tra pool tồn tại
        require(address(pools[poolId].tokenA) != address(0), "TokenSwap: POOL_NOT_FOUND");
        
        Pool storage pool = pools[poolId];
        
        // Tính toán lượng token LP được mint
        if (pool.totalLiquidity == 0) {
            // Nếu đây là lần đầu tiên thêm thanh khoản
            liquidity = sqrt(amountA.mul(amountB));
        } else {
            // Nếu đã có thanh khoản trong pool
            uint256 liquidityA = amountA.mul(pool.totalLiquidity).div(pool.reserveA);
            uint256 liquidityB = amountB.mul(pool.totalLiquidity).div(pool.reserveB);
            liquidity = liquidityA < liquidityB ? liquidityA : liquidityB;
        }
        
        require(liquidity > 0, "TokenSwap: INSUFFICIENT_LIQUIDITY_MINTED");
        
        // Chuyển token từ người gọi vào contract
        pool.tokenA.safeTransferFrom(msg.sender, address(this), amountA);
        pool.tokenB.safeTransferFrom(msg.sender, address(this), amountB);
        
        // Cập nhật số dư trong pool
        pool.reserveA = pool.reserveA.add(amountA);
        pool.reserveB = pool.reserveB.add(amountB);
        
        // Cập nhật thanh khoản
        pool.liquidityProvider[msg.sender] = pool.liquidityProvider[msg.sender].add(liquidity);
        pool.totalLiquidity = pool.totalLiquidity.add(liquidity);
        
        emit LiquidityAdded(msg.sender, poolId, amountA, amountB, liquidity);
        
        return liquidity;
    }
    
    /**
     * @dev Rút thanh khoản khỏi pool
     * @param _tokenA địa chỉ của token A
     * @param _tokenB địa chỉ của token B
     * @param _liquidity số lượng token LP muốn rút
     * @return amountA số lượng token A nhận được
     * @return amountB số lượng token B nhận được
     */
    function removeLiquidity(
        address _tokenA,
        address _tokenB,
        uint256 _liquidity
    ) external returns (uint256 amountA, uint256 amountB) {
        // Đảm bảo thứ tự của token
        (address tokenA, address tokenB) = _tokenA < _tokenB ? (_tokenA, _tokenB) : (_tokenB, _tokenA);
        
        // Lấy pool ID
        bytes32 poolId = keccak256(abi.encodePacked(tokenA, tokenB));
        
        // Kiểm tra pool tồn tại
        require(address(pools[poolId].tokenA) != address(0), "TokenSwap: POOL_NOT_FOUND");
        
        Pool storage pool = pools[poolId];
        
        // Kiểm tra người gọi có đủ thanh khoản
        require(pool.liquidityProvider[msg.sender] >= _liquidity, "TokenSwap: INSUFFICIENT_LIQUIDITY_BURNED");
        
        // Tính số token sẽ nhận lại
        amountA = _liquidity.mul(pool.reserveA).div(pool.totalLiquidity);
        amountB = _liquidity.mul(pool.reserveB).div(pool.totalLiquidity);
        
        require(amountA > 0 && amountB > 0, "TokenSwap: INSUFFICIENT_LIQUIDITY_BURNED");
        
        // Cập nhật thanh khoản
        pool.liquidityProvider[msg.sender] = pool.liquidityProvider[msg.sender].sub(_liquidity);
        pool.totalLiquidity = pool.totalLiquidity.sub(_liquidity);
        
        // Cập nhật số dư trong pool
        pool.reserveA = pool.reserveA.sub(amountA);
        pool.reserveB = pool.reserveB.sub(amountB);
        
        // Chuyển token về cho người gọi
        pool.tokenA.safeTransfer(msg.sender, amountA);
        pool.tokenB.safeTransfer(msg.sender, amountB);
        
        emit LiquidityRemoved(msg.sender, poolId, amountA, amountB, _liquidity);
        
        return (amountA, amountB);
    }
    
    /**
     * @dev Swap token
     * @param _tokenIn địa chỉ của token đầu vào
     * @param _tokenOut địa chỉ của token đầu ra
     * @param _amountIn số lượng token đầu vào
     * @param _minAmountOut số lượng token đầu ra tối thiểu
     * @return amountOut số lượng token đầu ra thực tế
     */
    function swapTokens(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn,
        uint256 _minAmountOut
    ) external returns (uint256 amountOut) {
        require(_tokenIn != _tokenOut, "TokenSwap: IDENTICAL_TOKENS");
        require(_amountIn > 0, "TokenSwap: INSUFFICIENT_INPUT_AMOUNT");
        
        // Đảm bảo thứ tự của token
        (address tokenA, address tokenB) = _tokenIn < _tokenOut ? (_tokenIn, _tokenOut) : (_tokenOut, _tokenIn);
        
        // Lấy pool ID
        bytes32 poolId = keccak256(abi.encodePacked(tokenA, tokenB));
        
        // Kiểm tra pool tồn tại
        require(address(pools[poolId].tokenA) != address(0), "TokenSwap: POOL_NOT_FOUND");
        
        Pool storage pool = pools[poolId];
        
        bool isTokenA = _tokenIn == address(pool.tokenA);
        
        // Lấy token reserve
        uint256 reserveIn = isTokenA ? pool.reserveA : pool.reserveB;
        uint256 reserveOut = isTokenA ? pool.reserveB : pool.reserveA;
        
        // Tính fee (0.3%)
        uint256 amountInWithFee = _amountIn.mul(FEE_DENOMINATOR.sub(SWAP_FEE));
        
        // Tính số token đầu ra theo công thức x*y=k
        // (x + Δx) * (y - Δy) = x * y
        // Δy = y - (x * y) / (x + Δx)
        // Δy = y * Δx / (x + Δx)
        amountOut = reserveOut.mul(amountInWithFee).div(reserveIn.mul(FEE_DENOMINATOR).add(amountInWithFee));
        
        require(amountOut >= _minAmountOut, "TokenSwap: INSUFFICIENT_OUTPUT_AMOUNT");
        require(amountOut < reserveOut, "TokenSwap: INSUFFICIENT_LIQUIDITY");
        
        // Chuyển token vào pool
        if (isTokenA) {
            pool.tokenA.safeTransferFrom(msg.sender, address(this), _amountIn);
            pool.tokenB.safeTransfer(msg.sender, amountOut);
            
            // Cập nhật số dư trong pool
            pool.reserveA = pool.reserveA.add(_amountIn);
            pool.reserveB = pool.reserveB.sub(amountOut);
        } else {
            pool.tokenB.safeTransferFrom(msg.sender, address(this), _amountIn);
            pool.tokenA.safeTransfer(msg.sender, amountOut);
            
            // Cập nhật số dư trong pool
            pool.reserveB = pool.reserveB.add(_amountIn);
            pool.reserveA = pool.reserveA.sub(amountOut);
        }
        
        emit TokenSwapped(msg.sender, _tokenIn, _tokenOut, _amountIn, amountOut);
        
        return amountOut;
    }
    
    /**
     * @dev Lấy số lượng token đầu ra dự kiến
     * @param _tokenIn địa chỉ của token đầu vào
     * @param _tokenOut địa chỉ của token đầu ra
     * @param _amountIn số lượng token đầu vào
     * @return amountOut số lượng token đầu ra dự kiến
     */
    function getAmountOut(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn
    ) external view returns (uint256 amountOut) {
        require(_tokenIn != _tokenOut, "TokenSwap: IDENTICAL_TOKENS");
        require(_amountIn > 0, "TokenSwap: INSUFFICIENT_INPUT_AMOUNT");
        
        // Đảm bảo thứ tự của token
        (address tokenA, address tokenB) = _tokenIn < _tokenOut ? (_tokenIn, _tokenOut) : (_tokenOut, _tokenIn);
        
        // Lấy pool ID
        bytes32 poolId = keccak256(abi.encodePacked(tokenA, tokenB));
        
        // Kiểm tra pool tồn tại
        require(address(pools[poolId].tokenA) != address(0), "TokenSwap: POOL_NOT_FOUND");
        
        Pool storage pool = pools[poolId];
        
        bool isTokenA = _tokenIn == address(pool.tokenA);
        
        // Lấy token reserve
        uint256 reserveIn = isTokenA ? pool.reserveA : pool.reserveB;
        uint256 reserveOut = isTokenA ? pool.reserveB : pool.reserveA;
        
        // Tính fee (0.3%)
        uint256 amountInWithFee = _amountIn.mul(FEE_DENOMINATOR.sub(SWAP_FEE));
        
        // Tính số token đầu ra theo công thức x*y=k
        amountOut = reserveOut.mul(amountInWithFee).div(reserveIn.mul(FEE_DENOMINATOR).add(amountInWithFee));
        
        return amountOut;
    }
    
    /**
     * @dev Lấy thông tin về thanh khoản của người dùng trong pool
     * @param _tokenA địa chỉ của token A
     * @param _tokenB địa chỉ của token B
     * @param _user địa chỉ của người dùng
     * @return liquidity số lượng token LP của người dùng
     */
    function getUserLiquidity(
        address _tokenA,
        address _tokenB,
        address _user
    ) external view returns (uint256 liquidity) {
        // Đảm bảo thứ tự của token
        (address tokenA, address tokenB) = _tokenA < _tokenB ? (_tokenA, _tokenB) : (_tokenB, _tokenA);
        
        // Lấy pool ID
        bytes32 poolId = keccak256(abi.encodePacked(tokenA, tokenB));
        
        return pools[poolId].liquidityProvider[_user];
    }
    
    /**
     * @dev Lấy thông tin về pool
     * @param _tokenA địa chỉ của token A
     * @param _tokenB địa chỉ của token B
     * @return reserveA số lượng token A trong pool
     * @return reserveB số lượng token B trong pool
     * @return totalLiquidity tổng thanh khoản trong pool
     */
    function getPoolInfo(
        address _tokenA,
        address _tokenB
    ) external view returns (uint256 reserveA, uint256 reserveB, uint256 totalLiquidity) {
        // Đảm bảo thứ tự của token
        (address tokenA, address tokenB) = _tokenA < _tokenB ? (_tokenA, _tokenB) : (_tokenB, _tokenA);
        
        // Lấy pool ID
        bytes32 poolId = keccak256(abi.encodePacked(tokenA, tokenB));
        
        Pool storage pool = pools[poolId];
        
        return (pool.reserveA, pool.reserveB, pool.totalLiquidity);
    }
    
    /**
     * @dev Lấy số lượng pool hiện có
     * @return số lượng pool hiện có
     */
    function getPoolCount() external view returns (uint256) {
        return poolIds.length;
    }
    
    /**
     * @dev Tính căn bậc hai của một số
     * @param y số cần tính căn bậc hai
     * @return z căn bậc hai của y
     */
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}