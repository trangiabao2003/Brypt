import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

const createEthereumContract = async () => {
	if (!window.ethereum) {
		throw new Error(
			"Không tìm thấy nhà cung cấp Ethereum. Vui lòng cài MetaMask."
		);
	}

	// Sử dụng BrowserProvider cho ethers.js v6
	const provider = new ethers.BrowserProvider(window.ethereum);
	const signer = await provider.getSigner(); // getSigner là async trong v6
	const transactionsContract = new ethers.Contract(
		contractAddress,
		contractABI,
		signer
	);

	return transactionsContract;
};

export const TransactionsProvider = ({ children }) => {
	const [formData, setFormData] = useState({
		addressTo: "",
		amount: "",
		keyword: "",
		message: "",
	});
	const [currentAccount, setCurrentAccount] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [transactionCount, setTransactionCount] = useState(
		localStorage.getItem("transactionCount") || 0
	);
	const [transactions, setTransactions] = useState([]);

	const handleChange = (e, name) => {
		setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
	};

	const getAllTransactions = async () => {
		try {
			if (!window.ethereum) {
				console.error("Không tìm thấy nhà cung cấp Ethereum.");
				return;
			}

			const transactionsContract = await createEthereumContract();
			const availableTransactions =
				await transactionsContract.getAllTransactions();

			const structuredTransactions = availableTransactions.map(
				(transaction) => ({
					addressTo: transaction.receiver,
					addressFrom: transaction.sender,
					timestamp: new Date(
						Number(transaction.timestamp) * 1000
					).toLocaleString(),
					message: transaction.message,
					keyword: transaction.keyword,
					// amount: parseInt(transaction.amount._hex) / 10 ** 18,
					amount:
						Number(transaction.amount?.toString?.() ?? transaction.amount) /
						10 ** 18,
				})
			);
			localStorage.setItem(
				"transactions",
				JSON.stringify(structuredTransactions)
			);
			console.log(structuredTransactions);
			setTransactions(structuredTransactions);
		} catch (error) {
			console.error("Lỗi khi lấy giao dịch:", error);
		}
	};

	const checkIfWalletIsConnected = async () => {
		try {
			if (!window.ethereum) {
				alert("Vui lòng cài MetaMask.");
				return;
			}

			const accounts = await window.ethereum.request({
				method: "eth_accounts",
			});

			if (accounts.length) {
				setCurrentAccount(accounts[0]);
				await getAllTransactions();
			} else {
				console.log("Không tìm thấy tài khoản.");
			}
		} catch (error) {
			console.error("Lỗi khi kiểm tra kết nối ví:", error);
		}
	};

	const checkIfTransactionsExists = async () => {
		try {
			if (!window.ethereum) {
				console.error("Không tìm thấy nhà cung cấp Ethereum.");
				return;
			}

			const transactionsContract = await createEthereumContract();
			const currentTransactionCount =
				await transactionsContract.getTransactionCount();

			window.localStorage.setItem(
				"transactionCount",
				currentTransactionCount.toString()
			);
			setTransactionCount(currentTransactionCount.toString());
		} catch (error) {
			console.error("Lỗi khi kiểm tra giao dịch:", error);
		}
	};

	const connectWallet = async () => {
		try {
			if (!window.ethereum) {
				alert("Vui lòng cài MetaMask.");
				return;
			}

			const accounts = await window.ethereum.request({
				method: "eth_requestAccounts",
			});

			setCurrentAccount(accounts[0]);
			window.location.reload();
		} catch (error) {
			console.error("Lỗi khi kết nối ví:", error);
		}
	};

	const sendTransaction = async () => {
		try {
			if (!window.ethereum) {
				alert("Vui lòng cài MetaMask.");
				return;
			}

			const { addressTo, amount, keyword, message } = formData;
			const transactionsContract = await createEthereumContract();
			const parsedAmount = ethers.parseEther(amount);

			await window.ethereum.request({
				method: "eth_sendTransaction",
				params: [
					{
						from: currentAccount,
						to: addressTo,
						gas: "0x5208",
						value: parsedAmount.toString(),
					},
				],
			});

			const transactionHash = await transactionsContract.addToBlockchain(
				addressTo,
				parsedAmount,
				message,
				keyword
			);

			setIsLoading(true);
			console.log(`Đang xử lý - ${transactionHash.hash}`);
			await transactionHash.wait();
			console.log(`Thành công - ${transactionHash.hash}`);
			setIsLoading(false);
			await getAllTransactions();

			const transactionsCount =
				await transactionsContract.getTransactionCount();
			setTransactionCount(transactionsCount.toNumber());
			window.location.reload();
		} catch (error) {
			console.error("Lỗi khi gửi giao dịch:", error);
		}
	};

	useEffect(() => {
		const localTx = localStorage.getItem("transactions");
		if (localTx) {
			setTransactions(JSON.parse(localTx));
		}
		getAllTransactions();
		checkIfWalletIsConnected();
		checkIfTransactionsExists();
	}, []);

	return (
		<TransactionContext.Provider
			value={{
				transactionCount,
				connectWallet,
				transactions,
				currentAccount,
				isLoading,
				sendTransaction,
				handleChange,
				formData,
			}}>
			{children}
		</TransactionContext.Provider>
	);
};
