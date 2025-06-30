import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/shared/Navbar'

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
    <Navbar/>
    <main className='flex-grow pt-16'> 
        <Outlet/>
    </main>
    </div>
  )
}

export default Layout