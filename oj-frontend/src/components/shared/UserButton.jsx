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

const UserButton = () => {
  const { user: authUser } = useAuth()
  const role = authUser?.role
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src='https://github.com/shadcn.png' alt='@shadcn' />
          <AvatarFallback>{authUser?.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{authUser?.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {role === 'admin' ? (
          <>
            <Link to={'/admin/dashboard'}>
              <DropdownMenuItem>Admin Dashboard</DropdownMenuItem>
            </Link>
            <Link to={'/admin/manage-problems'}>
              <DropdownMenuItem>Manage Problems</DropdownMenuItem>
            </Link>
            <Link to={'/admin/manage-contests'}>
              <DropdownMenuItem>Manage Contests</DropdownMenuItem>
            </Link>
          </>
        ) : (
          <>
            <Link to={'/profile'}>
              <DropdownMenuItem>My Profile</DropdownMenuItem>
            </Link>
            <Link to={'/my-submissions'}>
              <DropdownMenuItem>My Submissions</DropdownMenuItem>
            </Link>
          </>
        )}
        <DropdownMenuSeparator />
        <LogoutWrapper>
          <DropdownMenuItem>Log out</DropdownMenuItem>
        </LogoutWrapper>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserButton
