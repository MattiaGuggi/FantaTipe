/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from 'react-router-dom';

const EmailVerificationPage = ({ onSignup }) => {
	const [code, setCode] = useState(["", "", "", "", "", ""]);
	const inputRefs = useRef([]);
	const location = useLocation();
	const navigate = useNavigate();
	const userEmail = location.state?.email || 'default@gmail.com';

	const handleChange = (index, value) => {
		const newCode = [...code];

		// Handle pasted content
		if (value.length > 1) {
			const pastedCode = value.slice(0, 6).split("");
			for (let i = 0; i < 6; i++) {
				newCode[i] = pastedCode[i] || "";
			}
			setCode(newCode);

			// Focus on the last non-empty input or the first empty one
			const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
			const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
			inputRefs.current[focusIndex].focus();
		}
        else {
			newCode[index] = value;
			setCode(newCode);

			// Move focus to the next input field if value is entered
			if (value && index < 5) {
				inputRefs.current[index + 1].focus();
			}
		}
	};

	const handleKeyDown = (index, e) => {
		if (e.key === "Backspace" && !code[index] && index > 0) {
			inputRefs.current[index - 1].focus();
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const verificationCode = code.join("");
	
		try {
			const response = await fetch("http://localhost:8080/auth/verify-email", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: userEmail,
					code: verificationCode
				})
			});
	
			const data = await response.json();
	
			if (data.success) {
				toast.success("Email verified successfully");
				onSignup();
				navigate('/home');
			} else {
				toast.error(data.message || "Invalid verification code");
			}
		} catch (error) {
			console.error("Verification error:", error);
			toast.error("An error occurred during verification");
		}
	};	

	// Auto submit when all fields are filled
	useEffect(() => {
		if (code.every((digit) => digit !== "")) {
			handleSubmit(new Event("submit"));
		}
	}, [code]);

	return (
		<div className='max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden xs:w-11/12'>
			<motion.div
				initial={{ opacity: 0, y: -50 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className='bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md'
			>
				<h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-700 to-indigo-700 text-transparent bg-clip-text xs:text-2xl'>
					Verify Your Email
				</h2>
				<p className='text-center text-gray-300 mb-6'>Enter the 6-digit code sent to your email address.</p>

				<form onSubmit={handleSubmit} className='space-y-6'>
					<div className='flex justify-between'>
						{code.map((digit, index) => (
							<input
								key={index}
								ref={(el) => (inputRefs.current[index] = el)}
								type='text'
								maxLength='6'
								value={digit}
								onChange={(e) => handleChange(index, e.target.value)}
								onKeyDown={(e) => handleKeyDown(index, e)}
								className='w-12 h-12 text-center text-2xl font-bold bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:border-indigo-700
								focus:outline-none xs:w-9 xs:h-9'
							/>
						))}
					</div>
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						type='submit'
						disabled={code.some((digit) => !digit)}
						className='w-full bg-gradient-to-r py-3 px-4 from-indigo-700 to-indigo-950 text-white font-bold rounded-lg shadow-lg hover:from-indigo-800
						hover:to-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2 focus:ring-offset-gray-900'
					>
						{"Verify Email"}
					</motion.button>
				</form>
			</motion.div>
		</div>
	);
};
export default EmailVerificationPage;