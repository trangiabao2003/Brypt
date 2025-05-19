// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ITokenFactory
 * @dev Giao diện cho hợp đồng TokenFactory
 */
interface ITokenFactory {
    /**
     * @dev Tạo một token ERC20 mới
     * @param name Tên của token
     * @param symbol Ký hiệu của token
     * @param initialSupply Số lượng token ban đầu được tạo ra
     * @param decimals Số thập phân của token
     * @return address của token mới
     */
    function createToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint8 decimals
    ) external returns (address);
    
    /**
     * @dev Lấy địa chỉ của token dựa trên ký hiệu
     * @param symbol Ký hiệu của token cần tìm
     * @return address của token
     */
    function getTokenAddress(string memory symbol) external view returns (address);
}