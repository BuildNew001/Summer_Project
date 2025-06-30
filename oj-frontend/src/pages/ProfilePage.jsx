import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchMySubmissions } from '../context/problemfetch';
import SubmissionActivity from '../components/SubmissionActivity';
import RecentSubmissions from '../components/RecentSubmissions';
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
  const isInitialLoad = React.useRef(true);
  // Add a ref to track the last fetch time to prevent excessive refetching.
  const lastFetchTime = React.useRef(0);

  // By depending on a stable primitive value like an email or ID instead of the whole user object,
  // we can prevent our effects from running in a loop.
  const userIdentifier = user?.email;

  // Using useCallback to create a stable function reference for our effects.
  const loadSubmissions = useCallback(async () => {
    // Prevent refetching if the last fetch was less than 30 seconds ago.
    // This stops rapid-fire requests when switching tabs quickly, while keeping data fresh.
    const now = Date.now();
    if (!isInitialLoad.current && now - lastFetchTime.current < 30000) {
      return;
    }

    if (!userIdentifier) {
      return; // Don't fetch if there's no user.
    }
    try {
      // On subsequent fetches (like from window focus), we don't need to show a full loading screen.
      // The data will just refresh in the background.
      const data = await fetchMySubmissions();
      setSubmissions(data);
      setError(null); // Clear any previous errors on success.
      // Update the last fetch time only on a successful fetch.
      lastFetchTime.current = now;
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
      setError('Could not load submission history.');
      toast.error('Could not load submission history.');
    }
  }, [userIdentifier]); // This function is now stable as long as the user's identifier doesn't change.

  // Effect for the initial data load when the component mounts or user changes.
  useEffect(() => {
    // We check userIdentifier here to decide if we should fetch.
    if (userIdentifier && !authLoading) {
      setLoading(true); // Show loader only for the initial fetch.
      loadSubmissions().finally(() => {
        setLoading(false);
        // After the first successful load, subsequent focus events should trigger a refetch.
        isInitialLoad.current = false;
      });
    } else if (!authLoading) {
      // If auth is done loading and there's still no user, stop the loading state.
      setLoading(false);
    }
    // This effect now runs only when the user's identifier or auth status changes,
    // preventing the loop of requests.
  }, [userIdentifier, authLoading, loadSubmissions]);

  // Effect to refetch data whenever the user focuses on the window (e.g., switches back to the tab).
  // This keeps the data fresh after making a submission on another page.
  useEffect(() => {
    const handleFocus = () => {
      // We prevent refetching on the very first focus event, which happens on page load.
      if (!isInitialLoad.current) {
        loadSubmissions();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadSubmissions]);

  // Memoize the list of recent submissions to prevent re-sorting on every render.
  // This also ensures the RecentSubmissions component only receives the data it needs.
  const recentSubmissions = useMemo(() => {
    if (!submissions || submissions.length === 0) return [];
    // Sort by date descending to get the most recent first, then take the top 10.
    return [...submissions]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);
  }, [submissions]);

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
      <div className="max-w-5xl mx-auto space-y-12">

        {/* Profile Header */}
        <div className="rounded-2xl bg-[#1a1a2e]/90 backdrop-blur-md p-6 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/5 flex flex-col sm:flex-row items-center gap-8">
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

        {/* Activity & Submissions Container */}
        {loading ? (
          <div className="text-center text-gray-400 py-10 text-sm">Loading activity...</div>
        ) : error ? (
          <div className="text-center text-red-400 py-10 text-sm">{error}</div>
        ) : (
          <div className="grid grid-cols-1 gap-12">
            {/* Submission Activity Section */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1c1c2e] to-[#14141c] shadow-2xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Submission Activity</h2>
              <SubmissionActivity submissions={submissions} />
            </div>

            {/* Recent Submissions Section - only renders if there are submissions */}
            {recentSubmissions.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1c1c2e] to-[#14141c] shadow-2xl p-6 md:p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Recent Submissions</h2>
                <RecentSubmissions submissions={recentSubmissions} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;