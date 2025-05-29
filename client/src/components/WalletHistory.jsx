import React, { useContext, useMemo } from "react";
import { TransactionContext } from "../context/TransactionContext";
import { shortenAddress } from "../utils/shortenAddress";
import { FaRegPaperPlane } from "react-icons/fa";

const WalletHistory = () => {
	const { transactions, currentAccount } = useContext(TransactionContext);
	const filtered = useMemo(() => {
		if (!currentAccount) return [];
		return transactions.filter(
			(tx) =>
				tx.addressFrom?.toLowerCase() === currentAccount.toLowerCase() ||
				tx.addressTo?.toLowerCase() === currentAccount.toLowerCase()
		);
	}, [transactions, currentAccount]);

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#181818] via-[#23272f] to-[#181818] py-8">
			<div className="relative w-full max-w-3xl">
				{/* Animated border gradient */}
				<div className="absolute inset-0 rounded-3xl blur-[2px] z-0 animate-gradient-x bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-blue-500 via-purple-500 to-pink-500 opacity-70"></div>
				{/* Glassmorphism card */}
				<div className="relative z-10 bg-[#23272f]/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-[#31343c]">
					<h2 className="text-white text-3xl font-extrabold mb-8 text-center tracking-wide drop-shadow-lg">
						<span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
							Your transaction history
						</span>
					</h2>
					{!currentAccount ? (
						<p className="text-gray-400 text-center py-8 text-lg">
							Please connect your wallet to view transaction history.
						</p>
					) : filtered.length === 0 ? (
						<p className="text-gray-400 text-center py-8 text-lg">
							There are no transactions associated with this wallet.
						</p>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-white text-sm rounded-2xl overflow-hidden shadow-xl">
								<thead>
									<tr className="bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 text-white">
										<th className="py-3 px-2 text-left rounded-tl-2xl">From</th>
										<th className="py-3 px-2 text-left">To</th>
										<th className="py-3 px-2 text-right">Amount</th>
										<th className="py-3 px-2 text-right">Time</th>
										<th className="py-3 px-2 text-right rounded-tr-2xl">
											Message
										</th>
									</tr>
								</thead>
								<tbody>
									{filtered.map((tx, idx) => (
										<tr
											key={idx}
											className={`transition-all duration-200 ${
												idx % 2 === 0 ? "bg-[#23272f]/80" : "bg-[#23272f]/60"
											} hover:bg-gradient-to-r hover:from-blue-900 hover:to-pink-900`}>
											<td className="py-3 px-2 flex items-center gap-2 font-mono">
												<FaRegPaperPlane className="text-blue-400" />
												{shortenAddress(tx.addressFrom)}
											</td>
											<td className="py-3 px-2 font-mono">
												{shortenAddress(tx.addressTo)}
											</td>
											<td className="py-3 px-2 text-right font-semibold">
												<span className="bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">
													{tx.amount} ETH
												</span>
											</td>
											<td className="py-3 px-2 text-right">{tx.timestamp}</td>
											<td className="py-3 px-2 text-right">{tx.message}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>
			<style>
				{`
                @keyframes gradient-x {
                    0%, 100% {background-position: 0% 50%;}
                    50% {background-position: 100% 50%;}
                }
                .animate-gradient-x {
                    background-size: 200% 200%;
                    animation: gradient-x 6s ease-in-out infinite;
                }
                `}
			</style>
		</div>
	);
};

export default WalletHistory;
