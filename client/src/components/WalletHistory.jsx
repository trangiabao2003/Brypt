import React, { useContext, useMemo } from "react";
import { TransactionContext } from "../context/TransactionContext";
import { shortenAddress } from "../utils/shortenAddress";

const WalletHistory = () => {
	const { transactions, currentAccount } = useContext(TransactionContext);
	// Lọc các giao dịch liên quan đến ví hiện tại
	const filtered = useMemo(() => {
		if (!currentAccount) return [];
		return transactions.filter(
			(tx) =>
				tx.addressFrom?.toLowerCase() === currentAccount.toLowerCase() ||
				tx.addressTo?.toLowerCase() === currentAccount.toLowerCase()
		);
	}, [transactions, currentAccount]);

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-[#181818] py-8">
			<div className="bg-[#23272f] rounded-xl p-6 w-full max-w-2xl shadow-lg">
				<h2 className="text-white text-2xl font-bold mb-4 text-center">
					Lịch sử giao dịch của bạn
				</h2>
				{!currentAccount ? (
					<p className="text-gray-400 text-center">
						Vui lòng kết nối ví để xem lịch sử giao dịch.
					</p>
				) : filtered.length === 0 ? (
					<p className="text-gray-400 text-center">
						Không có giao dịch nào liên quan đến ví này.
					</p>
				) : (
					<table className="w-full text-white text-sm">
						<thead>
							<tr className="border-b border-gray-700">
								<th className="py-2 px-2 text-left">From</th>
								<th className="py-2 px-2 text-left">To</th>
								<th className="py-2 px-2 text-right">Amount</th>
								<th className="py-2 px-2 text-right">Time</th>
								<th className="py-2 px-2 text-right">Message</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((tx, idx) => (
								<tr key={idx} className="border-b border-gray-800">
									<td className="py-2 px-2">
										{shortenAddress(tx.addressFrom)}
									</td>
									<td className="py-2 px-2">{shortenAddress(tx.addressTo)}</td>
									<td className="py-2 px-2 text-right">{tx.amount} ETH</td>
									<td className="py-2 px-2 text-right">{tx.timestamp}</td>
									<td className="py-2 px-2 text-right">{tx.message}</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
};

export default WalletHistory;
