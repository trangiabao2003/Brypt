// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TokenFactory
 * @dev Hợp đồng để tạo ra các token ERC20 mới để sử dụng trong TokenSwap
 */

 /// @custom:dev-run-script scripts/deploy.js

contract TokenFactory is Ownable {
constructor() Ownable() {}
    // Mapping để lưu trữ các token đã tạo
    mapping(string => address) public createdTokens;
    
    // Sự kiện được kích hoạt khi một token mới được tạo
    event TokenCreated(string name, string symbol, address tokenAddress, uint256 initialSupply);
    
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
    ) external returns (address) {
        // Kiểm tra xem token đã tồn tại chưa
        require(createdTokens[symbol] == address(0), "TokenFactory: Token with this symbol already exists");
        
        // Tạo token mới
        CustomToken newToken = new CustomToken(name, symbol, initialSupply, decimals, msg.sender);
        
        // Lưu địa chỉ của token mới
        createdTokens[symbol] = address(newToken);
        
        // Kích hoạt sự kiện
        emit TokenCreated(name, symbol, address(newToken), initialSupply);
        
        return address(newToken);
    }
    
    /**
     * @dev Lấy địa chỉ của token dựa trên ký hiệu
     * @param symbol Ký hiệu của token cần tìm
     * @return address của token
     */
    function getTokenAddress(string memory symbol) external view returns (address) {
        return createdTokens[symbol];
    }
}

/**
 * @title CustomToken
 * @dev Token ERC20 tùy chỉnh với khả năng mint thêm token
 */
contract CustomToken is ERC20, Ownable {
    uint8 private _decimals;
    
    /**
     * @dev Khởi tạo token với các thông số nhất định
     * @param name Tên của token
     * @param symbol Ký hiệu của token
     * @param initialSupply Số lượng token ban đầu được tạo ra
     * @param tokenDecimals Số thập phân của token
     * @param initialOwner Chủ sở hữu ban đầu của tất cả token
     */
    constructor(
    string memory name,
    string memory symbol,
    uint256 initialSupply,
    uint8 tokenDecimals,
    address initialOwner
) ERC20(name, symbol) Ownable() {
    _decimals = tokenDecimals;
    _mint(initialOwner, initialSupply * (10 ** tokenDecimals));
}
    
    /**
     * @dev Ghi đè hàm decimals() để trả về số thập phân tùy chỉnh
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @dev Tạo thêm token và gán cho một địa chỉ
     * @param to Địa chỉ nhận token
     * @param amount Số lượng token cần tạo
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Đốt token từ một địa chỉ
     * @param from Địa chỉ bị đốt token
     * @param amount Số lượng token cần đốt
     */
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}