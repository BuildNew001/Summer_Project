import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  fetchMySubmissions,
} from "../context/problemfetch";
import { Button } from "../components/ui/button";
import { ChevronDown, ChevronUp, Code } from "lucide-react";
import CodeEditor from "../components/CodeEditor";

const MySubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

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
  }, []);

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

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const visibleSubmissions = submissions.filter((sub) => sub.problem);

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-200 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 animate-gradient mb-8">
          My Submissions
        </h1>
      </div>
      {visibleSubmissions.length === 0 ? (
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
                <th className="py-4 px-6 text-left text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  Code
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {visibleSubmissions.map((sub) => (
                <React.Fragment key={sub._id}>
                  <tr
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
                      {formatDistanceToNow(new Date(sub.createdAt), {
                        addSuffix: true,
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRow(sub._id)}
                        className="text-slate-400 hover:text-white hover:bg-slate-700"
                      >
                        <Code className="h-4 w-4 mr-2" />
                        {expandedRow === sub._id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </td>
                  </tr>
                  {expandedRow === sub._id && (
                    <tr className="bg-slate-900/20">
                      <td colSpan="5" className="p-0">
                        <div className="p-4">
                          <CodeEditor
                            language={sub.language}
                            code={sub.code}
                            readOnly={true}
                            height="300px"
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MySubmissionsPage;
