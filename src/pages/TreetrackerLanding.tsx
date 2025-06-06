"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"
import bcrypt from "bcryptjs"

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed top-4 right-4 z-50 transform transition-all duration-300 ease-out animate-in slide-in-from-right-full">
      <div
        className={`px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-[300px] ${
          type === "success"
            ? "bg-green-500 text-white"
            : type === "error"
              ? "bg-red-500 text-white"
              : "bg-yellow-500 text-white"
        }`}
      >
        <div className="flex-shrink-0">
          {type === "success" && (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {type === "error" && (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <p className="font-medium">{message}</p>
        </div>
        <button onClick={onClose} className="flex-shrink-0 ml-4 text-white hover:text-gray-200 transition-colors">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

const TreetrackerLanding = () => {
  const navigate = useNavigate()

  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [toast, setToast] = useState(null)

  const showToast = (message, type) => {
    setToast({ message, type })
  }

  const closeToast = () => {
    setToast(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")

    if (isSignUp) {
      if (password !== confirmPassword) {
        showToast("Passwords do not match.", "error")
        return
      }

      if (!phone) {
        showToast("Please enter your phone number.", "error")
        return
      }

      // Check if user already exists
      const { data: existingUser, error: fetchError } = await supabase
        .from("admin")
        .select("*")
        .eq("email", email)
        .single()

      if (existingUser) {
        showToast("Email already registered.", "error")
        return
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Insert new user
      const { error: insertError } = await supabase.from("admin").insert([
        {
          email: email.trim(),
          phone: phone.trim(),
          password: hashedPassword,
        },
      ])

      if (insertError) {
        console.error("Insert error:", insertError.message)
        showToast("Failed to sign up. Try again.", "error")
        return
      }

      showToast("Sign up successful! Redirecting to dashboard...", "success")
      setEmail("")
      setPhone("")
      setPassword("")
      setConfirmPassword("")
      setIsSignUp(false)

      // Delay navigation to show the toast
      setTimeout(() => {
        navigate("/dashboard")
      }, 2000)
    } else {
      // Sign in: fetch user and compare password
      const { data: user, error } = await supabase.from("admin").select("*").eq("email", email).single()

      if (error || !user) {
        showToast("Login failed: User not found.", "error")
        return
      }

      const isMatch = await bcrypt.compare(password, user.password)

      if (!isMatch) {
        showToast("Incorrect password.", "error")
        return
      }

      showToast("Login successful! Redirecting to dashboard...", "success")

      // Delay navigation to show the toast
      setTimeout(() => {
        navigate("/dashboard")
      }, 2000)
    }
  }

  return (
    <>
      <div className="min-h-screen w-full flex bg-[#00391e]">
        <div className="w-1/2 flex items-end justify-center p-4">
          <img
            src={isSignUp ? "/landing1.png" : "/landing.png"}
            alt="Decorative"
            className="rounded-2xl object-contain w-[100%] h-[850px] -translate-y-6 -translate-x-8"
          />
        </div>

        <div className="w-1/2 flex flex-col items-center justify-center px-10">
          <img src="/logo-placeholder.png" alt="Municipal Logo" className="h-24 w-24 mb-4" />
          <h1 className="text-white text-3xl font-bold">Tuticorin Municipal</h1>
          <h2 className="text-gray-300 text-xl mb-6">Dog Control System</h2>

          <div className="mb-4 w-[300px] rounded-md overflow-hidden flex shadow-lg border">
            <button
              onClick={() => {
                setIsSignUp(false)
                setMessage("")
                closeToast()
              }}
              className={`w-1/2 py-3 font-semibold transition-colors ${
                !isSignUp ? "bg-white text-black" : "bg-[#d9d9d9] text-gray-700 hover:bg-[#00381e]"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsSignUp(true)
                setMessage("")
                closeToast()
              }}
              className={`w-1/2 py-3 font-semibold transition-colors ${
                isSignUp ? "bg-white text-black" : "bg-[#d9d9d9] text-gray-700 hover:bg-[#00381e]"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-md">
            <div className="mb-4">
              <label className="block text-white mb-1">Email Id</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
                className="w-full px-4 py-2 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {isSignUp && (
              <div className="mb-4">
                <label className="block text-white mb-1">Phone No</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter Phone Number"
                  className="w-full px-4 py-2 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            )}

            <div className="mb-1">
              <label className="text-white">Password</label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              className="w-full mb-2 px-4 py-2 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />

            {isSignUp && (
              <div className="mb-4">
                <label className="block text-white mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full px-4 py-2 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#e8e8e8] text-black py-2 rounded-md font-semibold hover:bg-[#d4d4d4] transition-colors mt-6"
            >
              {isSignUp ? "Sign Up" : "Sign In"}
            </button>
          </form>

          <p className="text-sm text-gray-400 mt-6 text-center px-6">
            By signing {isSignUp ? "up" : "in"} you accept the Company's <br />
            <span className="underline cursor-pointer hover:text-gray-300">Terms of use & Privacy Policy.</span>
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
    </>
  )
}

export default TreetrackerLanding
