import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, ArrowRight, TrendingUp, Loader2 } from 'lucide-react'
import { GroveLogo } from '@/components/ui/GroveLogo'
import { useLogin } from '@/hooks/useAuth'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const loginMutation = useLogin()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Email and password are required')
      return
    }
    
    setError('')
    
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          if (data && data.success) {
            const { accessToken, user } = data.data
            localStorage.setItem('token', accessToken)
            localStorage.setItem('user', JSON.stringify(user))
            navigate('/dashboard')
          } else {
            setError(data?.message || 'Login failed')
          }
        },
        onError: (err) => {
          setError(err.response?.data?.message || err.message || 'Connection to auth service failed')
        }
      }
    )
  }

  return (
    <div className="min-h-screen bg-[#060608] flex items-center justify-center p-4">
      <div className="w-full max-w-[380px]">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-xl mb-4">
            <GroveLogo className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
            Dashboard Admin
          </h1>
          <p className="text-zinc-500 text-xs mt-1">Sign in to your institutional account</p>
        </div>

        <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-lg text-red-400 text-[11px] font-mono leading-relaxed">
                {error}
              </div>
            )}

             <div>
              <label className="block text-[11px] font-medium text-zinc-500 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                <input
                  type="email"
                  value={email}
                  disabled={loginMutation.isPending}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 placeholder-zinc-700 text-xs focus:outline-none focus:border-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="name@institution.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-500 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  disabled={loginMutation.isPending}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 placeholder-zinc-700 text-xs focus:outline-none focus:border-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  disabled={loginMutation.isPending}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-zinc-600 text-[11px]">
              Need access?{' '}
              <Link to="/register" className="text-zinc-400 hover:text-zinc-200 font-medium transition-colors">
                Register account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}