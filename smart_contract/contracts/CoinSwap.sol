// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ITokenSwap.sol";
import "./ITokenRouter.sol";
import "./ITokenFactory.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
/**
 * @title CoinSwap
 * @dev Hợp đồng chính kết hợp tất cả các chức năng để thực hiện giao dịch tiền điện tử
 * Tích hợp với hợp đồng Transactions cơ bản đã cho
 */
contract CoinSwap is Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // Địa chỉ của các hợp đồng liên quan
    ITokenSwap public tokenSwap;
    ITokenRouter public tokenRouter;
    ITokenFactory public tokenFactory;
    address public transactionsContract;
    
    // Phí nền tảng (0.05%)
    uint256 public constant PLATFORM_FEE = 5;
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // Địa chỉ nhận phí
    address public feeReceiver;
    
    // Sự kiện
    event SwapCompleted(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut);
    event LiquidityAdded(address indexed user, address indexed tokenA, address indexed tokenB, uint256 amountA, uint256 amountB, uint256 liquidity);
    event LiquidityRemoved(address indexed user, address indexed tokenA, address indexed tokenB, uint256 amountA, uint256 amountB, uint256 liquidity);
    event TokenCreated(address indexed creator, string name, string symbol, address tokenAddress);
    
    /**
     * @dev Khởi tạo hợp đồng CoinSwap
     * @param _tokenSwap địa chỉ của hợp đồng TokenSwap
     * @param _tokenRouter địa chỉ của hợp đồng TokenRouter
     * @param _tokenFactory địa chỉ của hợp đồng TokenFactory
     * @param _transactionsContract địa chỉ của hợp đồng Transactions cơ bản
     * @param _feeReceiver địa chỉ nhận phí
     */
    constructor(
        address _tokenSwap,
        address _tokenRouter,
        address _tokenFactory,
        address _transactionsContract,
        address _feeReceiver
    ) {
        require(_tokenSwap != address(0), "CoinSwap: ZERO_ADDRESS");
        require(_tokenRouter != address(0), "CoinSwap: ZERO_ADDRESS");
        require(_tokenFactory != address(0), "CoinSwap: ZERO_ADDRESS");
        require(_transactionsContract != address(0), "CoinSwap: ZERO_ADDRESS");
        require(_feeReceiver != address(0), "CoinSwap: ZERO_ADDRESS");
        
        tokenSwap = ITokenSwap(_tokenSwap);
        tokenRouter = ITokenRouter(_tokenRouter);
        tokenFactory = ITokenFactory(_tokenFactory);
        transactionsContract = _transactionsContract;
        feeReceiver = _feeReceiver;
    }
    
    /**
     * @dev Cập nhật địa chỉ nhận phí
     * @param _feeReceiver địa chỉ nhận phí mới
     */
    function updateFeeReceiver(address _feeReceiver) external onlyOwner {
        require(_feeReceiver != address(0), "CoinSwap: ZERO_ADDRESS");
        feeReceiver = _feeReceiver;
    }
    
    /**
     * @dev Tạo một token mới
     * @param name Tên của token
     * @param symbol Ký hiệu của token
     * @param initialSupply Số lượng token ban đầu được tạo ra
     * @param decimals Số thập phân của token
     * @return tokenAddress địa chỉ của token mới
     */
    function createToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint8 decimals
    ) external returns (address tokenAddress) {
        tokenAddress = tokenFactory.createToken(name, symbol, initialSupply, decimals);
        
        emit TokenCreated(msg.sender, name, symbol, tokenAddress);
        
        return tokenAddress;
    }
    
    /**
     * @dev Tạo một pool thanh khoản mới
     * @param _tokenA địa chỉ của token A
     * @param _tokenB địa chỉ của token B
     */
    function createPool(address _tokenA, address _tokenB) external {
        tokenSwap.createPool(_tokenA, _tokenB);
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
    ) external nonReentrant returns (uint256 liquidity) {
        // Chuyển token từ người gọi vào hợp đồng này
        IERC20(_tokenA).safeTransferFrom(msg.sender, address(this), _amountA);
        IERC20(_tokenB).safeTransferFrom(msg.sender, address(this), _amountB);
        
        // Cho phép hợp đồng TokenSwap sử dụng token
        IERC20(_tokenA).safeApprove(address(tokenSwap), _amountA);
        IERC20(_tokenB).safeApprove(address(tokenSwap), _amountB);
        
        // Thêm thanh khoản
        (, , uint256 addedLiquidity) = tokenSwap.addLiquidity(
            _tokenA,
            _tokenB,
            _amountA,
            _amountB,
            0, // Minimum amount of token A
            0  // Minimum amount of token B
        );
        
        emit LiquidityAdded(msg.sender, _tokenA, _tokenB, _amountA, _amountB, addedLiquidity);
        
        return addedLiquidity;
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
    ) external nonReentrant returns (uint256 amountA, uint256 amountB) {
        // Rút thanh khoản
        (amountA, amountB) = tokenSwap.removeLiquidity(_tokenA, _tokenB, _liquidity, 0, 0);
        
        // Chuyển token cho người gọi
        IERC20(_tokenA).safeTransfer(msg.sender, amountA);
        IERC20(_tokenB).safeTransfer(msg.sender, amountB);
        
        emit LiquidityRemoved(msg.sender, _tokenA, _tokenB, amountA, amountB, _liquidity);
        
        return (amountA, amountB);
    }
    
    /**
     * @dev Swap token
     * @param _tokenIn địa chỉ của token đầu vào
     * @param _tokenOut địa chỉ của token đầu ra
     * @param _amountIn số lượng token đầu vào
     * @param _minAmountOut số lượng token đầu ra tối thiểu
     * @param _useRouter sử dụng router để tìm đường dẫn tối ưu hay không
     * @return amountOut số lượng token đầu ra thực tế
     */
    function swapTokens(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn,
        uint256 _minAmountOut,
        bool _useRouter
    ) external nonReentrant returns (uint256 amountOut) {
        // Tính phí nền tảng
        uint256 platformFee = _amountIn.mul(PLATFORM_FEE).div(FEE_DENOMINATOR);
        uint256 amountInAfterFee = _amountIn.sub(platformFee);
        
        // Chuyển token đầu vào từ người gọi vào hợp đồng này
        IERC20(_tokenIn).safeTransferFrom(msg.sender, address(this), _amountIn);
        
        // Chuyển phí cho địa chỉ nhận phí
        if (platformFee > 0) {
            IERC20(_tokenIn).safeTransfer(feeReceiver, platformFee);
        }
        
        if (_useRouter) {
            // Cho phép router sử dụng token
            IERC20(_tokenIn).safeApprove(address(tokenRouter), amountInAfterFee);
            
            // Swap qua router
            amountOut = tokenRouter.swapExactTokensForTokens(
                _tokenIn,
                _tokenOut,
                amountInAfterFee,
                _minAmountOut
            );
        } else {
            // Cho phép TokenSwap sử dụng token
            IERC20(_tokenIn).safeApprove(address(tokenSwap), amountInAfterFee);
            
            // Swap trực tiếp
            amountOut = tokenSwap.swapTokens(
                _tokenIn,
                _tokenOut,
                amountInAfterFee,
                _minAmountOut
            );
            
            // Chuyển token đầu ra cho người gọi
            IERC20(_tokenOut).safeTransfer(msg.sender, amountOut);
        }
        
        emit SwapCompleted(msg.sender, _tokenIn, _tokenOut, _amountIn, amountOut);
        
        return amountOut;
    }
    
    /**
     * @dev Lấy số lượng token đầu ra dự kiến
     * @param _tokenIn địa chỉ của token đầu vào
     * @param _tokenOut địa chỉ của token đầu ra
     * @param _amountIn số lượng token đầu vào
     * @param _useRouter sử dụng router để tìm đường dẫn tối ưu hay không
     * @return amountOut số lượng token đầu ra dự kiến
     */
    function getAmountOut(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn,
        bool _useRouter
    ) external view returns (uint256 amountOut) {
        // Tính phí nền tảng
        uint256 platformFee = _amountIn.mul(PLATFORM_FEE).div(FEE_DENOMINATOR);
        uint256 amountInAfterFee = _amountIn.sub(platformFee);
        
        if (_useRouter) {
            // Lấy số lượng đầu ra từ router
            amountOut = tokenRouter.getAmountOutByRoute(_tokenIn, _tokenOut, amountInAfterFee);
        } else {
            // Lấy số lượng đầu ra trực tiếp
            amountOut = tokenSwap.getAmountOut(_tokenIn, _tokenOut, amountInAfterFee);
        }
        
        return amountOut;
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
        return tokenSwap.getPoolInfo(_tokenA, _tokenB);
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
        return tokenSwap.getUserLiquidity(_tokenA, _tokenB, _user);
    }
    
    /**
     * @dev Lấy đường dẫn tối ưu giữa hai token
     * @param _tokenIn địa chỉ của token đầu vào
     * @param _tokenOut địa chỉ của token đầu ra
     * @return path đường dẫn tối ưu
     */
    function getRoute(
        address _tokenIn,
        address _tokenOut
    ) external view returns (address[] memory) {
        return tokenRouter.getRoute(_tokenIn, _tokenOut);
    }
    
    /**
     * @dev Rút token ERC20 còn sót lại trong hợp đồng (chỉ admin)
     * @param _token địa chỉ của token cần rút
     * @param _amount số lượng token cần rút
     */
    function recoverERC20(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).safeTransfer(owner(), _amount);
    }
}