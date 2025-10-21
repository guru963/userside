import React from "react"
import { Link } from "react-router-dom"

const VerifyEmail: React.FC = () => {
  return (
    <div className="bg-[#fff6eb] min-h-screen flex flex-col items-center justify-center font-[Poppins] px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Verify Your Email
        </h1>
        <p className="text-gray-600 mb-6">
          We’ve sent a confirmation link to your email.  
          Please check your inbox (and spam folder) and click the link to verify your account.
        </p>
        <p className="text-gray-500 text-sm mb-4">
          Once verified, you can log in with your email and password.
        </p>
        <Link
          to="/login"
          className="bg-gradient-to-r from-[#ef4444] via-[#b45309] to-[#f59e0b] text-white font-semibold px-6 py-2 rounded-lg hover:opacity-90 transition-all"
        >
          Go to Login
        </Link>
      </div>
    </div>
  )
}

export default VerifyEmail
