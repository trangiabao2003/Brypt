// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./TokenSwap.sol";

/**
 * @title TokenRouter
 * @dev Hợp đồng để định tuyến các giao dịch swap qua nhiều pool
 * để tối ưu hóa giá swap giữa các token
 */
contract TokenRouter is Ownable {
    using SafeERC20 for IERC20;

    // Địa chỉ của hợp đồng TokenSwap
    TokenSwap public tokenSwap;
    
    // Đường dẫn được lưu trong bộ nhớ cache để tối ưu hóa gas
    mapping(address => mapping(address => address[])) public cachedRoutes;
    
    // Sự kiện
    event SwapExecuted(address indexed user, address[] path, uint256 amountIn, uint256 amountOut);
    event RouteUpdated(address indexed tokenIn, address indexed tokenOut, address[] path);
    
    /**
     * @dev Khởi tạo hợp đồng TokenRouter
     * @param _tokenSwap địa chỉ của hợp đồng TokenSwap
     */
     constructor(address _tokenSwap) Ownable() {
        require(_tokenSwap != address(0), "TokenRouter: INVALID_TOKENSWAP");
        tokenSwap = TokenSwap(_tokenSwap);
    }
    
    /**
     * @dev Cập nhật đường dẫn tối ưu giữa hai token
     * @param _tokenIn địa chỉ của token đầu vào
     * @param _tokenOut địa chỉ của token đầu ra
     * @param _path đường dẫn tối ưu qua các token trung gian
     */
    function updateRoute(address _tokenIn, address _tokenOut, address[] calldata _path) external onlyOwner {
        require(_path.length >= 2, "TokenRouter: INVALID_PATH");
        require(_path[0] == _tokenIn, "TokenRouter: INVALID_PATH_START");
        require(_path[_path.length - 1] == _tokenOut, "TokenRouter: INVALID_PATH_END");
        
        // Kiểm tra tất cả các pool trong đường dẫn tồn tại
        for (uint256 i = 0; i < _path.length - 1; i++) {
            address tokenA = _path[i];
            address tokenB = _path[i + 1];
            
            // Đảm bảo thứ tự của token
            (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
            
            // Kiểm tra pool tồn tại
            (uint256 reserveA, uint256 reserveB, uint256 totalLiquidity) = tokenSwap.getPoolInfo(token0, token1);
            require(totalLiquidity > 0, "TokenRouter: POOL_NOT_FOUND");
        }
        
        // Cập nhật đường dẫn
        cachedRoutes[_tokenIn][_tokenOut] = _path;
        
        emit RouteUpdated(_tokenIn, _tokenOut, _path);
    }
    
    /**
     * @dev Thực hiện swap với đường dẫn tối ưu
     * @param _tokenIn địa chỉ của token đầu vào
     * @param _tokenOut địa chỉ của token đầu ra
     * @param _amountIn số lượng token đầu vào
     * @param _minAmountOut số lượng token đầu ra tối thiểu
     * @return amountOut số lượng token đầu ra thực tế
     */
    function swapExactTokensForTokens(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn,
        uint256 _minAmountOut
    ) external returns (uint256 amountOut) {
        address[] memory path = cachedRoutes[_tokenIn][_tokenOut];
        
        // Nếu không có đường dẫn được lưu trong bộ nhớ cache, sử dụng đường dẫn trực tiếp
        if (path.length == 0) {
            path = new address[](2);
            path[0] = _tokenIn;
            path[1] = _tokenOut;
        }
        
        // Chuyển token đầu vào từ người gọi vào hợp đồng này
        IERC20(_tokenIn).safeTransferFrom(msg.sender, address(this), _amountIn);
        
        // Cho phép hợp đồng TokenSwap sử dụng token đầu vào
        // Sử dụng safeIncreaseAllowance thay vì safeApprove
        IERC20(_tokenIn).safeIncreaseAllowance(address(tokenSwap), _amountIn);
        
        // Thực hiện swap qua từng bước trong đường dẫn
        uint256 currentAmountIn = _amountIn;
        
        for (uint256 i = 0; i < path.length - 1; i++) {
            address currentTokenIn = path[i];
            address currentTokenOut = path[i + 1];

            // Nếu không phải bước cuối cùng, đặt số lượng đầu ra tối thiểu là 1
            if (i < path.length - 2) {
                uint256 swappedAmount = tokenSwap.swapTokens(currentTokenIn, currentTokenOut, currentAmountIn, 1);
                
                // Cho phép hợp đồng TokenSwap sử dụng token trung gian cho bước tiếp theo
                // Sử dụng safeIncreaseAllowance thay vì safeApprove
                IERC20(currentTokenOut).safeIncreaseAllowance(address(tokenSwap), swappedAmount);
                
                // Cập nhật số lượng đầu vào cho bước tiếp theo
                currentAmountIn = swappedAmount;
            } else {
                // Nếu là bước cuối cùng, đặt số lượng đầu ra tối thiểu theo yêu cầu
                amountOut = tokenSwap.swapTokens(currentTokenIn, currentTokenOut, currentAmountIn, _minAmountOut);
            }
        }
        
        // Chuyển token đầu ra cho người gọi
        IERC20(_tokenOut).safeTransfer(msg.sender, amountOut);
        
        emit SwapExecuted(msg.sender, path, _amountIn, amountOut);
        
        return amountOut;
    }
    
    /**
     * @dev Lấy số lượng token đầu ra dự kiến theo đường dẫn tối ưu
     * @param _tokenIn địa chỉ của token đầu vào
     * @param _tokenOut địa chỉ của token đầu ra
     * @param _amountIn số lượng token đầu vào
     * @return amountOut số lượng token đầu ra dự kiến
     */
    function getAmountOutByRoute(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn
    ) external view returns (uint256 amountOut) {
        address[] memory path = cachedRoutes[_tokenIn][_tokenOut];
        
        // Nếu không có đường dẫn được lưu trong bộ nhớ cache, sử dụng đường dẫn trực tiếp
        if (path.length == 0) {
            path = new address[](2);
            path[0] = _tokenIn;
            path[1] = _tokenOut;
        }
        
        // Tính số lượng token đầu ra dự kiến qua từng bước trong đường dẫn
        uint256 currentAmountIn = _amountIn;
        
        for (uint256 i = 0; i < path.length - 1; i++) {
            address currentTokenIn = path[i];
            address currentTokenOut = path[i + 1];
            
            // Tính số lượng token đầu ra dự kiến
            currentAmountIn = tokenSwap.getAmountOut(currentTokenIn, currentTokenOut, currentAmountIn);
        }
        
        return currentAmountIn;
    }
    
    /**
     * @dev Lấy đường dẫn tối ưu giữa hai token
     * @param _tokenIn địa chỉ của token đầu vào
     * @param _tokenOut địa chỉ của token đầu ra
     * @return path đường dẫn tối ưu
     */
    function getRoute(address _tokenIn, address _tokenOut) external view returns (address[] memory) {
        address[] memory path = cachedRoutes[_tokenIn][_tokenOut];
        
        // Nếu không có đường dẫn được lưu trong bộ nhớ cache, trả về đường dẫn trực tiếp
        if (path.length == 0) {
            path = new address[](2);
            path[0] = _tokenIn;
            path[1] = _tokenOut;
            return path;
        }
        
        return path;
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