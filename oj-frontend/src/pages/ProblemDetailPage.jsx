import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ArrowLeft, BadgeCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { fetchProblemById, submitCode } from '../context/problemfetch';
import CodeEditor from '../components/CodeEditor';

const difficultyColorMap = {
  Easy: 'bg-emerald-500',
  Medium: 'bg-amber-500',
  Hard: 'bg-rose-500',
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
        const initialLanguage = 'javascript';
        setProblem(data);
        setLanguage(initialLanguage);
        setCode(data.defaultCode?.[initialLanguage] || '');
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch problem details.');
      } finally {
        setIsLoading(false);
      }
    };
    getProblem();
  }, [id]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmissionResult(null);
    try {
      const result = await submitCode({ problemId: id, language, code });
      setSubmissionResult(result);
    } catch (err) {
      const errorMessage = err.message || 'Failed to submit solution.';
      setSubmissionResult({ status: 'Error', message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0a0f1e] to-[#101b3f]">
        <Loader2 className="h-16 w-16 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0f1e] text-center p-6">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-3xl font-bold text-white mb-2">Problem Not Found</h2>
        <p className="text-red-300 mb-6">{error || 'Unable to load the problem.'}</p>
        <Link to="/problems">
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Problems
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] to-[#111b30] text-white font-sans px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {/* Problem Description */}
        <div className="bg-[#111827] rounded-3xl p-8 shadow-2xl border border-cyan-900">
          <Link to="/problems" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mb-5">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Problem List
          </Link>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-extrabold text-white drop-shadow-md">{problem.title}</h1>
            <Badge className={`text-white px-3 py-1 rounded-xl ${difficultyColorMap[problem.difficulty]}`}>{problem.difficulty}</Badge>
          </div>

          <div className="prose prose-invert text-slate-300 mb-6 max-w-none prose-p:leading-relaxed prose-p:my-2" dangerouslySetInnerHTML={{ __html: problem.description?.replace(/\n/g, '<br/>') }} />

          {problem.examples?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-white mb-3">Examples</h3>
              <div className="space-y-4">
                {problem.examples.map((ex, index) => (
                  <div key={index} className="bg-gray-800/50 p-4 rounded-xl shadow-sm">
                    <p className="text-white font-semibold">Example {index + 1}</p>
                    <pre className="text-sm text-slate-300 mt-2 whitespace-pre-wrap">
                      <strong>Input:</strong> {ex.input}
                      <br />
                      <strong>Output:</strong> {ex.output}
                      {ex.explanation && <><br /><strong>Explanation:</strong> {ex.explanation}</>}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {problem.sampleTestCases?.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-white mb-3">Sample Test Cases</h3>
              <div className="space-y-3">
                {problem.sampleTestCases.map((test, index) => (
                  <div key={test._id || index} className="bg-gray-700/40 p-4 rounded-lg border border-gray-600">
                    <p className="text-sm text-slate-200"><strong>Input:</strong> {test.input}</p>
                    <p className="text-sm text-slate-200"><strong>Expected Output:</strong> {test.output}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {problem.constraints && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-white mb-3">Constraints</h3>
              <ul className="list-disc pl-6 text-slate-300 space-y-1">
                {Array.isArray(problem.constraints) ? (
                  problem.constraints.map((c, i) => <li key={i}>{c}</li>)
                ) : (
                  <li>{problem.constraints}</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Code Editor & Submission */}
        <div className="flex flex-col bg-[#0d1117] rounded-3xl border border-[#1f2937] shadow-2xl overflow-hidden" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
          <div className="flex-grow min-h-0">
            <CodeEditor
              language={language}
              onLanguageChange={setLanguage}
              code={code}
              onCodeChange={setCode}
            />
          </div>

          <div className="bg-[#161b22] border-t border-white/10 p-4 flex flex-col gap-3">
            {submissionResult && (
              <div
                className={`text-sm font-semibold px-4 py-2 rounded-md transition-all duration-300 ${
                  submissionResult.status === 'Accepted'
                    ? 'text-green-400 bg-green-600/20'
                    : 'text-red-400 bg-red-600/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4" />
                  Submission Status: {submissionResult.status} - {submissionResult.message}
                </div>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !code.trim()}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                'Submit Solution'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetailPage;
