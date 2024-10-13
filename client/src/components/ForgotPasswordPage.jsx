/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { useState } from "react";
import Input from "../assets/Input";
import { ArrowLeft, Mail } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const ForgotPasswordPage = () => {
	const [email, setEmail] = useState("");
	const [isSubmitted, setIsSubmitted] = useState(false);
	const location = useLocation();
	const userEmail = location.state?.email || 'default@gmail.com';
	const API_URL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "";

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const response = await fetch(`${API_URL}/forgot-password`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: email,
				}),
			});
	
			const data = await response.json();
	
			if (data.success) {
				setIsSubmitted(true);
			}
		} catch (error) {
			console.error("Verification error:", error);
		}
	};	

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className='max-w-md w-full bg-gray-500 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden xs:w-11/12'
		>
			<div className='p-8'>
				<h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-950 to-indigo-950 text-transparent bg-clip-text'>
					Forgot Password
				</h2>

				{!isSubmitted ? (
					<form onSubmit={handleSubmit}>
						<p className='text-gray-300 mb-6 text-center'>
							Enter your email address and we will send you a link to reset your password.
						</p>
						<Input
							icon={Mail}
							type='email'
							placeholder='Email Address'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
						<motion.button
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							className="mt-5 w-full py-3 px-4 bg-gradient-to-r from-indigo-700 to-indigo-950 text-white font-bold rounded-lg shadow-lg hover:from-indigo-800 hover:to-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
							type='submit'
						>
							Send Reset Link
						</motion.button>
					</form>
				) : (
					<div className='text-center'>
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ type: "spring", stiffness: 500, damping: 30 }}
							className='w-16 h-16 bg-indigo-950 rounded-full flex items-center justify-center mx-auto mb-4'
						>
							<Mail className='h-8 w-8 text-white' />
						</motion.div>
						<p className='text-gray-300 mb-6'>
							If an account exists for {email}, you will receive a password reset link shortly.
						</p>
					</div>
				)}
			</div>

			<div className='px-8 py-4 bg-gray-600 bg-opacity-50 flex justify-center'>
				<Link to={"/login"} className='text-sm bg-gradient-to-r from-indigo-950 to-indigo-950 text-transparent bg-clip-text hover:underline flex items-center'>
					<ArrowLeft className='h-4 w-4 mr-2 hover:underline bg-gradient-to-r from-indigo-950 to-indigo-950 text transparent bg-clip-text' /> Back to Login
				</Link>
			</div>
		</motion.div>
	);
};
export default ForgotPasswordPage;