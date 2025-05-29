import {
	Navbar,
	Footer,
	Welcome,
	Transactions,
	Services,
	Market,
	WalletHistory,
	Exchange,
} from "./components";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { TransactionsProvider } from "./context/TransactionContext";
const App = () => {
	return (
		// <div className="min-h-screen">
		// 	<div className="gradient-bg-welcome">
		// 		<Navbar />
		// 		<Welcome />
		// 		<Market />
		// 	</div>
		// 	<Services />
		// 	<Transactions />
		// 	<Footer />
		// </div>
		<TransactionsProvider>
			<Router>
				<div className="min-h-screen">
					<div className="gradient-bg-welcome">
						<Navbar />
						<Routes>
							<Route path="/" element={<Welcome />} />
							<Route path="/market" element={<Market />} />
							<Route path="/wallet" element={<WalletHistory />} />
							<Route path="/exchange" element={<Exchange />} />
						</Routes>
					</div>
					<Services />
					<Transactions />
					<Footer />
				</div>
			</Router>
		</TransactionsProvider>
	);
};

export default App;
