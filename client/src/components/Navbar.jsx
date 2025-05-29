import React from "react";
import { HiMenuAlt4 } from "react-icons/hi";
import { AiOutlineClose } from "react-icons/ai";
import logo from "../../images/logo.png";
import { Link, useLocation } from "react-router-dom";

const navItems = [
	{ title: "Home", path: "/" },
	{ title: "Market", path: "/market" },
	{ title: "Wallet", path: "/wallet" },
	{ title: "Exchange", path: "/exchange" },
];

const Navbar = () => {
	const [toggleMenu, setToggleMenu] = React.useState(false);
	const location = useLocation();

	return (
		<nav className="w-full flex md:justify-center justify-between items-center px-4 py-3 bg-[#181c23]/70 backdrop-blur-xl shadow-lg border-b border-[#23272f] relative z-50">
			{/* Logo */}
			<div className="md:flex-[0.5] flex-initial flex items-center gap-2">
				<img
					src={logo}
					alt="logo"
					className="w-32 h-auto cursor-pointer drop-shadow-lg"
				/>
				<span className="hidden md:inline-block text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text font-extrabold text-2xl tracking-wide ml-2 select-none">
					Brypt
				</span>
			</div>
			{/* Desktop Menu */}
			<ul className="text-white md:flex hidden list-none flex-row justify-between items-center flex-initial">
				{navItems.map((item) => (
					<li key={item.title} className="mx-3">
						<Link
							to={item.path}
							className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
								location.pathname === item.path
									? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg"
									: "hover:bg-gradient-to-r hover:from-blue-700 hover:to-pink-700 hover:text-white"
							}`}>
							{item.title}
						</Link>
					</li>
				))}
			</ul>
			{/* Mobile Menu Button */}
			<div className="flex md:hidden">
				{!toggleMenu ? (
					<HiMenuAlt4
						fontSize={28}
						className="text-white cursor-pointer transition hover:scale-110"
						onClick={() => setToggleMenu(true)}
					/>
				) : (
					<AiOutlineClose
						fontSize={28}
						className="text-white cursor-pointer transition hover:scale-110"
						onClick={() => setToggleMenu(false)}
					/>
				)}
			</div>
			{/* Mobile Menu */}
			{toggleMenu && (
				<div className="fixed top-0 right-0 w-[75vw] max-w-xs h-screen bg-[#23272f]/95 backdrop-blur-xl shadow-2xl z-50 animate-slide-in flex flex-col">
					<div className="flex justify-between items-center px-6 py-4 border-b border-[#31343c]">
						<img src={logo} alt="logo" className="w-24 h-auto" />
						<AiOutlineClose
							fontSize={28}
							className="text-white cursor-pointer"
							onClick={() => setToggleMenu(false)}
						/>
					</div>
					<ul className="flex flex-col gap-2 mt-6 px-6">
						{navItems.map((item) => (
							<li key={item.title}>
								<Link
									to={item.path}
									className={`block px-4 py-3 rounded-xl font-semibold text-lg transition-all duration-200 ${
										location.pathname === item.path
											? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg"
											: "hover:bg-gradient-to-r hover:from-blue-700 hover:to-pink-700 hover:text-white"
									}`}
									onClick={() => setToggleMenu(false)}>
									{item.title}
								</Link>
							</li>
						))}
					</ul>
				</div>
			)}
			<style>
				{`
                @keyframes slide-in {
                    0% { transform: translateX(100%);}
                    100% { transform: translateX(0);}
                }
                .animate-slide-in {
                    animation: slide-in 0.3s cubic-bezier(0.4,0,0.2,1);
                }
                `}
			</style>
		</nav>
	);
};

export default Navbar;
