const Loader = () => {
	return (
		<div className="flex justify-center items-center py-8">
			<div className="relative">
				<div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-transparent border-t-blue-500 border-b-pink-500 shadow-2xl" />
				<div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-30 blur-lg"></div>
			</div>
		</div>
	);
};

export default Loader;
