/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

const Input = ({ icon: Icon, type: propsType, ...props }) => {
	const [showPassword, setShowPassword] = useState(false);

	const toggleIcon = () => {
		setShowPassword((prev) => !prev);
	};

	const isLockIcon = Icon === Lock;// Check if the passed icon is Lock

	let type = "text";

	if (isLockIcon)
		type = showPassword ? "text" : "password";
	else if (propsType)
		type = propsType;

	return (
		<div className="relative mb-6">
			<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
				<Icon className="size-5 text-indigo-900" />
			</div>
			<input
				{...props}
				type={type}
				className="w-full pl-10 pr-10 py-2 bg-opacity-50 text-black rounded-lg border border-gray-700 focus:border-indigo-700 focus:ring-2 focus:ring-indigo-700 placeholder-gray-400 transition duration-200"
			/>
			{isLockIcon && (
				<div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer">
					{showPassword ? (
						<Eye className="size-5 text-indigo-900" onClick={toggleIcon} />
					) : (
						<EyeOff className="size-5 text-indigo-900" onClick={toggleIcon} />
					)}
				</div>
			)}
		</div>
	);
};

export default Input;
