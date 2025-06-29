import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import SubmissionActivity from '../components/SubmissionActivity';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const getAvatarUrl = (seed) =>
  `https://robohash.org/ ${encodeURIComponent(seed)}.png?set=set1&size=200x200`;

const ProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      const fetchSubmissions = async () => {
        try {
          setLoading(true);
          const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
          const response = await axios.get(`${BASE_URL}/api/submissions`, {
            withCredentials: true,
          });
          setSubmissions(response.data);
          setError(null);
        } catch (err) {
          console.error('Failed to fetch submissions:', err.response ? err.response.data : err.message);
          setError('Could not load submission history.');
          toast.error('Could not load submission history.');
        } finally {
          setLoading(false);
        }
      };
      fetchSubmissions();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="text-center mt-20 text-lg text-gray-600 animate-pulse">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center mt-20 text-xl text-gray-500">
        Please log in to view your profile.
      </div>
    );
  }

  const name = user?.UserName || 'User';
  const email = user?.email || 'user@example.com';
  const role = user?.role || 'user';

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0f0f11] via-[#14141c] to-[#1e1e2b] py-12 px-4 md:px-8 transition-all duration-300">
      <div className="max-w-5xl mx-auto rounded-2xl bg-[#1a1a2e]/90 backdrop-blur-md p-6 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/5">

        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center gap-8 mb-10">
          {/* Clean Avatar - matches nav style */}
          <Avatar className="h-24 w-24 rounded-lg ring-1 ring-white/10 shadow-md overflow-hidden">
            <AvatarImage src={getAvatarUrl(email)} alt={name} className="object-cover" />
            <AvatarFallback className="bg-[#24243e] text-gray-300 font-medium text-xl">
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* User Info */}
          <div className="text-center sm:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{user?.fullname || name}</h1>
            <p className="text-gray-400 text-sm md:text-base font-mono mb-2">{email}</p>
            <span className="inline-block bg-gray-700/50 text-gray-300 text-xs font-semibold px-3 py-1 rounded-full">
              {role}
            </span>
          </div>
        </div>

        {/* Submission Activity Section */}
        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">Submission Activity</h2>
          <div className="rounded-xl bg-[#24243e] border border-white/5 p-6 shadow-inner">
            {loading ? (
              <div className="text-center text-gray-400 py-10 text-sm">Loading activity...</div>
            ) : error ? (
              <div className="text-center text-red-400 py-10 text-sm">{error}</div>
            ) : (
              <SubmissionActivity submissions={submissions} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;