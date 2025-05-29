import React from "react";
import logo from "../../images/logo.png";

const Footer = () => (
	<div className="w-full flex flex-col items-center justify-center bg-[#181c23]/80 backdrop-blur-xl border-t border-[#23272f] relative pt-10 pb-4">
		{/* Animated border gradient */}
		<div className="absolute inset-0 rounded-t-3xl blur-[2px] z-0 animate-gradient-x bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-blue-500 via-purple-500 to-pink-500 opacity-50 pointer-events-none"></div>
		<div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
			<div className="flex flex-col sm:flex-row w-full justify-between items-center mb-6 gap-6">
				<div className="flex items-center gap-3">
					<img src={logo} alt="logo" className="w-32 h-auto drop-shadow-lg" />
					<span className="hidden sm:inline-block text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text font-extrabold text-2xl tracking-wide ml-2 select-none">
						Brypt
					</span>
				</div>
				<div className="flex flex-wrap gap-3 justify-center items-center">
					{["Market", "Exchange", "Tutorials", "Wallets"].map((item) => (
						<p
							key={item}
							className="text-white text-base font-semibold px-4 py-2 rounded-xl cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-500 hover:to-pink-500 hover:text-white shadow hover:scale-105">
							{item}
						</p>
					))}
				</div>
			</div>
			<div className="flex flex-col items-center mt-2">
				<p className="text-white text-sm text-center opacity-80">
					Come join us and hear for the unexpected miracle
				</p>
				<p className="text-white text-sm text-center font-medium mt-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
					info@Brypt.com
				</p>
			</div>
			<div className="w-full h-[2px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-60 my-6 rounded-full" />
			<div className="w-full flex flex-col sm:flex-row justify-between items-center gap-2">
				<p className="text-white text-xs opacity-70">@Brypt2025</p>
				<p className="text-white text-xs opacity-70">All rights reserved</p>
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

export default Footer;
