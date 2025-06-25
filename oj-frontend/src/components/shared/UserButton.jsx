import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import LogoutWrapper from './LogoutWrapper'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'
const getAvatarUrl = (seed) =>
  `https://robohash.org/${encodeURIComponent(seed)}.png?set=set1&size=100x100`

const UserButton = () => {
  const { user: authUser } = useAuth()
  const name = authUser?.UserName || 'User'
  const email = authUser?.email || 'user@example.com'
  const role = authUser?.role || 'user'
  const avatarURL = getAvatarUrl(email)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className='focus:outline-none group'>
          <Avatar
            className={cn(
              'h-10 w-10 ring-2 ring-[#00ffa3] group-hover:ring-pink-400 transition-all duration-300 shadow-xl rounded-full overflow-hidden'
            )}
          >
            <AvatarImage src={avatarURL} alt={name} className='object-cover' />
            <AvatarFallback className='bg-[#2a2a40] text-white font-bold'>
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side='bottom'
        align='end'
        className='min-w-[240px] rounded-xl shadow-2xl bg-[#1e1e2f]/95 border border-white/10 backdrop-blur-md text-white animate-in fade-in slide-in-from-top-2 duration-200'
      >
        <div className='px-3 py-2'>
          <p className='text-base font-semibold'>{name}</p>
          <span className='text-xs px-2 py-0.5 rounded-full bg-[#00ffa3]/10 text-[#00ffa3] font-semibold capitalize'>
            {role}
          </span>
        </div>

        <DropdownMenuSeparator className='bg-white/10' />

        <Link to='/profile'>
          <DropdownMenuItem className='hover:bg-white/10 hover:text-[#00ffa3] rounded-md transition duration-200'>
            👤 View Profile
          </DropdownMenuItem>
        </Link>

        {role === 'admin' && (
          <>
            <Link to='/admin/dashboard'>
              <DropdownMenuItem className='hover:bg-white/10 hover:text-[#00ffa3] rounded-md transition duration-200'>
                🛠 Admin Dashboard
              </DropdownMenuItem>
            </Link>
            <Link to='/admin/manage-problems'>
              <DropdownMenuItem className='hover:bg-white/10 hover:text-[#00ffa3] rounded-md transition duration-200'>
                📚 Manage Problems
              </DropdownMenuItem>
            </Link>
            <Link to='/admin/manage-contests'>
              <DropdownMenuItem className='hover:bg-white/10 hover:text-[#00ffa3] rounded-md transition duration-200'>
                🧠 Manage Contests
              </DropdownMenuItem>
            </Link>
          </>
        )}

        <Link to='/my-submissions'>
          <DropdownMenuItem className='hover:bg-white/10 hover:text-[#00ffa3] rounded-md transition duration-200'>
            📝 My Submissions
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator className='bg-white/10' />

        <LogoutWrapper>
          <DropdownMenuItem className='hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-md transition font-semibold'>
            🚪 Log out
          </DropdownMenuItem>
        </LogoutWrapper>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserButton
