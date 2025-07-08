import React, { useState, useEffect } from 'react'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { TerminalSquare, Menu, X } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import UserButton from './UserButton'

const NavItem = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        'relative group text-base font-medium px-1 py-2 transition-colors duration-300',
        isActive ? 'text-[#00ffa3]' : 'text-slate-300 hover:text-white'
      )
    }
  >
    {({ isActive }) => (
      <>
        {children}
        <span
          className={cn(
            'absolute bottom-0 left-0 block h-0.5 bg-gradient-to-r from-[#00d4ff] to-[#00ffa3] transition-all duration-300',
            isActive ? 'w-full' : 'w-0 group-hover:w-full'
          )}
        />
      </>
    )}
  </NavLink>
)

const Navbar = () => {
  const { user: authUser } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 backdrop-blur-lg transition-all duration-300 ease-in-out',
        scrolled
          ? 'bg-[#0f172a]/80 border-b border-slate-800 shadow-lg shadow-black/20'
          : 'border-b border-transparent'
      )}
    >
      <div className='container mx-auto px-5'>
        <div className='flex items-center justify-between h-16'>

          {/* Logo */}
          <Link
            to='/'
            className='flex items-center space-x-3 group px-3 py-1 rounded-lg transition-all duration-300 hover:scale-105 hover:bg-white/5'
          >
            <TerminalSquare className='h-8 w-8 text-[#00d4ff] group-hover:text-[#00ffa3] group-hover:rotate-[8deg] transition-all duration-300' />
            <span className='text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00d4ff] to-[#00ffa3] group-hover:brightness-125'>
              Code Blaze
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className='hidden md:flex items-center space-x-6'>
            <NavItem to="/problems">Problems</NavItem>
            <NavItem to="/contests">Contests</NavItem>
          </nav>

          {/* Mobile Toggle */}
          <div className='md:hidden'>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='p-2 rounded-md text-white hover:bg-white/10 transition duration-200'
            >
              {mobileMenuOpen ? <X className='h-6 w-6' /> : <Menu className='h-6 w-6' />}
            </button>
          </div>

          {/* Auth Buttons */}
          <div className='hidden md:flex items-center space-x-4'>
            {authUser ? (
              <UserButton />
            ) : (
              <>
                <Link to='/login'>
                  <Button
                    variant='ghost'
                    className='text-slate-300 hover:text-white hover:bg-white/10 transition duration-300'
                  >
                    Login
                  </Button>
                </Link>
                <Link to='/signup'>
                  <Button className='bg-gradient-to-r from-[#00d4ff] to-[#00ffa3] text-black font-semibold hover:scale-105 transition-all duration-300 px-6 py-2 rounded-xl shadow-[0_0_15px_rgba(0,255,163,0.2)] hover:shadow-[0_0_20px_rgba(0,255,163,0.4)]'>
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            'overflow-hidden md:hidden transition-all duration-500 ease-in-out',
            mobileMenuOpen ? 'max-h-[400px] opacity-100 scale-100 mt-2' : 'max-h-0 opacity-0 scale-95'
          )}
        >
          <div className='bg-[#111827]/95 backdrop-blur-sm rounded-xl p-4 shadow-2xl space-y-2 border border-slate-700/80'>
            {['/problems', '/contests'].map((path) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'block text-lg font-medium px-4 py-3 rounded-lg hover:bg-white/5 transition-colors duration-200',
                    isActive ? 'bg-white/5 text-[#00ffa3]' : 'text-slate-300 hover:text-white'
                  )
                }
              >
                {path === '/problems' ? 'Problems' : 'Contests'}
              </NavLink>
            ))}

            {/* Divider */}
            <div className='relative pt-4 mt-4'>
              <div className='absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent' />
            </div>

            {/* Mobile Auth */}
            <div className='pt-4 space-y-2'>
              {authUser ? (
                <div className='flex items-center justify-between px-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition'>
                  <span className='text-white/70 text-sm font-medium px-2'>Account</span>
                  <UserButton />
                </div>
              ) : (
                <>
                  <Link to='/login' onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant='ghost'
                      className='w-full text-slate-300 hover:text-white hover:bg-white/10 transition text-lg py-3 h-auto'
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to='/signup' onClick={() => setMobileMenuOpen(false)}>
                    <Button className='w-full bg-gradient-to-r from-[#00d4ff] to-[#00ffa3] text-black font-bold px-6 py-2 rounded-xl hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(0,255,163,0.4)] transition-all duration-300'>
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
