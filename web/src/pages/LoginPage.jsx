// Two-step OTP login:
// Step 1 → email input → sends OTP
// Step 2 → 6 individual digit boxes → auto-advances, auto-submits, paste-aware

import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Mail, ArrowRight, RotateCcw, CheckCircle } from 'lucide-react'
import {
  sendOtp, verifyOtp, clearOtpState,
  selectOtpSent, selectOtpEmail,
  selectSendingOtp, selectVerifyingOtp, selectAuthError,
} from '../redux/slices/authSlice'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [code, setCode]   = useState(['', '', '', '', '', ''])
  const [name, setName]   = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const codeRefs = useRef([])

  // Auto-advance on digit entry
  function handleCodeChange(index, value) {
    if (value && !/^\d$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    if (value && index < 5) codeRefs.current[index + 1]?.focus()
    // Auto-submit when all 6 filled
    if (value && index === 5 && newCode.join('').length === 6) {
      dispatch(verifyOtp({ email: otpEmail, code: newCode.join(''), name }))
    }
  }

  // Paste entire code at once
  function handleCodePaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setCode(pasted.split(''))
      dispatch(verifyOtp({ email: otpEmail, code: pasted, name }))
    }
  }
  // ...
}