import React, { useState } from 'react'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { TerminalSquare, Menu, X } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import UserButton from './UserButton'

const Navbar = () => {
  const { user: authUser } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 backdrop-blur-lg transition-all duration-300',
        'bg-gradient-to-r from-[#0f0c29]/90 via-[#302b63]/90 to-[#24243e]/90 border-b border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
      )}
    >
      <div className='container mx-auto px-5'>
        <div className='flex items-center justify-between h-16'>

          {/* Logo */}
          <Link
            to='/'
            className='flex items-center space-x-3 group px-3 py-1 rounded-lg transition-all duration-300 hover:scale-105 hover:bg-white/10'
          >
            <TerminalSquare className='h-8 w-8 text-[#00e0ff] group-hover:text-pink-400 group-hover:rotate-[8deg] transition-all duration-300' />
            <span className='text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-cyan-400 via-purple-400 to-pink-400 group-hover:brightness-125'>
              Online Judge
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className='hidden md:flex items-center space-x-6'>
            {['/problems', '/contests'].map((path) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  cn(
                    'text-base font-medium px-4 py-2 rounded-xl transition duration-300 hover:scale-105 hover:bg-white/10 hover:text-green-300',
                    isActive ? 'text-[#00ffa3] font-semibold' : 'text-white/80'
                  )
                }
              >
                {path === '/problems' ? 'Problems' : 'Contests'}
              </NavLink>
            ))}
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
                    className='text-white hover:text-[#00ffa3] hover:bg-white/10 transition duration-300'
                  >
                    Login
                  </Button>
                </Link>
                <Link to='/signup'>
                  <Button className='bg-gradient-to-r from-[#00d4ff] to-[#00ffa3] text-black font-semibold hover:scale-105 hover:shadow-xl transition-transform duration-300 px-6 py-2 rounded-xl '>
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Slide-down */}
        <div
          className={cn(
            'overflow-hidden md:hidden transition-all duration-500 ease-in-out',
            mobileMenuOpen ? 'max-h-[300px] opacity-100 scale-100 mt-2' : 'max-h-0 opacity-0 scale-95'
          )}
        >
          <div className='bg-[#1c1c2b]/95 rounded-xl p-4 shadow-2xl space-y-4'>
            {['/problems', '/contests'].map((path) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'block text-lg font-medium px-4 py-2 rounded-lg hover:bg-white/10 hover:text-[#00ffa3] transition',
                    isActive ? 'text-[#00ffa3]' : 'text-white/80'
                  )
                }
              >
                {path === '/problems' ? 'Problems' : 'Contests'}
              </NavLink>
            ))}

            <div className='border-t border-white/10 pt-4 mt-2 space-y-2'>
              {authUser ? (
                <div className='flex items-center justify-start px-2'>
                  <UserButton />
                </div>
              ) : (
                <>
                  <Link to='/login' onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant='ghost'
                      className='w-full text-white hover:text-[#00ffa3] hover:bg-white/10 transition'
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to='/signup' onClick={() => setMobileMenuOpen(false)}>
                    <Button className='w-full bg-gradient-to-r from-[#00d4ff] to-[#00ffa3] text-black font-bold px-6 py-2 rounded-xl hover:scale-[1.03] transition'>
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
