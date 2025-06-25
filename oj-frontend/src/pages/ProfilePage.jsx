import React from 'react';
import { useAuth } from '../context/AuthContext';
const ProfilePage = () => {
  const { user } = useAuth();
  return (
    <div className="container mx-auto p-8 text-white animate-fade-in">
      <h1 className="text-4xl font-bold mb-4">Profile Page</h1>
      <p>Welcome to your profile. More content will be added here soon!</p>
      {user && (
        <div className="mt-6 p-6 bg-white/10 rounded-lg border border-white/20">
          <h2 className="text-2xl font-semibold mb-3">Your Details</h2>
          <p className="mb-1"><strong>Full Name:</strong> {user.fullname}</p>
          <p className="mb-1"><strong>Username:</strong> {user.UserName}</p>
          <p className="mb-1"><strong>Email:</strong> {user.email}</p>
          <p className="mb-1"><strong>Role:</strong> <span className="capitalize font-semibold">{user.role}</span></p>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;