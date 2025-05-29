import React, { useEffect, useState } from "react";
import { FaSyncAlt } from "react-icons/fa";

const Market = () => {
	const [coins, setCoins] = useState([]);
	const [loading, setLoading] = useState(true);
	const [lastUpdate, setLastUpdate] = useState(null);

	const fetchCoins = async () => {
		setLoading(true);
		try {
			const res = await fetch(
				"https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=1h,24h,7d"
			);
			const data = await res.json();
			setCoins(data);
			setLastUpdate(new Date());
		} catch (err) {
			setCoins([]);
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchCoins();
	}, []);

	// Hàm vẽ sparkline đơn giản bằng SVG
	const renderSparkline = (prices) => {
		if (!prices || prices.length === 0) return null;
		const max = Math.max(...prices);
		const min = Math.min(...prices);
		const norm = prices.map(
			(p) => 40 - ((p - min) / (max - min === 0 ? 1 : max - min)) * 40
		);
		const points = norm
			.map((y, i) => `${(i * 100) / (norm.length - 1)},${y}`)
			.join(" ");
		const color = prices[0] < prices[prices.length - 1] ? "#22c55e" : "#ef4444";
		return (
			<svg width="100" height="40" viewBox="0 0 100 40">
				<polyline
					fill="none"
					stroke={color}
					strokeWidth="2.5"
					points={points}
				/>
			</svg>
		);
	};

	return (
		<div className="w-full flex justify-center items-center py-8 min-h-screen bg-gradient-to-br from-[#181818] via-[#23272f] to-[#181818]">
			<div className="relative w-full max-w-7xl">
				{/* Animated border gradient */}
				<div className="absolute inset-0 rounded-3xl blur-[2px] z-0 animate-gradient-x bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-blue-500 via-purple-500 to-pink-500 opacity-70"></div>
				{/* Glassmorphism card */}
				<div className="relative z-10 bg-[#23272f]/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-[#31343c]">
					<h2 className="text-white text-4xl font-extrabold mb-6 text-center tracking-wide drop-shadow-lg">
						<span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
							Brypt Market
						</span>
					</h2>
					<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-2">
						{lastUpdate && (
							<p className="text-gray-400 text-sm">
								Cập nhật lúc: {lastUpdate.toLocaleTimeString()}
							</p>
						)}
						<button
							onClick={fetchCoins}
							className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-pink-500 hover:from-pink-500 hover:to-blue-500 text-white px-5 py-2 rounded-xl font-bold shadow-lg transition-all duration-200 focus:outline-none disabled:opacity-60"
							disabled={loading}>
							{loading ? (
								<span className="flex items-center gap-2">
									<svg
										className="animate-spin"
										width="18"
										height="18"
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
									Đang làm mới...
								</span>
							) : (
								<>
									<FaSyncAlt />
									Làm mới
								</>
							)}
						</button>
					</div>
					{loading ? (
						<p className="text-white text-center py-10 text-xl font-mono">
							Đang tải dữ liệu...
						</p>
					) : (
						<div className="overflow-x-auto rounded-2xl">
							<table className="w-full text-white text-sm rounded-2xl overflow-hidden shadow-xl">
								<thead>
									<tr className="bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 text-white">
										<th className="py-3 px-2 text-left rounded-tl-2xl">#</th>
										<th className="py-3 px-2 text-left">Tiền ảo</th>
										<th className="py-3 px-2 text-right">Giá</th>
										<th className="py-3 px-2 text-right">1h</th>
										<th className="py-3 px-2 text-right">24h</th>
										<th className="py-3 px-2 text-right">7n</th>
										<th className="py-3 px-2 text-right">Khối lượng 24h</th>
										<th className="py-3 px-2 text-right">Vốn hóa</th>
										<th className="py-3 px-2 text-right rounded-tr-2xl">
											7 ngày qua
										</th>
									</tr>
								</thead>
								<tbody>
									{coins.map((coin, idx) => (
										<tr
											key={coin.id}
											className={`transition-all duration-200 ${
												idx % 2 === 0 ? "bg-[#23272f]/80" : "bg-[#23272f]/60"
											} hover:bg-gradient-to-r hover:from-blue-900 hover:to-pink-900`}>
											<td className="py-3 px-2 font-bold">{idx + 1}</td>
											<td className="py-3 px-2 flex items-center gap-3">
												<img
													src={coin.image}
													alt={coin.name}
													className="w-8 h-8 rounded-full shadow-lg border-2 border-blue-400 bg-white"
												/>
												<div>
													<span className="font-bold text-base">
														{coin.name}
													</span>
													<span className="ml-2 text-gray-400 text-xs font-mono">
														{coin.symbol.toUpperCase()}
													</span>
												</div>
											</td>
											<td className="py-3 px-2 text-right font-mono font-semibold">
												{coin.current_price.toLocaleString("en-US", {
													style: "currency",
													currency: "USD",
												})}
											</td>
											<td
												className={`py-3 px-2 text-right font-semibold ${
													coin.price_change_percentage_1h_in_currency > 0
														? "text-green-400"
														: "text-red-400"
												}`}>
												{coin.price_change_percentage_1h_in_currency?.toFixed(
													2
												)}
												%
											</td>
											<td
												className={`py-3 px-2 text-right font-semibold ${
													coin.price_change_percentage_24h_in_currency > 0
														? "text-green-400"
														: "text-red-400"
												}`}>
												{coin.price_change_percentage_24h_in_currency?.toFixed(
													2
												)}
												%
											</td>
											<td
												className={`py-3 px-2 text-right font-semibold ${
													coin.price_change_percentage_7d_in_currency > 0
														? "text-green-400"
														: "text-red-400"
												}`}>
												{coin.price_change_percentage_7d_in_currency?.toFixed(
													2
												)}
												%
											</td>
											<td className="py-3 px-2 text-right font-mono">
												{coin.total_volume.toLocaleString("en-US", {
													style: "currency",
													currency: "USD",
												})}
											</td>
											<td className="py-3 px-2 text-right font-mono">
												{coin.market_cap.toLocaleString("en-US", {
													style: "currency",
													currency: "USD",
												})}
											</td>
											<td className="py-3 px-2 text-right">
												{renderSparkline(coin.sparkline_in_7d?.price)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
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

export default Market;
