import { Link, useLocation } from 'react-router-dom'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/upload',    label: 'Upload CSV', icon: '📤' },
]

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 
                            flex items-center justify-center text-lg shadow-lg shadow-indigo-900/40
                            group-hover:scale-105 transition-transform duration-200">
              🎓
            </div>
            <span className="font-bold text-xl tracking-tight">
              Edu<span className="text-indigo-400">Guard</span>
            </span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-1">
            {navLinks.map(({ to, label, icon }) => {
              const active = pathname.startsWith(to)
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${active
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
                    }`}
                >
                  <span>{icon}</span>
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              )
            })}
          </div>

        </div>
      </div>
    </nav>
  )
}
