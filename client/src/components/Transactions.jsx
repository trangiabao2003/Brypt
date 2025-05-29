import React, { useContext } from "react";
import { TransactionContext } from "../context/TransactionContext";
import useFetch from "../hooks/useFetch";
import dummyData from "../utils/dummyData";
import { shortenAddress } from "../utils/shortenAddress";

const TransactionsCard = ({
	addressTo,
	addressFrom,
	timestamp,
	message,
	keyword,
	amount,
	url,
}) => {
	const gifUrl = useFetch({ keyword });

	return (
		<div className="relative bg-[#23272f]/90 backdrop-blur-xl m-4 flex flex-1 2xl:min-w-[420px] 2xl:max-w-[420px] sm:min-w-[270px] sm:max-w-[300px] min-w-full flex-col p-4 rounded-3xl border border-[#31343c] shadow-2xl transition-all duration-200 hover:scale-105 hover:border-blue-400 group overflow-hidden">
			{/* Animated border gradient */}
			<div className="absolute inset-0 rounded-3xl blur-[2px] z-0 animate-gradient-x bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-blue-500 via-purple-500 to-pink-500 opacity-40 pointer-events-none"></div>
			<div className="relative z-10 flex flex-col items-center w-full mt-2">
				<div className="w-full mb-4">
					<a
						href={`https://sepolia.etherscan.io/address/${addressFrom}`}
						target="_blank"
						rel="noreferrer"
						className="block mb-1">
						<p className="text-white text-sm font-mono">
							From:{" "}
							<span className="underline hover:text-blue-400">
								{shortenAddress(addressFrom)}
							</span>
						</p>
					</a>
					<a
						href={`https://sepolia.etherscan.io/address/${addressTo}`}
						target="_blank"
						rel="noreferrer"
						className="block mb-1">
						<p className="text-white text-sm font-mono">
							To:{" "}
							<span className="underline hover:text-pink-400">
								{shortenAddress(addressTo)}
							</span>
						</p>
					</a>
					<p className="text-white text-base font-bold">
						Amount:{" "}
						<span className="bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">
							{amount} ETH
						</span>
					</p>
					{message && (
						<p className="text-gray-300 text-sm mt-2 italic">"{message}"</p>
					)}
				</div>
				<img
					src={gifUrl || url}
					alt="transaction gif"
					className="w-full h-56 2xl:h-72 rounded-2xl shadow-lg object-cover border-2 border-[#31343c] group-hover:border-blue-400 transition"
				/>
				<div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-2 px-6 w-max rounded-2xl -mt-6 shadow-2xl border-2 border-[#23272f] relative z-20">
					<p className="text-white font-bold text-sm font-mono">{timestamp}</p>
				</div>
			</div>
		</div>
	);
};

const Transactions = () => {
	const { transactions, currentAccount } = useContext(TransactionContext);

	return (
		<div className="flex w-full justify-center items-center min-h-screen bg-gradient-to-br from-[#181818] via-[#23272f] to-[#181818] py-12">
			<div className="relative w-full max-w-7xl">
				{/* Animated border gradient */}
				<div className="absolute inset-0 rounded-3xl blur-[2px] z-0 animate-gradient-x bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-blue-500 via-purple-500 to-pink-500 opacity-60"></div>
				<div className="relative z-10 flex flex-col md:p-12 py-12 px-4">
					{currentAccount ? (
						<h3 className="text-white text-4xl font-extrabold text-center mb-8 drop-shadow-lg">
							<span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
								Latest Transactions
							</span>
						</h3>
					) : (
						<h3 className="text-white text-3xl text-center my-8">
							Connect your account to see the latest transactions
						</h3>
					)}
					<div className="flex flex-wrap justify-center items-center mt-6">
						{[...dummyData, ...transactions].reverse().map((transaction, i) => (
							<TransactionsCard key={i} {...transaction} />
						))}
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
		</div>
	);
};

export default Transactions;
