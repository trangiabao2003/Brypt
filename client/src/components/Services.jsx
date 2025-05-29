import React from "react";
import { BsShieldFillCheck } from "react-icons/bs";
import { BiSearchAlt } from "react-icons/bi";
import { RiHeart2Fill } from "react-icons/ri";

const ServiceCard = ({ color, title, icon, subtitle }) => (
	<div className="flex flex-row items-center bg-[#23272f]/90 backdrop-blur-xl rounded-2xl p-5 m-3 shadow-xl border border-[#31343c] transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:border-blue-400 group">
		<div
			className={`w-14 h-14 rounded-full flex justify-center items-center text-white text-2xl shadow-lg border-2 ${color} group-hover:scale-110 transition`}>
			{icon}
		</div>
		<div className="ml-6 flex flex-col flex-1">
			<h3 className="text-white text-xl font-bold mb-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
				{title}
			</h3>
			<p className="text-gray-300 text-base">{subtitle}</p>
		</div>
	</div>
);

const Services = () => (
	<div className="flex w-full justify-center items-center min-h-screen bg-gradient-to-br from-[#181818] via-[#23272f] to-[#181818] relative py-12">
		{/* Animated border gradient */}
		<div className="absolute inset-0 rounded-3xl blur-[2px] z-0 animate-gradient-x bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-blue-500 via-purple-500 to-pink-500 opacity-60"></div>
		<div className="relative z-10 flex mf:flex-row flex-col items-center justify-between md:p-20 py-12 px-4 w-full max-w-6xl">
			<div className="flex-1 flex flex-col justify-start items-start mb-10 mf:mb-0">
				<h1 className="text-4xl sm:text-5xl font-extrabold py-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
					Services that we
					<br />
					continue to improve
				</h1>
				<p className="text-left my-4 text-gray-200 font-light md:w-9/12 w-11/12 text-lg">
					The best choice for buying and selling your crypto assets, with the
					various super friendly services we offer.
				</p>
			</div>
			<div className="flex-1 flex flex-col justify-start items-center w-full max-w-md">
				<ServiceCard
					color="bg-gradient-to-br from-blue-500 to-blue-800 border-blue-400"
					title="Security Guarantee"
					icon={<BsShieldFillCheck fontSize={28} />}
					subtitle="Security is guaranteed. We always maintain privacy and the quality of our products."
				/>
				<ServiceCard
					color="bg-gradient-to-br from-purple-500 to-pink-500 border-purple-400"
					title="Best Exchange Rates"
					icon={<BiSearchAlt fontSize={28} />}
					subtitle="Get the best rates for your swaps, powered by leading DEX protocols."
				/>
				<ServiceCard
					color="bg-gradient-to-br from-pink-500 to-red-500 border-pink-400"
					title="Fastest Transactions"
					icon={<RiHeart2Fill fontSize={28} />}
					subtitle="Experience lightning-fast transactions with minimal fees and maximum reliability."
				/>
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

export default Services;
