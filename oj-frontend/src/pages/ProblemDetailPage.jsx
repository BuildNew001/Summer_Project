import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ArrowLeft, Sparkles, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { fetchProblemById, submitCode, getAIReview, fetchSubmissionById } from '../context/problemfetch';
import CodeEditor from '../components/CodeEditor';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
// Boilerplate code per language
const boilerplate = {
  cpp: `#include <iostream>
int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`,
  c: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  py: `# Your Python code here
print("Hello, World!")`,
};

const difficultyColorMap = {
  Easy: 'bg-emerald-500',
  Medium: 'bg-amber-500',
  Hard: 'bg-rose-500',
};
const AIReviewModal = ({ isOpen, onClose, isLoading, reviewContent }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-[#111827] rounded-2xl p-8 shadow-2xl border border-cyan-700 max-w-3xl w-full relative max-h-[90vh] flex flex-col">
        <Button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-black" variant="ghost" size="icon">
          <X className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-bold mb-4 text-cyan-400 flex items-center gap-2">
          <Sparkles className="h-6 w-6" />
          <span>AI For Edge Case</span>
        </h2>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center flex-grow min-h-[200px]">
            <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />
            <p className="mt-4 text-slate-300">Analyzing your code... This may take a moment.</p>
          </div>
        ) : (
          <div className="prose prose-invert max-w-none text-slate-300 overflow-y-auto pr-4">
            <ReactMarkdown>{reviewContent}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

const ProblemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [problem, setProblem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiReviewing, setIsAiReviewing] = useState(false);
  const [aiReviewContent, setAiReviewContent] = useState('');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [submissionResult, setSubmissionResult] = useState('');
  const pollingIntervalRef = useRef(null);
  const pollingTimeoutRef = useRef(null);

  useEffect(() => {
    const getProblem = async () => {
      try {
        setIsLoading(true);
        const data = await fetchProblemById(id);
        setProblem(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch problem details.');
      } finally {
        setIsLoading(false);
      }
    };

    getProblem();
  }, [id]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => stopPolling();
  }, []);

  useEffect(() => {
    if (!problem) return;

    const savedCode = localStorage.getItem(`code-${id}-${language}`);
    if (savedCode) {
      setCode(savedCode);
      return;
    }

    const defaultCode = problem.defaultCode?.[language];
    setCode(defaultCode && defaultCode.trim() ? defaultCode : boilerplate[language]);
  }, [id, language, problem]);

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
  };

  const startPolling = (submissionId) => {
    stopPolling();

    const POLLING_INTERVAL = 15000; // 15 seconds
    const POLLING_TIMEOUT = 15 * 60 * 1000; // 15 minutes

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const submission = await fetchSubmissionById(submissionId);
        const { status, executionTime, memoryUsed, output } = submission;

        if (status && status !== 'Pending' && status !== 'In Queue') {
          stopPolling();
          setIsSubmitting(false);

          let resultText = `Verdict: ${status}\n`;
          if (executionTime) resultText += `Execution Time: ${executionTime.toFixed(2)} ms\n`;
          if (memoryUsed) resultText += `Memory Used: ${(memoryUsed / 1024).toFixed(2)} KB\n`;
          if (status === 'Compilation Error' || status !== 'Accepted') {
            resultText += `\nDetails:\n${output || 'No output available.'}`;
          }
          setSubmissionResult(resultText);

          if (status === 'Accepted') {
            toast.success('Congratulations! Your solution was accepted!');
          } else {
            toast.error(`Submission failed: ${status}`);
          }
        } else {
          setSubmissionResult(`Status: ${status || 'In Queue'}...`);
        }
      } catch (err) {
        stopPolling();
        setIsSubmitting(false);
        setSubmissionResult('Error fetching submission status. Please check "My Submissions" page.');
        toast.error('Could not get submission result.');
      }
    }, POLLING_INTERVAL);

    pollingTimeoutRef.current = setTimeout(() => {
      stopPolling();
      setIsSubmitting(false);
      const timeoutMessage =
        'Server is taking too long to respond. Please check the "My Submissions" page later for the verdict.';
      setSubmissionResult(timeoutMessage);
      toast.warning('Server is busy.', {
        description:
          'Your submission is still being processed. You can check the result on the "My Submissions" page.',
        duration: 10000,
      });
    }, POLLING_TIMEOUT);
  };

  const handleSubmit = async () => {
    if(!user){
      toast.error('Please log in to submit solutions.');
      navigate('/login', { state: { from: location } });
      return;
    }
    setIsSubmitting(true);
    setSubmissionResult('Submitting your solution...');
    try {
      localStorage.setItem(`code-${id}-${language}`, code);
      const submissionResponse = await submitCode({ problemId: id, language, code });
      toast.success('Solution submitted! Waiting for verdict...');
      startPolling(submissionResponse.submissionId);
    } catch (err) {
      toast.error(err.message || 'Failed to submit solution.');
      setIsSubmitting(false);
      setSubmissionResult(`Submission failed: ${err.message}`);
    }
  };

  const handleAiReview = async () => {
    if(!user){
      toast.error('Please log in to submit solutions.');
      navigate('/login', { state: { from: location } });
      return;
    }
    if (!code.trim()) {
      toast.warning('Please write some code to review.');
      return;
    }
    setIsAiReviewing(true);
    setIsAiModalOpen(true);
    setAiReviewContent('');
    try {
      const result = await getAIReview({ problemId: id, code });
      setAiReviewContent(result.review);
    } catch (err) {
      toast.error(err.message || 'An error occurred during AI review.');
      setAiReviewContent('Could not retrieve AI review. Please try again.');
    } finally {
      setIsAiReviewing(false);
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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] to-[#111b30] text-white font-sans px-6 py-10 animate-fade-in-up">
      <AIReviewModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        isLoading={isAiReviewing}
        reviewContent={aiReviewContent}
      />
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        {/* Problem Description */}
        <div className="bg-[#111827] rounded-3xl p-8 shadow-[0_0_40px_rgba(0,255,255,0.1)] border border-cyan-900 overflow-auto">
          <Link to="/problems" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mb-5">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Problem List
          </Link>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-extrabold text-white drop-shadow-md tracking-tight">
              {problem.title}
            </h1>
            <Badge className={`text-white px-3 py-1 rounded-xl text-sm ${difficultyColorMap[problem.difficulty]}`}>
              {problem.difficulty}
            </Badge>
          </div>

          <div className="prose prose-invert text-slate-300 mb-6 max-w-none prose-p:leading-relaxed prose-p:my-2">
            <ReactMarkdown>{problem.description}</ReactMarkdown>
          </div>

          {problem.examples?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-white mb-3">Examples</h3>
              <div className="space-y-4">
                {problem.examples.map((ex, index) => (
                  <div key={index} className="bg-gray-800/40 p-4 rounded-xl shadow-inner border border-gray-700">
                    <p className="text-white font-semibold">Example {index + 1}</p>
                    <pre className="text-sm text-slate-300 mt-2 whitespace-pre-wrap">
                      <strong>Input:</strong> {ex.input}
                      <br />
                      <strong>Output:</strong> {ex.output}
                      {ex.explanation && (
                        <>
                          <br />
                          <strong>Explanation:</strong> {ex.explanation}
                        </>
                      )}
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
                  <div key={test._id || index} className="bg-gray-800/40 p-4 rounded-lg border border-gray-700">
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

        {/* Code Editor */}
        <div className="flex flex-col gap-6 bg-[#111827] rounded-3xl p-6 border border-[#2f3542] shadow-2xl">
          <CodeEditor
            language={language}
            onLanguageChange={setLanguage}
            code={code}
            onCodeChange={setCode}
            submissionResult={submissionResult}
          />

          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <Button
              onClick={handleAiReview}
              disabled={isAiReviewing || isSubmitting || !code.trim()}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-xl text-sm font-semibold px-6 py-3 rounded-xl"
            >
              {isAiReviewing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Getting Review...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> AI For Edge Case
                </>
              )}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isAiReviewing || !code.trim()}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-xl text-sm font-semibold px-6 py-3 rounded-xl"
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
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
