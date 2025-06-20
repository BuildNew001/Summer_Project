import React from 'react'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { TerminalSquare } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import UserButton from './UserButton'
const Navbar = () => {
  const { user: authUser } = useAuth()
  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ',

        'bg-white/90 backdrop-blur-md shadow-sm'
      )}
    >
      <div className='container mx-auto px-5'>
        <div className='flex items-center justify-between h-16'>
          <Link
            to={'/'}
            className='flex items-center space-x-2 group px-2 py-1 rounded-lg hover:bg-pink-50 transition-all duration-300'
          >
            <TerminalSquare className='h-8 w-8 text-[#f08080] group-hover:text-indigo-600 group-hover:-translate-y-0.5 transition-all duration-300' />
            <span className='text-xl font-bold text-slate-700 group-hover:text-[#f08080] transition-colors duration-300'>
              Online Judge
            </span>
          </Link>
          <nav className='hidden md:flex items-center space-x-6'>
            <NavLink
              to={'/problems'}
              className={
                'text-base font-medium text-slate-700 hover:text-[#f08080] hover:bg-pink-50 px-3 py-1.5 rounded-md transition-all duration-300 hover:-translate-y-px'
              }
            >
              Problems
            </NavLink>
            <NavLink
              to={'/contests'}
              className='text-base font-medium text-slate-700 hover:text-[#f08080] hover:bg-pink-50 px-3 py-1.5 rounded-md transition-all duration-300 hover:-translate-y-px'
            >
              Contests
            </NavLink>
          </nav>
          {authUser ? (
            <UserButton />
          ) : (
            <div className='flex items-center space-x-4'>
              <Link to={'/login'}>
                <Button
                  variant='ghost'
                  className='text-slate-700 hover:text-[#f08080] hover:bg-pink-50 transition-all duration-300'
                >
                  Login
                </Button>
              </Link>

              <Link to={'/signup'}>
                <Button className='bg-[#f08080] hover:bg-[#f19e9e] text-white transition-all duration-300 hover:-translate-y-0.5'>
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
