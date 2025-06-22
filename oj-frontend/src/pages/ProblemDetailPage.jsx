import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { fetchProblemById, submitCode } from '../context/problemfetch';

const difficultyColorMap = {
  Easy: "bg-green-500",
  Medium: "bg-yellow-500",
  Hard: "bg-red-500",
};

const ProblemDetailPage = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  useEffect(() => {
    const getProblem = async () => {
      try {
        setIsLoading(true);
        const data = await fetchProblemById(id);
        setProblem(data);
        setCode(data.defaultCode?.[language] || '');
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to fetch problem details.");
      } finally {
        setIsLoading(false);
      }
    };

    getProblem();
  }, [id, language]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmissionResult(null);
    try {
      const result = await submitCode({ problemId: id, language, code });
      setSubmissionResult(result);
    } catch (err) {
      setSubmissionResult({ status: 'Error', message: err.message || 'Failed to submit solution.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0a0f1e]">
        <Loader2 className="h-16 w-16 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0f1e] text-center p-4">
        <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
        <h3 className="text-2xl font-semibold text-white mb-2">Problem Not Found</h3>
        <p className="text-red-300 mb-6">{error || 'The problem could not be loaded.'}</p>
        <Link to="/problems">
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Problems
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] to-[#101b3f] text-white font-sans p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        <div className="bg-[#111827] rounded-2xl p-6 shadow-xl">
          <Link to="/problems" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Problem List
          </Link>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white">{problem.title}</h1>
            <Badge className={`${difficultyColorMap[problem.difficulty]} text-white`}>{problem.difficulty}</Badge>
          </div>
          <div className="prose prose-invert text-slate-300 max-w-none mb-6" dangerouslySetInnerHTML={{ __html: problem.description?.replace(/\n/g, '<br/>') }} />
          {problem.examples?.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Examples</h3>
              {problem.examples.map((ex, index) => (
                <div key={index} className="bg-gray-800/50 p-4 rounded-lg mb-4">
                  <p className="font-semibold text-white">Example {index + 1}:</p>
                  <pre className="text-sm text-slate-300 whitespace-pre-wrap mt-2"><code>
                    <strong>Input:</strong> {ex.input}\n
                    <strong>Output:</strong> {ex.output}
                    {ex.explanation && `\nExplanation: ${ex.explanation}`}
                  </code></pre>
                </div>
              ))}
            </div>
          )}
          {problem.sampleTestCases?.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Sample Test Cases</h3>
              {problem.sampleTestCases.map((test, index) => (
                <div key={test._id || index} className="bg-gray-700/30 p-4 rounded-lg mb-3">
                  <p className="text-sm text-slate-200"><strong>Input:</strong> {test.input}</p>
                  <p className="text-sm text-slate-200"><strong>Expected Output:</strong> {test.output}</p>
                </div>
              ))}
            </div>
          )}
          {problem.constraints && (
            <>
              <h3 className="text-xl font-semibold text-white mt-6 mb-2">Constraints</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                {Array.isArray(problem.constraints)
                  ? problem.constraints.map((c, i) => <li key={i}>{c}</li>)
                  : <li>{problem.constraints}</li>}
              </ul>
            </>
          )}
        </div>

        <div className="flex flex-col bg-[#111827] rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gray-900 p-3 flex justify-between items-center">
            <span className="text-sm font-medium">Language: {language}</span>
          </div>
          <div className="flex-grow relative">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-[300px] lg:h-full bg-[#0d1117] text-white font-mono text-sm p-4 resize-none focus:ring-2 focus:ring-cyan-500 border-0 rounded-none"
              placeholder="Write your code here..."
              spellCheck="false"
            />
          </div>
          <div className="bg-gray-900 border-t border-white/10 p-4 flex flex-col gap-3">
            {submissionResult && (
              <div className={`text-sm font-bold px-3 py-2 rounded-md ${
                submissionResult.status === 'Accepted' ? 'text-green-400 bg-green-600/20' : 'text-red-400 bg-red-600/10'
              }`}>
                {submissionResult.status}: {submissionResult.message}
              </div>
            )}
            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !code.trim()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : 'Submit'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetailPage;