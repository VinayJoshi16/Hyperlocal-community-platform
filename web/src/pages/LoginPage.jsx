// Two-step OTP login:
// Step 1 → email input → sends OTP
// Step 2 → 6 individual digit boxes → auto-advances, auto-submits, paste-aware

import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Mail, ArrowRight, RotateCcw, CheckCircle, User, Loader } from 'lucide-react'
import {
  sendOtp, verifyOtp, clearOtpState,
  selectOtpSent, selectOtpEmail,
  selectSendingOtp, selectVerifyingOtp, selectAuthError,
} from '../redux/slices/AuthSlice'

export default function LoginPage() {
  const dispatch = useDispatch()
  const otpSent = useSelector(selectOtpSent)
  const otpEmail = useSelector(selectOtpEmail)
  const sendingOtp = useSelector(selectSendingOtp)
  const verifyingOtp = useSelector(selectVerifyingOtp)
  const authError = useSelector(selectAuthError)

  const [email, setEmail] = useState('')
  const [code, setCode]   = useState(['', '', '', '', '', ''])
  const [name, setName]   = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const codeRefs = useRef([])

  // Clear OTP state on unmount
  useEffect(() => {
    return () => {
      dispatch(clearOtpState())
    }
  }, [dispatch])

  // Manage resend countdown timer
  useEffect(() => {
    if (resendTimer === 0) return
    const timer = setInterval(() => {
      setResendTimer((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [resendTimer])

  // Trigger countdown when OTP is successfully sent
  useEffect(() => {
    if (otpSent) {
      setResendTimer(60)
    }
  }, [otpSent])

  // Handle step 1: Request OTP
  function handleSubmitEmail(e) {
    e.preventDefault()
    if (!email.trim() || sendingOtp) return
    dispatch(sendOtp(email.trim().toLowerCase()))
  }

  // Handle digit inputs
  function handleCodeChange(index, value) {
    if (value && !/^\d$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-advance focus to next input
    if (value && index < 5) {
      codeRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all 6 digits are filled
    const codeString = newCode.join('')
    if (codeString.length === 6) {
      dispatch(verifyOtp({ email: otpEmail, code: codeString, name: name.trim() }))
    }
  }

  // Handle Backspace to go back to previous input
  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus()
    }
  }

  // Paste entire 6-digit code
  function handleCodePaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const newCode = pasted.split('')
      setCode(newCode)
      dispatch(verifyOtp({ email: otpEmail, code: pasted, name: name.trim() }))
    }
  }

  // Handle resending OTP
  function handleResend() {
    if (resendTimer > 0 || sendingOtp) return
    dispatch(sendOtp(otpEmail))
  }

  // Restart the login flow (go back to Step 1)
  function handleBackToEmail() {
    dispatch(clearOtpState())
    setCode(['', '', '', '', '', ''])
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-md bg-white border border-stone-200 shadow-card rounded-xl">
        
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white text-lg font-bold shadow-md mx-auto mb-4">
            NH
          </div>
          <h1 className="text-2xl font-bold text-stone-800">NeighbourHub</h1>
          <p className="text-stone-500 mt-1 text-sm">
            {otpSent 
              ? 'Verify your email address' 
              : 'Connect with your local community'
            }
          </p>
        </div>

        {authError && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 text-center animate-shake">
            {authError}
          </div>
        )}

        {!otpSent ? (
          /* STEP 1: Email & Optional Name Form */
          <form onSubmit={handleSubmitEmail} className="space-y-5">
            <div>
              <label htmlFor="email" className="label">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail size={18} />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-11"
                  disabled={sendingOtp}
                />
              </div>
            </div>

            <div>
              <label htmlFor="name" className="label">
                Full Name <span className="text-stone-400 font-normal">(only required for new accounts)</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <User size={18} />
                </span>
                <input
                  id="name"
                  type="text"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input pl-11"
                  disabled={sendingOtp}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={sendingOtp || !email}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2"
            >
              {sendingOtp ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  Sending code...
                </>
              ) : (
                <>
                  Send Verification Code
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        ) : (
          /* STEP 2: 6-Digit OTP Form */
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-stone-600">
                We've sent a 6-digit code to <span className="font-semibold text-stone-800">{otpEmail}</span>
              </p>
            </div>

            <div 
              className="flex justify-between gap-2.5" 
              onPaste={handleCodePaste}
            >
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (codeRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={verifyingOtp}
                  className="w-12 h-14 text-center text-xl font-bold bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              ))}
            </div>

            <div className="flex flex-col items-center gap-4 pt-2">
              <button
                disabled={verifyingOtp}
                onClick={handleBackToEmail}
                className="text-stone-500 hover:text-stone-700 text-sm font-medium transition-colors"
              >
                Back to email
              </button>

              <div className="divider w-full" />

              <div className="text-center text-sm">
                {resendTimer > 0 ? (
                  <span className="text-stone-400">
                    Resend code in {resendTimer}s
                  </span>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={sendingOtp}
                    className="text-primary-600 hover:text-primary-700 font-semibold inline-flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw size={14} />
                    Resend code
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}