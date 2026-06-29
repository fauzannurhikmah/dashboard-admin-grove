import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, TrendingUp } from 'lucide-react'
import { GroveLogo } from '@/components/ui/GroveLogo'

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    // Arahkan ke login setelah register agar user bisa masuk menggunakan akun baru
    navigate('/login')
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
          <p className="text-zinc-500 text-xs mt-1">Create your institutional account</p>
        </div>

        <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field Nama */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-500 mb-1.5 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 placeholder-zinc-700 text-xs focus:outline-none focus:border-zinc-700 transition-colors"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Field Email */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-500 mb-1.5 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 placeholder-zinc-700 text-xs focus:outline-none focus:border-zinc-700 transition-colors"
                  placeholder="name@institution.com"
                />
              </div>
            </div>

            {/* Field Password */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-500 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 placeholder-zinc-700 text-xs focus:outline-none focus:border-zinc-700 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-2"
            >
              Create Account
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-zinc-600 text-[11px]">
              Already have an account?{' '}
              <Link to="/login" className="text-zinc-400 hover:text-zinc-200 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}