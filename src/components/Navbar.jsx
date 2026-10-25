import { Link, NavLink } from 'react-router-dom'
import { FileSearch, LogOut, Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
    }`

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4 sm:gap-8">
          <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-indigo-600">
            <FileSearch className="h-6 w-6" />
            <span className="hidden sm:inline">ResumeMatch</span>
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/analyze"
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New analysis</span>
          </Link>

          <span className="hidden text-sm text-slate-600 md:inline">{user?.name}</span>

          <button
            onClick={logout}
            title="Log out"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  )
}