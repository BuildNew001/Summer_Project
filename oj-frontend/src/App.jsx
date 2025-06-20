import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Layout from "./layout/layout";
import { Toaster } from "sonner";

import { Loader2 } from "lucide-react";
import { useAuth } from "./context/AuthContext";
const App = () => {
 const {loading , user:authUser , checkAuth} = useAuth()

  useEffect(() => {
    checkAuth();
  }, []);


  const ProblemsPage = () => <div>Problems Page (TODO)</div>;
  const ContestsPage = () => <div>Contests Page (TODO)</div>;
  const ProfilePage = () => <div>Profile Page (TODO)</div>;
  const MySubmissionsPage = () => <div>My Submissions Page (TODO)</div>;
  const AdminDashboardPage = () => <div>Admin Dashboard (TODO)</div>;
  const AdminProblemsPage = () => <div>Admin Manage Problems (TODO)</div>;
  const AdminContestsPage = () => <div>Admin Manage Contests (TODO)</div>;
  const LeaderboardPage = () => <div>Leaderboard Page (TODO)</div>;

  return (
    <>
      <Toaster />
      <Routes>
        <Route element={<Layout />}>
          <Route
             path="/"
            element={<Home />} 
          />
          <Route
            path="/login"
            element={!authUser ? <LoginPage /> : <Navigate to="/" />}
          />
          <Route
            path="/signup"
            element={!authUser ? <SignupPage /> : <Navigate to="/" />}
          />
           <Route path="/problems" element={<ProblemsPage />} />
          <Route path="/contests" element={<ContestsPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
          <Route path="/my-submissions" element={authUser ? <MySubmissionsPage /> : <Navigate to="/login" />} />
          <Route path="/admin/dashboard" element={authUser?.role === 'admin' ? <AdminDashboardPage /> : <Navigate to="/" />} />
          <Route path="/admin/problems" element={authUser?.role === 'admin' ? <AdminProblemsPage /> : <Navigate to="/" />} />
          <Route path="/admin/contests" element={authUser?.role === 'admin' ? <AdminContestsPage /> : <Navigate to="/" />} />
          <Route path="*" element={<div>404 Not Found</div>} /> 
          </Route>
      </Routes>
    </>
  );
};

export default App;
