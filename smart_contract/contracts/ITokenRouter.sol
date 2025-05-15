// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ITokenRouter
 * @dev Giao diện cho hợp đồng TokenRouter
 */
interface ITokenRouter {
    /**
     * @dev Cập nhật đường dẫn tối ưu giữa hai token
     * @param _tokenIn địa chỉ của token đầu vào
     * @param _tokenOut địa chỉ của token đầu ra
     * @param _path đường dẫn tối ưu qua các token trung gian
     */
    function updateRoute(address _tokenIn, address _tokenOut, address[] calldata _path) external;
    
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
    ) external returns (uint256 amountOut);
    
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
    ) external view returns (uint256 amountOut);
    
    /**
     * @dev Lấy đường dẫn tối ưu giữa hai token
     * @param _tokenIn địa chỉ của token đầu vào
     * @param _tokenOut địa chỉ của token đầu ra
     * @return path đường dẫn tối ưu
     */
    function getRoute(address _tokenIn, address _tokenOut) external view returns (address[] memory);
}