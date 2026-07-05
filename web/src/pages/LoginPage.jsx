import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Loader, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { loginUser, selectAuthError } from '../redux/slices/authSlice'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const authError = useSelector(selectAuthError)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  async function handleLoginSubmit(e) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password.')
      return
    }

    setIsLoggingIn(true)
    try {
      const result = await dispatch(loginUser({ 
        email: email.trim().toLowerCase(), 
        password: password 
      }))
      if (result.meta.requestStatus === 'fulfilled') {
        navigate('/feed')
      }
    } catch (err) {
      toast.error('Failed to log in.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-755 flex items-center justify-center px-4 font-sans">
      <div className="card p-8 w-full max-w-sm bg-white border border-stone-200 shadow-card rounded-xl relative">
        
        {/* Branding header */}
        <div className="text-center mb-6 select-none">
          <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm mx-auto mb-2.5">
            N
          </div>
          <span className="text-xs font-bold tracking-tight text-stone-400">
            Neighbour<span className="text-primary-600">Hub</span> Portal
          </span>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-stone-850">Log In to Your Feed</h2>
          <p className="text-xs text-stone-450 mt-1">Enter your credentials to connect with your neighbors.</p>
        </div>

        {authError && (
          <div className="mb-5 p-3 bg-red-50 border border-red-100 rounded-lg text-center text-xs font-bold text-red-650 animate-shake">
            {authError}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {/* Email field */}
          <div className="space-y-1.5 text-left">
            <label htmlFor="email" className="block text-[10px] font-bold text-stone-500 uppercase tracking-wide">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Mail size={14} />
              </span>
              <input
                id="email"
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-9"
                disabled={isLoggingIn}
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5 text-left">
            <label htmlFor="password" className="block text-[10px] font-bold text-stone-500 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Lock size={14} />
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-9 pr-10"
                disabled={isLoggingIn}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full btn-primary py-2.5 mt-2 text-xs font-bold shadow-sm flex items-center justify-center gap-1.5"
          >
            {isLoggingIn ? (
              <>
                <Loader className="animate-spin" size={13} />
                Authenticating...
              </>
            ) : (
              <>
                Sign In <ArrowRight size={13} />
              </>
            )}
          </button>
        </form>

        {/* Demo Bypass Info */}
        {email.toLowerCase().endsWith('@example.com') && (
          <div className="mt-4 p-3 bg-primary-50 border border-primary-100 rounded-xl flex gap-2 text-left select-none animate-in fade-in slide-in-from-top-1">
            <ShieldCheck size={15} className="text-primary-650 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-primary-750 font-bold leading-relaxed">
              <strong>Demo Bypass:</strong> Use password <strong>123456</strong> to sign in directly.
            </p>
          </div>
        )}

        <div className="text-center mt-6 pt-4 border-t border-stone-200">
          <span className="text-xs text-stone-400 font-medium">New to NeighbourHub? </span>
          <Link to="/register" className="text-xs font-bold text-primary-600 hover:text-primary-750 transition-colors">
            Register Here
          </Link>
        </div>

      </div>
    </div>
  )
}