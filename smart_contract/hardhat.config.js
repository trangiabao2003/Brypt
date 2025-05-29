require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

const { INFURA_API_ENDPOINT, PRIVATE_KEY } = process.env;
module.exports = {
	solidity: "0.8.0",
	networks: {
		sepolia: {
			url: INFURA_API_ENDPOINT,
			accounts: [
				PRIVATE_KEY
			],
		},
	},
};
