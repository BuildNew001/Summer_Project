import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  fetchMySubmissions,
  fetchSubmissionById,
} from "../context/problemfetch";
import { Button } from "../components/ui/button";

const MySubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    const getSubmissions = async () => {
      try {
        setLoading(true);
        const data = await fetchMySubmissions();
        setSubmissions(data);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to fetch submissions.");
      } finally {
        setLoading(false);
      }
    };
    getSubmissions();
    return () => stopPolling();
  }, []);
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const startPolling = () => {
    if (pollingIntervalRef.current) return;

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const data = await fetchMySubmissions();
        setSubmissions(data);
      } catch (err) {
        console.error("Polling failed during list re-fetch:", err);
        stopPolling();
      }
    }, 5000); 
  };
  useEffect(() => {
    const POLLING_TIMEOUT_MS = 15 * 60 * 1000;

    const isRecentAndPending = (sub) => {
      const isPending = !sub.status || sub.status === "Pending" || sub.status === "In Queue";
      if (!isPending) return false;

      const submissionTime = new Date(sub.createdAt).getTime();
      const now = new Date().getTime();
      return (now - submissionTime) < POLLING_TIMEOUT_MS;
    };

    const shouldBePolling = submissions.some(isRecentAndPending);

    if (shouldBePolling && !pollingIntervalRef.current) {
      startPolling();
    } else if (!shouldBePolling && pollingIntervalRef.current) {
      stopPolling();
    }
  }, [submissions]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0a0f1e]">
        <div className="h-12 w-12 animate-spin border-4 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-400 bg-[#0a0f1e] min-h-screen">
        Error: {error}
      </div>
    );
  }

  const getVerdictClass = (status) => {
    if (status === "Accepted") return "text-green-400 font-bold";
    if (!status || status === "Pending" || status === "In Queue")
      return "text-yellow-400 animate-pulse";
    return "text-red-400"; 
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-200 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 animate-gradient mb-8">
          My Submissions
        </h1>
      </div>
      {submissions.length === 0 ? (
        <div className="text-center bg-slate-900/50 border border-slate-700 rounded-xl p-12 max-w-2xl mx-auto">
          <p className="text-xl text-slate-400 mb-6">
            You have no submissions yet.
          </p>
          <Link to="/problems">
            <Button className="bg-gradient-to-r from-green-400 to-cyan-400 text-black px-6 py-3 text-lg rounded-xl font-bold hover:scale-105 transition shadow-lg">
              Try Solving a Problem
            </Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#10172a] border border-slate-700 rounded-2xl shadow-2xl">
          <table className="min-w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="py-4 px-6 text-left text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  Problem
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  Language
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  Verdict
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  Submitted At
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {submissions.map((sub) => (
                <tr
                  key={sub._id}
                  className="hover:bg-slate-800/40 transition-colors duration-200"
                >
                  <td className="py-4 px-6">
                    <Link
                      to={`/problems/${sub.problem._id}`}
                      className="text-cyan-400 hover:underline font-medium"
                    >
                      {sub.problem.title}
                    </Link>
                  </td>
                  <td className="py-4 px-6 text-slate-300">{sub.language}</td>
                  <td
                    className={`py-4 px-6 font-semibold ${getVerdictClass(
                      sub.status
                    )}`}
                  >
                    {sub.status || "Processing..."}
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    {new Date(sub.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MySubmissionsPage;
