import React, { useState } from "react";
import { ethers } from "ethers";
import { FaExchangeAlt } from "react-icons/fa";
import { BsFillLightningChargeFill } from "react-icons/bs";

const UNISWAP_V3_ROUTER = "0x35cC3bAC57F34d306218aF359C5215025c90a782";

const ERC20_ABI = [
	"function approve(address spender, uint256 amount) external returns (bool)",
	"function allowance(address owner, address spender) external view returns (uint256)",
	"function balanceOf(address owner) external view returns (uint256)",
	"function decimals() view returns (uint8)",
];

const Exchange = () => {
	const [tokenIn, setTokenIn] = useState("");
	const [tokenOut, setTokenOut] = useState("");
	const [amountIn, setAmountIn] = useState("");
	const [txHash, setTxHash] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSwap = async () => {
		if (!window.ethereum) return alert("Cần cài MetaMask");
		setLoading(true);
		try {
			const provider = new ethers.BrowserProvider(window.ethereum);
			const signer = await provider.getSigner();
			const user = await signer.getAddress();

			const tokenInContract = new ethers.Contract(tokenIn, ERC20_ABI, signer);
			const decimals = await tokenInContract.decimals();
			const amount = ethers.parseUnits(amountIn, decimals);

			const allowance = await tokenInContract.allowance(
				user,
				UNISWAP_V3_ROUTER
			);
			if (allowance < amount) {
				const txApprove = await tokenInContract.approve(
					UNISWAP_V3_ROUTER,
					amount
				);
				await txApprove.wait();
			}

			const routerAbi = [
				"function exactInputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) payable returns (uint256 amountOut)",
			];
			const router = new ethers.Contract(UNISWAP_V3_ROUTER, routerAbi, signer);

			const params = {
				tokenIn,
				tokenOut,
				fee: 3000,
				recipient: user,
				deadline: Math.floor(Date.now() / 1000) + 60 * 10,
				amountIn: amount,
				amountOutMinimum: 0,
				sqrtPriceLimitX96: 0,
			};

			const tx = await router.exactInputSingle(params, {
				value: tokenIn === ethers.ZeroAddress ? amount : 0n,
			});
			await tx.wait();
			setTxHash(tx.hash);
			alert("Swap thành công!");
		} catch (err) {
			console.error(err);
			alert("Swap thất bại: " + err.message);
		}
		setLoading(false);
	};

	const handleSwitch = () => {
		const temp = tokenIn;
		setTokenIn(tokenOut);
		setTokenOut(temp);
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#181818] via-[#23272f] to-[#181818] py-8">
			<div className="relative w-full max-w-md">
				{/* Animated border gradient */}
				<div className="absolute inset-0 rounded-3xl blur-[2px] z-0 animate-gradient-x bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-blue-500 via-purple-500 to-pink-500 opacity-70"></div>
				{/* Glassmorphism card */}
				<div className="relative z-10 bg-[#23272f]/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-[#31343c]">
					<h2 className="text-white text-4xl font-extrabold mb-8 text-center tracking-wide drop-shadow-lg">
						<span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
							Swap Coins
						</span>
					</h2>
					{/* Token In */}
					<div className="mb-6">
						<div className="flex items-center gap-3 mb-2">
							<div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-800 flex items-center justify-center text-white font-extrabold text-xl shadow-lg border-2 border-blue-400">
								{tokenIn ? (
									tokenIn.slice(2, 4).toUpperCase()
								) : (
									<BsFillLightningChargeFill />
								)}
							</div>
							<label className="text-gray-300 text-base font-semibold">
								Token In Address
							</label>
						</div>
						<input
							className="w-full mb-2 p-3 rounded-xl bg-[#181c23]/80 text-white border border-[#31343c] focus:outline-none focus:ring-2 focus:ring-blue-400 transition font-mono"
							placeholder="0x... (Address token want to swap)"
							value={tokenIn}
							onChange={(e) => setTokenIn(e.target.value)}
						/>
					</div>
					{/* Switch Button */}
					<div className="flex justify-center mb-6">
						<button
							className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-blue-600 hover:to-pink-500 text-white rounded-full p-4 shadow-xl transition transform hover:scale-125 border-4 border-[#23272f] -my-2"
							onClick={handleSwitch}
							title="Đổi chiều swap">
							<FaExchangeAlt size={28} className="animate-spin-slow" />
						</button>
					</div>
					{/* Token Out */}
					<div className="mb-6">
						<div className="flex items-center gap-3 mb-2">
							<div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-800 flex items-center justify-center text-white font-extrabold text-xl shadow-lg border-2 border-pink-400">
								{tokenOut ? (
									tokenOut.slice(2, 4).toUpperCase()
								) : (
									<BsFillLightningChargeFill />
								)}
							</div>
							<label className="text-gray-300 text-base font-semibold">
								Token Out Address
							</label>
						</div>
						<input
							className="w-full mb-2 p-3 rounded-xl bg-[#181c23]/80 text-white border border-[#31343c] focus:outline-none focus:ring-2 focus:ring-pink-400 transition font-mono"
							placeholder="0x... (Adress token want to receive)"
							value={tokenOut}
							onChange={(e) => setTokenOut(e.target.value)}
						/>
					</div>
					{/* Amount */}
					<div className="mb-8">
						<label className="text-gray-300 text-base font-semibold mb-1 block">
							Amount In
						</label>
						<input
							className="w-full p-3 rounded-xl bg-[#181c23]/80 text-white border border-[#31343c] focus:outline-none focus:ring-2 focus:ring-purple-400 transition font-mono"
							placeholder="Amount want to swap"
							value={amountIn}
							onChange={(e) => setAmountIn(e.target.value)}
						/>
					</div>
					{/* Swap Button */}
					<button
						className={`bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl w-full font-extrabold text-xl shadow-2xl transition-all duration-200 ${
							loading
								? "opacity-60 cursor-not-allowed"
								: "hover:from-pink-500 hover:to-blue-600 scale-105"
						}`}
						onClick={handleSwap}
						disabled={loading}>
						{loading ? (
							<span className="flex items-center justify-center gap-2">
								<svg
									className="inline animate-spin"
									width="24"
									height="24"
									viewBox="0 0 24 24">
									<circle
										cx="12"
										cy="12"
										r="10"
										stroke="#fff"
										strokeWidth="4"
										fill="none"
									/>
								</svg>
								Swapping...
							</span>
						) : (
							<span className="flex items-center justify-center gap-2">
								<FaExchangeAlt size={22} />
								Swap Now
							</span>
						)}
					</button>
					{/* Tx Hash */}
					{txHash && (
						<p className="text-green-400 mt-6 break-all text-center font-mono text-base">
							Tx:{" "}
							<a
								href={`https://sepolia.etherscan.io/tx/${txHash}`}
								target="_blank"
								rel="noopener noreferrer"
								className="underline hover:text-pink-400">
								{txHash}
							</a>
						</p>
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
                .animate-spin-slow {
                    animation: spin 2.5s linear infinite;
                }
                `}
			</style>
		</div>
	);
};

export default Exchange;
