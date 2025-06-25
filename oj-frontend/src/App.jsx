import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import Layout from './layout/layout'
import { Toaster } from 'sonner'
import ProblemsPage from './pages/ProblemsPage'
import ProblemDetailPage from './pages/ProblemDetailPage'
import ProfilePage from './pages/ProfilePage' 
import { Loader2 } from 'lucide-react'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/shared/ProtectedRoute' 
import AdminRoute from './components/shared/AdminRoute'
// TODO: Create these page components in their own files inside src/pages
const ContestsPage = () => <div className='p-8 text-white'>Contests Page (TODO)</div>
const MySubmissionsPage = () => <div className='p-8 text-white'>My Submissions Page (TODO)</div>
const AdminDashboardPage = () => <div className='p-8 text-white'>Admin Dashboard (TODO)</div>
const AdminProblemsPage = () => <div className='p-8 text-white'>Admin Manage Problems (TODO)</div>
const AdminContestsPage = () => <div className='p-8 text-white'>Admin Manage Contests (TODO)</div>
const LeaderboardPage = () => <div className='p-8 text-white'>Leaderboard Page (TODO)</div>

const App = () => {
  const { loading, user: authUser } = useAuth()
  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen bg-[#0a0f1e]'>
        <Loader2 className='h-16 w-16 animate-spin text-cyan-400' />
      </div>
    )
  }

  return (
    <>
      <Toaster />
      <Routes>
        <Route element={<Layout />}>
          {/* Public routes */}
          <Route path='/login' element={<LoginPage />} />
          <Route path='/signup' element={<SignupPage />} />

          {/* Protected routes for all authenticated users */}
          <Route element={<ProtectedRoute />}>
            <Route path='/' element={<HomePage />} />
            <Route path='/problems' element={<ProblemsPage />} />
            <Route path='/problems/:id' element={<ProblemDetailPage />} />
            <Route path='/contests' element={<ContestsPage />} />
            <Route path='/leaderboard' element={<LeaderboardPage />} />
            <Route path='/profile' element={<ProfilePage />} />
            <Route path='/my-submissions' element={<MySubmissionsPage />} />
          </Route>

          {/* Protected routes for admins only */}
          <Route element={<AdminRoute />}>
            <Route path='/admin/dashboard' element={<AdminDashboardPage />} />
            <Route path='/admin/problems' element={<AdminProblemsPage />} />
            <Route path='/admin/contests' element={<AdminContestsPage />} />
          </Route>

          {/* Catch-all 404 route */}
          <Route path='*' element={<div>404 Not Found</div>} />
        </Route>
      </Routes>
    </>
  )
}
export default App
