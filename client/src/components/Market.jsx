import React, { useEffect, useState } from "react";

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
		// Không dùng setInterval nữa
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
				<polyline fill="none" stroke={color} strokeWidth="2" points={points} />
			</svg>
		);
	};

	return (
		<div className="w-full flex justify-center items-center py-8 bg-[#181818] min-h-screen">
			<div className="bg-[#23272f] rounded-xl p-6 w-full max-w-7xl shadow-lg">
				<h2 className="text-white text-3xl font-bold mb-2 text-center">
					Brypt Market
				</h2>
				<div className="flex justify-between items-center mb-4">
					{lastUpdate && (
						<p className="text-gray-400 text-sm">
							Last update: {lastUpdate.toLocaleTimeString()}
						</p>
					)}
					<button
						onClick={fetchCoins}
						className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
						disabled={loading}>
						{loading ? "Đang làm mới..." : "Làm mới"}
					</button>
				</div>
				{loading ? (
					<p className="text-white text-center">Loading...</p>
				) : (
					<table className="w-full text-white table-auto">
						<thead>
							<tr className="border-b border-gray-700 text-sm">
								<th className="py-2 px-2 text-left">#</th>
								<th className="py-2 px-2 text-left">Tiền ảo</th>
								<th className="py-2 px-2 text-right">Giá</th>
								<th className="py-2 px-2 text-right">1g</th>
								<th className="py-2 px-2 text-right">24g</th>
								<th className="py-2 px-2 text-right">7ng</th>
								<th className="py-2 px-2 text-right">
									Khối lượng giao dịch 24h
								</th>
								<th className="py-2 px-2 text-right">
									Giá trị vốn hóa thị trường
								</th>
								<th className="py-2 px-2 text-right">7 ngày qua</th>
							</tr>
						</thead>
						<tbody>
							{coins.map((coin, idx) => (
								<tr
									key={coin.id}
									className="border-b border-gray-800 hover:bg-[#2a2e39] text-sm">
									<td className="py-2 px-2">{idx + 1}</td>
									<td className="py-2 px-2 flex items-center">
										<img
											src={coin.image}
											alt={coin.name}
											className="w-6 h-6 mr-2"
										/>
										<span className="font-bold">{coin.name}</span>
										<span className="ml-2 text-gray-400 text-xs">
											{coin.symbol.toUpperCase()}
										</span>
									</td>
									<td className="py-2 px-2 text-right">
										{coin.current_price.toLocaleString("en-US", {
											style: "currency",
											currency: "USD",
										})}
									</td>
									<td
										className={`py-2 px-2 text-right ${
											coin.price_change_percentage_1h_in_currency > 0
												? "text-green-400"
												: "text-red-400"
										}`}>
										{coin.price_change_percentage_1h_in_currency?.toFixed(2)}%
									</td>
									<td
										className={`py-2 px-2 text-right ${
											coin.price_change_percentage_24h_in_currency > 0
												? "text-green-400"
												: "text-red-400"
										}`}>
										{coin.price_change_percentage_24h_in_currency?.toFixed(2)}%
									</td>
									<td
										className={`py-2 px-2 text-right ${
											coin.price_change_percentage_7d_in_currency > 0
												? "text-green-400"
												: "text-red-400"
										}`}>
										{coin.price_change_percentage_7d_in_currency?.toFixed(2)}%
									</td>
									<td className="py-2 px-2 text-right">
										{coin.total_volume.toLocaleString("en-US", {
											style: "currency",
											currency: "USD",
										})}
									</td>
									<td className="py-2 px-2 text-right">
										{coin.market_cap.toLocaleString("en-US", {
											style: "currency",
											currency: "USD",
										})}
									</td>
									<td className="py-2 px-2 text-right">
										{renderSparkline(coin.sparkline_in_7d?.price)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
};

export default Market;
