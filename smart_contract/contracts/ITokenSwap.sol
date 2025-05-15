// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ITokenSwap
 * @dev Giao diện cho hợp đồng TokenSwap
 */
interface ITokenSwap {
    /**
     * @dev Tạo pool thanh khoản mới
     * @param _tokenA địa chỉ của tokenA
     * @param _tokenB địa chỉ của tokenB
     */
    function createPool(address _tokenA, address _tokenB) external;
    
    /**
     * @dev Thêm thanh khoản vào pool
     * @param _tokenA địa chỉ của tokenA
     * @param _tokenB địa chỉ của tokenB
     * @param _amountADesired số lượng tokenA mong muốn thêm vào
     * @param _amountBDesired số lượng tokenB mong muốn thêm vào
     * @param _amountAMin số lượng tokenA tối thiểu
     * @param _amountBMin số lượng tokenB tối thiểu
     * @return amountA số lượng tokenA thực tế đã thêm
     * @return amountB số lượng tokenB thực tế đã thêm
     * @return liquidity số lượng LP token nhận được
     */
    function addLiquidity(
        address _tokenA,
        address _tokenB,
        uint256 _amountADesired,
        uint256 _amountBDesired,
        uint256 _amountAMin,
        uint256 _amountBMin
    ) external returns (uint256 amountA, uint256 amountB, uint256 liquidity);
    
    /**
     * @dev Rút thanh khoản khỏi pool
     * @param _tokenA địa chỉ của tokenA
     * @param _tokenB địa chỉ của tokenB
     * @param _liquidity số lượng LP token muốn rút
     * @param _amountAMin số lượng tokenA tối thiểu muốn nhận
     * @param _amountBMin số lượng tokenB tối thiểu muốn nhận
     * @return amountA số lượng tokenA thực tế nhận được
     * @return amountB số lượng tokenB thực tế nhận được
     */
    function removeLiquidity(
        address _tokenA,
        address _tokenB,
        uint256 _liquidity,
        uint256 _amountAMin,
        uint256 _amountBMin
    ) external returns (uint256 amountA, uint256 amountB);
    
    /**
     * @dev Thực hiện swap giữa hai token
     * @param _tokenIn địa chỉ của token đầu vào
     * @param _tokenOut địa chỉ của token đầu ra
     * @param _amountIn số lượng token đầu vào
     * @param _amountOutMin số lượng token đầu ra tối thiểu
     * @return amountOut số lượng token đầu ra thực tế
     */
    function swapTokens(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn,
        uint256 _amountOutMin
    ) external returns (uint256 amountOut);
    
    /**
     * @dev Tính số lượng token đầu ra dự kiến
     * @param _tokenIn địa chỉ của token đầu vào
     * @param _tokenOut địa chỉ của token đầu ra
     * @param _amountIn số lượng token đầu vào
     * @return amountOut số lượng token đầu ra dự kiến
     */
    function getAmountOut(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn
    ) external view returns (uint256 amountOut);
    
    /**
     * @dev Lấy thông tin pool
     * @param _tokenA địa chỉ của tokenA
     * @param _tokenB địa chỉ của tokenB
     * @return reserveA số dư của tokenA
     * @return reserveB số dư của tokenB
     * @return totalLiquidity tổng số LP token
     */
    function getPoolInfo(
        address _tokenA,
        address _tokenB
    ) external view returns (uint256 reserveA, uint256 reserveB, uint256 totalLiquidity);
    
    /**
     * @dev Lấy số dư LP token của người dùng
     * @param _user địa chỉ của người dùng
     * @param _tokenA địa chỉ của tokenA
     * @param _tokenB địa chỉ của tokenB
     * @return liquidity số dư LP token
     */
    function getUserLiquidity(
        address _user,
        address _tokenA,
        address _tokenB
    ) external view returns (uint256 liquidity);
}