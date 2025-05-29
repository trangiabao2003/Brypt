require("@nomiclabs/hardhat-waffle");

module.exports = {
	solidity: "0.8.0",
	networks: {
		sepolia: {
			url: "https://sepolia.infura.io/v3/fbbd4b90658841e1a9937c1a8bcd47cd",
			accounts: [
				"bac4860a0ce3b08161b868f6bf2ea8161d07ad12ce3a2171f9f711ca5ba63b55",
			],
		},
	},
};
