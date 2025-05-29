import React, { useContext } from "react";
import { AiFillPlayCircle } from "react-icons/ai";
import { SiEthereum } from "react-icons/si";
import { BsInfoCircle } from "react-icons/bs";
import { TransactionContext } from "../context/TransactionContext";
import { shortenAddress } from "../utils/shortenAddress";
import { Loader } from ".";

const Input = ({ placeholder, name, type, value, handleChange }) => (
	<input
		placeholder={placeholder}
		type={type}
		step="0.0001"
		value={value}
		onChange={(e) => handleChange(e, name)}
		className="my-2 w-full rounded-xl p-3 outline-none bg-[#181c23]/80 text-white border border-[#31343c] focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono transition"
	/>
);

const Welcome = () => {
	const {
		currentAccount,
		connectWallet,
		handleChange,
		sendTransaction,
		formData,
		isLoading,
	} = useContext(TransactionContext);

	const handleSubmit = (e) => {
		const { addressTo, amount, keyword, message } = formData;
		e.preventDefault();
		if (!addressTo || !amount || !keyword || !message) return;
		sendTransaction();
	};

	return (
		<div className="flex w-full justify-center items-center min-h-screen bg-gradient-to-br from-[#181818] via-[#23272f] to-[#181818] relative">
			{/* Animated border gradient */}
			<div className="absolute inset-0 rounded-3xl blur-[2px] z-0 animate-gradient-x bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-blue-500 via-purple-500 to-pink-500 opacity-60"></div>
			<div className="flex mf:flex-row flex-col items-start justify-between md:p-20 py-12 px-4 relative z-10 w-full max-w-7xl">
				{/* Left */}
				<div className="flex flex-1 justify-start items-start flex-col mf:mr-10">
					<h1 className="text-4xl sm:text-6xl text-white font-extrabold mb-4 drop-shadow-lg">
						<span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
							Send Crypto <br /> across the world
						</span>
					</h1>
					<p className="text-left mt-5 text-gray-200 font-light md:w-9/12 w-11/12 text-lg">
						Khám phá thế giới crypto. Giao dịch coin nhanh chóng, an toàn, phí
						thấp cùng <span className="font-bold text-blue-400">Brypt</span>.
					</p>
					{!currentAccount && (
						<button
							type="button"
							onClick={connectWallet}
							className="flex flex-row justify-center items-center my-7 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-3 rounded-full cursor-pointer hover:scale-105 transition shadow-xl">
							<AiFillPlayCircle className="text-white mr-2" size={24} />
							<p className="text-white text-lg font-bold">Kết nối ví</p>
						</button>
					)}

					<div className="grid sm:grid-cols-3 grid-cols-2 w-full mt-10 gap-2">
						<div className="rounded-2xl bg-gradient-to-br from-blue-500/30 to-blue-900/10 border border-blue-400/40 p-4 flex flex-col items-center shadow">
							<span className="text-white font-bold text-lg">Reliability</span>
						</div>
						<div className="rounded-2xl bg-gradient-to-br from-purple-500/30 to-purple-900/10 border border-purple-400/40 p-4 flex flex-col items-center shadow">
							<span className="text-white font-bold text-lg">Security</span>
						</div>
						<div className="rounded-2xl bg-gradient-to-br from-pink-500/30 to-pink-900/10 border border-pink-400/40 p-4 flex flex-col items-center shadow">
							<span className="text-white font-bold text-lg">Ethereum</span>
						</div>
						<div className="rounded-2xl bg-gradient-to-br from-blue-400/30 to-blue-900/10 border border-blue-400/40 p-4 flex flex-col items-center shadow">
							<span className="text-white font-bold text-lg">Web 3.0</span>
						</div>
						<div className="rounded-2xl bg-gradient-to-br from-purple-400/30 to-purple-900/10 border border-purple-400/40 p-4 flex flex-col items-center shadow">
							<span className="text-white font-bold text-lg">Low Fees</span>
						</div>
						<div className="rounded-2xl bg-gradient-to-br from-pink-400/30 to-pink-900/10 border border-pink-400/40 p-4 flex flex-col items-center shadow">
							<span className="text-white font-bold text-lg">Blockchain</span>
						</div>
					</div>
				</div>
				{/* Right */}
				<div className="flex flex-col flex-1 items-center justify-start w-full mf:mt-0 mt-10">
					{/* Ethereum Card */}
					<div className="relative p-1 mb-6 w-full max-w-xs mx-auto rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-2xl animate-gradient-x">
						<div className="bg-[#23272f]/90 backdrop-blur-xl rounded-3xl p-6 h-44 flex flex-col justify-between">
							<div className="flex justify-between items-start">
								<div className="w-12 h-12 rounded-full border-2 border-white flex justify-center items-center bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
									<SiEthereum fontSize={28} color="#fff" />
								</div>
								<BsInfoCircle
									fontSize={20}
									color="#fff"
									className="opacity-80"
								/>
							</div>
							<div>
								<p className="text-white font-mono font-light text-base">
									{currentAccount ? shortenAddress(currentAccount) : "0x..."}
								</p>
								<p className="text-white font-bold text-xl mt-1 tracking-wide">
									Ethereum
								</p>
							</div>
						</div>
					</div>
					{/* Send Form */}
					<div className="p-6 w-full max-w-xs flex flex-col justify-start items-center bg-[#23272f]/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#31343c]">
						<Input
							placeholder="Địa chỉ nhận (Address To)"
							name="addressTo"
							type="text"
							handleChange={handleChange}
						/>
						<Input
							placeholder="Số lượng (ETH)"
							name="amount"
							type="number"
							handleChange={handleChange}
						/>
						<Input
							placeholder="Từ khóa (Gif)"
							name="keyword"
							type="text"
							handleChange={handleChange}
						/>
						<Input
							placeholder="Lời nhắn"
							name="message"
							type="text"
							handleChange={handleChange}
						/>
						<div className="h-[1px] w-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 my-3" />
						{isLoading ? (
							<Loader />
						) : (
							<button
								type="button"
								onClick={handleSubmit}
								className="w-full mt-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold py-3 rounded-2xl shadow-lg hover:scale-105 transition-all duration-200">
								Gửi ngay
							</button>
						)}
					</div>
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

export default Welcome;
