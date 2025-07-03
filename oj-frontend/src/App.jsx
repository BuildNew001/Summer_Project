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
import { Loader2, Construction } from 'lucide-react'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/shared/ProtectedRoute' 
import AdminRoute from './components/shared/AdminRoute'
import AdminOrSetterRoute from './components/shared/AdminOrSetterRoute';
import MySubmissionsPage from './pages/MySubmissionsPage';
import ManageProblemsPage from './pages/ManageProblemsPage';

const ComingSoon = ({ pageName, description }) => (
  <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] to-[#101b3f] text-white flex items-center justify-center text-center p-6">
    <div className="animate-fade-in space-y-6">
      <Construction className="h-20 w-20 text-cyan-400 mx-auto animate-pulse" />
      <h1 className="text-5xl font-extrabold bg-gradient-to-r from-cyan-400 to-pink-500 text-transparent bg-clip-text drop-shadow-lg">
        Coming Soon
      </h1>
      <p className="text-xl text-slate-300 max-w-2xl mx-auto">
        The <span className="font-bold text-white">{pageName}</span> page is currently under construction.
      </p>
      <p className="text-slate-400">{description}</p>
    </div>
  </div>
);

const ContestsPage = () => <ComingSoon pageName="Contests" description="Get ready to compete in exciting coding challenges!" />;
const AdminContestsPage = () => <ComingSoon pageName="Contest Management" description="Admins will be able to create, edit, and manage contests from here." />;

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
          <Route path='/' element={<HomePage />} />
          {/* Protected routes for all authenticated users */}
          <Route element={<ProtectedRoute />}>
            <Route path='/problems' element={<ProblemsPage />} />
            <Route path='/problems/:id' element={<ProblemDetailPage />} />
            <Route path='/contests' element={<ContestsPage />} />
            <Route path='/profile' element={<ProfilePage />} />
            <Route path='/my-submissions' element={<MySubmissionsPage />} />
          </Route>

          {/* Protected routes for admins only */}
          <Route element={<AdminRoute />}>
            <Route path='/admin/contests' element={<AdminContestsPage />} />
          </Route>

          {/* Protected routes for admins and setters */}
          <Route element={<AdminOrSetterRoute />}>
            <Route path='/admin/problems' element={<ManageProblemsPage />} />
          </Route>

          {/* Catch-all 404 route */}
          <Route path='*' element={<div>404 Not Found</div>} />
        </Route>
      </Routes>
    </>
  )
}
export default App
