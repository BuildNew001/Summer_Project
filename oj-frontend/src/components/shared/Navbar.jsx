import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { TerminalSquare, Menu, X } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UserButton from './UserButton';

const Navbar = () => {
  const { user: authUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        'bg-gradient-to-r from-[#0f0c29]/95 via-[#302b63]/95 to-[#24243e]/95 backdrop-blur-lg shadow-2xl border-b border-white/10'
      )}
    >
      <div className="container mx-auto px-5">
        <div className="flex items-center justify-between h-16">
          <Link
            to={'/'}
            className="flex items-center space-x-3 group px-3 py-1 rounded-lg hover:bg-white/10 transition-all duration-300"
          >
            <TerminalSquare className="h-8 w-8 text-[#00e0ff] group-hover:text-pink-400 group-hover:-translate-y-0.5 transition-all duration-300" />
            <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-cyan-400 via-purple-400 to-pink-400 group-hover:brightness-125">
              Online Judge
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <NavLink
              to={'/problems'}
              className={({ isActive }) =>
                cn(
                  'text-lg font-semibold px-4 py-2 rounded-lg hover:bg-white/10 hover:text-[#00ffa3] transition duration-300 ease-in-out',
                  isActive ? 'text-[#00ffa3]' : 'text-white/80'
                )
              }
            >
              Problems
            </NavLink>
            <NavLink
              to={'/contests'}
              className={({ isActive }) =>
                cn(
                  'text-lg font-semibold px-4 py-2 rounded-lg hover:bg-white/10 hover:text-[#00ffa3] transition duration-300 ease-in-out',
                  isActive ? 'text-[#00ffa3]' : 'text-white/80'
                )
              }
            >
              Contests
            </NavLink>
          </nav>

          <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? (
                <X className="text-white h-6 w-6" />
              ) : (
                <Menu className="text-white h-6 w-6" />
              )}
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {authUser ? (
              <UserButton />
            ) : (
              <>
                <Link to={'/login'}>
                  <Button
                    variant="ghost"
                    className="text-white hover:text-[#00ffa3] hover:bg-white/10 transition-all duration-300"
                  >
                    Login
                  </Button>
                </Link>
                <Link to={'/signup'}>
                  <Button className="bg-gradient-to-r from-[#00d4ff] to-[#00ffa3] text-black font-bold hover:scale-105 hover:shadow-xl transition-transform duration-300 px-6 py-2 rounded-xl">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 bg-[#1c1c2b]/95 rounded-xl p-4 shadow-2xl space-y-4">
            <NavLink
              to={'/problems'}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  'block text-lg font-medium px-4 py-2 rounded-lg hover:bg-white/10 hover:text-[#00ffa3] transition duration-200',
                  isActive ? 'text-[#00ffa3]' : 'text-white/80'
                )
              }
            >
              Problems
            </NavLink>
            <NavLink
              to={'/contests'}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  'block text-lg font-medium px-4 py-2 rounded-lg hover:bg-white/10 hover:text-[#00ffa3] transition duration-200',
                  isActive ? 'text-[#00ffa3]' : 'text-white/80'
                )
              }
            >
              Contests
            </NavLink>
            {!authUser && (
              <>
                <Link to={'/login'} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full text-white hover:text-[#00ffa3] hover:bg-white/10 transition duration-200"
                  >
                    Login
                  </Button>
                </Link>
                <Link to={'/signup'} onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-[#00d4ff] to-[#00ffa3] text-black font-bold px-6 py-2 rounded-xl">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
