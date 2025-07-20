import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  X,
  Users,
  Copy,
  LogOut,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import {
  fetchProblemById,
  submitCode,
  getAIReview,
  fetchSubmissionById,
} from "../context/problemfetch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CodeEditor from "../components/CodeEditor";
import ChatPanel from "../components/ChatPanel";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../context/AuthContext";
import { v4 as uuidv4 } from "uuid";
import { cn } from "../lib/utils";
import { MonacoBinding } from "y-monaco";
import { YjsCollabProvider, useYjsCollab } from "../context/YjsCollabProvider";

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
  Easy: "bg-emerald-500",
  Medium: "bg-amber-500",
  Hard: "bg-rose-500",
};

/**
 * AIReviewModal component displays the AI review content in a modal.
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {function} props.onClose - Function to close the modal.
 * @param {boolean} props.isLoading - Whether the AI review is loading.
 * @param {string} props.reviewContent - The content of the AI review.
 */
const AIReviewModal = ({ isOpen, onClose, isLoading, reviewContent }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-[#111827] rounded-2xl p-8 shadow-2xl border border-cyan-700 max-w-3xl w-full relative max-h-[90vh] flex flex-col">
        <Button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-black"
          variant="ghost"
          size="icon"
        >
          <X className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-bold mb-4 text-cyan-400 flex items-center gap-2">
          <Sparkles className="h-6 w-6" />
          <span>AI For Edge Case</span>
        </h2>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center flex-grow min-h-[200px]">
            <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />
            <p className="mt-4 text-slate-300">
              Analyzing your code... This may take a moment.
            </p>
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

/**
 * MainContent component displays the problem description, code editor, and action buttons.
 * It is memoized for performance optimization.
 */
const MainContent = React.memo(
  ({
    problem, language, setLanguage, code, handleCodeChange, handleCursorChange, cursors,
    submissionResult, isInCollabSession, handleCopyLink, handleLeaveCollaboration,
    handleAiReview, isAiReviewing, isSubmitting, handleSubmit, sessionId,
    handleCollaboration, participants, isConnected,
    onCodeEditorMount
  }) => (
    <div className="flex flex-col gap-10 h-full overflow-y-auto pr-2">
      {/* Problem Description */}
      <div className="bg-[#111827] rounded-3xl p-8 shadow-[0_0_40px_rgba(0,255,255,0.1)] border border-cyan-900 overflow-auto">
        <Link
          to="/problems"
          className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mb-5"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Problem List
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-extrabold text-white drop-shadow-md tracking-tight">
            {problem.title}
          </h1>
          <Badge
            className={`text-white px-3 py-1 rounded-xl text-sm ${
              difficultyColorMap[problem.difficulty]
            }`}
          >
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
                <div
                  key={index}
                  className="bg-gray-800/40 p-4 rounded-xl shadow-inner border border-gray-700"
                >
                  <p className="text-white font-semibold">
                    Example {index + 1}
                  </p>
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
            <h3 className="text-xl font-semibold text-white mb-3">
              Sample Test Cases
            </h3>
            <div className="space-y-3">
              {problem.sampleTestCases.map((test, index) => (
                <div
                  key={test._id || index}
                  className="bg-gray-800/40 p-4 rounded-lg border border-gray-700"
                >
                  <p className="text-sm text-slate-200">
                    <strong>Input:</strong> {test.input}
                  </p>
                  <p className="text-sm text-slate-200">
                    <strong>Expected Output:</strong> {test.output}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {problem.constraints && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-white mb-3">
              Constraints
            </h3>
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
        {isInCollabSession && (
          <div
            className={cn(
              "bg-gradient-to-r from-purple-900/30 to-indigo-900/30 p-4 rounded-xl border border-purple-700 animate-fade-in shadow-lg shadow-purple-500/10",
              "animate-pulse"
            )}
          >
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Users className="h-7 w-7 text-purple-300" />
                  <span
                    className={cn(
                      "absolute top-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-[#111827]",
                      isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
                    )}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-purple-200">
                    Live Collaboration Active
                  </h3>
                  <p className="text-sm text-slate-400">
                    {isConnected
                      ? `${Object.keys(participants).length} participant(s)`
                      : "Connecting..."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleCopyLink}
                        variant="outline"
                        size="sm"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                      >
                        <Copy className="mr-2 h-4 w-4" /> Copy Invite Link
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-800 text-white border-slate-700">
                      <p>Copy a link to invite others to this session.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button
                  onClick={handleLeaveCollaboration}
                  variant="destructive"
                  size="sm"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Leave Session
                </Button>
              </div>
            </div>
          </div>
        )}

        {isInCollabSession && !isConnected && (
          <div className="bg-yellow-900/30 border border-yellow-700 p-4 rounded-xl mb-4">
            <p className="text-yellow-200 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Connecting to collaboration server...
            </p>
          </div>
        )}

        {/* CodeEditor component */}
        <CodeEditor
          language={language}
          onLanguageChange={setLanguage}
          code={code} 
          onCodeChange={handleCodeChange} 
          onMount={onCodeEditorMount}
          onCursorChange={handleCursorChange}
          cursors={cursors}
          submissionResult={submissionResult}
          readOnly={isInCollabSession && !isConnected}
          isInCollabSession={isInCollabSession}
        />

        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <Button
            onClick={handleAiReview}
            disabled={
              isAiReviewing || isSubmitting || !code.trim() || isInCollabSession
            } 
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-xl text-sm font-semibold px-6 py-3 rounded-xl"
          >
            {isAiReviewing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Getting
                Review...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> AI For Edge Case
              </>
            )}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting || isAiReviewing || !code.trim() || isInCollabSession
            } 
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-xl text-sm font-semibold px-6 py-3 rounded-xl"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              "Submit Solution"
            )}
          </Button>
          {!sessionId && (
            <Button
              onClick={handleCollaboration}
              disabled={isSubmitting || isAiReviewing}
              className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-xl text-sm font-semibold px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <>
                <Users className="mr-2 h-4 w-4" /> Start Collab
              </>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
);
const ProblemDetailPage = () => {
  const { id, sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { ydoc, awareness, connectionStatus } = useYjsCollab();
  const isConnected = connectionStatus === "connected";

  const [problem, setProblem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(""); 
  const [cursors, setCursors] = useState({});
  const [chatMessages, setChatMessages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiReviewing, setIsAiReviewing] = useState(false);
  const [aiReviewContent, setAiReviewContent] = useState("");
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [submissionResult, setSubmissionResult] = useState("");
  const [currentSubmissionId, setCurrentSubmissionId] = useState(null);
  const [hostId, setHostId] = useState(null);
  const [participants, setParticipants] = useState([]);

  const editorRef = useRef(null); 
  const monacoBindingRef = useRef(null); 
  const pollingIntervalRef = useRef(null);
  const pollingTimeoutRef = useRef(null);

  const isInCollabSession = !!sessionId;

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
  }, []);

  const fetchFullSubmissionDetails = useCallback(async (submissionId) => {
    try {
      const submission = await fetchSubmissionById(submissionId);
      const { status, executionTime, memoryUsed, output } = submission;

      setIsSubmitting(false);

      let resultText = `Verdict: ${status}\n`;
      if (executionTime != null)
        resultText += `Execution Time: ${executionTime.toFixed(2)} ms\n`;
      if (memoryUsed != null)
        resultText += `Memory Used: ${(memoryUsed / 1024).toFixed(2)} KB\n`;

      if (status === "Accepted") {
        resultText += `\nOutput:\n${output || 'Program ran successfully with no output.'}`;
        toast.success("Congratulations! Your solution was accepted!");
      } else if (status === 'Compilation Error') {
        resultText += `\nCompilation Details:\n${output || 'No compilation output available.'}`;
        toast.error('Submission failed: Compilation Error');
      } else {
        resultText += `\nDetails:\n`;
        if (output) {
          try {
            const details = JSON.parse(output);
            if (typeof details === "object" && details !== null && (details.input || details.userOutput)) {
              resultText += (details.message || `Failed on a test case`) + "\n\n";
              resultText += `Input:\n${details.input}\n\n`;
              resultText += `Your Output:\n${details.userOutput}\n\n`;
              resultText += `Expected Output:\n${details.expectedOutput}\n`;
            } else {
              resultText += output;
            }
          } catch (e) {
            resultText += output;
          }
        } else {
          resultText += "No detailed output available for this error.";
        }
        toast.error(`Submission failed: ${status}`);
      }
      setSubmissionResult(resultText);

    } catch (err) {
      setIsSubmitting(false);
      setSubmissionResult(
        'Error fetching submission status. Please check "My Submissions" page.'
      );
      toast.error("Could not get submission result.");
    } finally {
    }
  }, []);
  useEffect(() => {
    const getProblem = async () => {
      try {
        setIsLoading(true);
        const data = await fetchProblemById(id);
        setProblem(data);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to fetch problem details.");
      } finally {
        setIsLoading(false);
      }
    };
    getProblem();
  }, [id]);
  useEffect(() => {
    if (!isInCollabSession || !ydoc || !awareness || !problem) return;

    const yText = ydoc.getText("codetext");
    const yChat = ydoc.getArray("chatMessages");
    const handleCodeUpdate = () => {
      setCode(yText.toString());
    };
    const handleChatUpdate = () => setChatMessages(yChat.toArray());
    const handleAwarenessChange = () => {
      const states = Array.from(awareness.getStates().values());
      const currentParticipants = states.map((s) => s.user).filter(Boolean);
      setParticipants(currentParticipants);

      const cursorsData = {};
      states.forEach((state, clientId) => {
        if (state.cursor && state.user) {
          cursorsData[clientId] = { ...state.cursor, user: state.user };
        }
      });
      setCursors(cursorsData);

      const host = states.find((s) => s.user?.isHost);
      setHostId(host?.user?.id || null);
    };
    yText.observe(handleCodeUpdate);
    yChat.observe(handleChatUpdate);
    awareness.on("change", handleAwarenessChange);
    handleChatUpdate();
    handleAwarenessChange();
    return () => {
      yText.unobserve(handleCodeUpdate);
      yChat.unobserve(handleChatUpdate);
      awareness.off("change", handleAwarenessChange);
    };
  }, [isInCollabSession, ydoc, awareness, problem, language]); 
  useEffect(() => {
    if (currentSubmissionId && !pollingIntervalRef.current) {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
      setSubmissionResult("Status: In Queue...");

      const POLLING_INTERVAL = 10000; 
      const POLLING_TIMEOUT = 3 * 60 * 1000; 

      pollingIntervalRef.current = setInterval(async () => {
        console.log(`Polling for submission ${currentSubmissionId}...`);
        try {
          const submission = await fetchSubmissionById(currentSubmissionId);
          if (submission.status !== 'In Queue' && submission.status !== 'Running' && submission.status !== 'Compiling' && submission.status !== 'Pending') {
            stopPolling();
            setCurrentSubmissionId(null);
            setIsSubmitting(false);
            fetchFullSubmissionDetails(submission._id);
          } else {
            setSubmissionResult(`Status: ${submission.status || 'In Queue'}...`);
          }
        } catch (err) {
          console.error("Polling error for submission:", currentSubmissionId, err);
          stopPolling();
          setCurrentSubmissionId(null);
          setIsSubmitting(false);
          setSubmissionResult('Error fetching submission status.');
          toast.error('Could not get submission result via polling.');
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
    } else {
      stopPolling(); 
    }
    return () => {
      stopPolling();
    };
  }, [currentSubmissionId, fetchFullSubmissionDetails, stopPolling]);

  const handleCursorChange = useCallback(
    (cursorPosition) => {
      if (awareness) {
        awareness.setLocalStateField("cursor", cursorPosition);
      }
    },
    [awareness]
  );
  const handleCodeChange = useCallback(
    (newCode) => {
      if (!isInCollabSession) {
        setCode(newCode);
        localStorage.setItem(`code-${id}-${language}`, newCode);
      }
    },
    [isInCollabSession, id, language]
  );

  const handleCodeEditorMount = useCallback((editor) => {
    editorRef.current = editor;
    const model = editor.getModel();

    if (!model) {
      console.error("Monaco editor model not available on mount.");
      return;
    }

    if (isInCollabSession && ydoc && awareness && problem) {
      if (monacoBindingRef.current) {
        monacoBindingRef.current.destroy();
        monacoBindingRef.current = null;
      }

      const yText = ydoc.getText("codetext");
      if (yText.length === 0) {
        const currentLocalCode = localStorage.getItem(`code-${id}-${language}`) || "";
        const initialContent = currentLocalCode.trim() ? currentLocalCode : (problem.defaultCode?.[language] || boilerplate[language]);
        ydoc.transact(() => {
          yText.insert(0, initialContent);
        });
      }
      monacoBindingRef.current = new MonacoBinding(
        yText,
        model,
        new Set([editor]),
        awareness
      );
      setCode(yText.toString());

    } else if (!isInCollabSession) {
      const savedCode = localStorage.getItem(`code-${id}-${language}`);
      const initialCode = savedCode && savedCode.trim() ? savedCode : (problem.defaultCode?.[language] || boilerplate[language]);
      model.setValue(initialCode); 
      setCode(initialCode); 
    }
    return () => {
      if (monacoBindingRef.current) {
        monacoBindingRef.current.destroy();
        monacoBindingRef.current = null;
      }
    };
  }, [isInCollabSession, ydoc, awareness, problem, language, id]);
  const handleSendMessage = useCallback(
    (text) => {
      if (!text.trim() || !ydoc) return;
      ydoc.transact(() => {
        const yChat = ydoc.getArray("chatMessages");
        yChat.push([
          {
            user: {
              id: user?._id,
              name: user?.UserName,
              email: user?.email
            },
            text,
            timestamp: Date.now(),
          },
        ]);
      });
    },
    [ydoc, user]
  );
  const handleSubmit = useCallback(async () => {
    if (!user) {
      toast.error("Please log in to submit solutions.");
      navigate("/login", { state: { from: location } });
      return;
    }
    const codeToSubmit = editorRef.current?.getValue();
    if (!codeToSubmit || !codeToSubmit.trim()) {
      toast.warning("Please write some code before submitting.");
      return;
    }

    setIsSubmitting(true);
    setCurrentSubmissionId(null);
    setSubmissionResult("Submitting your solution...");
    if (!isInCollabSession) {
      localStorage.setItem(`code-${id}-${language}`, codeToSubmit);
    }

    try {
      const submissionResponse = await submitCode({
        problemId: id,
        language,
        code: codeToSubmit,
      });
      toast.success("Solution submitted! Waiting for verdict...");
      setCurrentSubmissionId(submissionResponse.submissionId);
    } catch (err) {
      toast.error(err.message || "Failed to submit solution.");
      setIsSubmitting(false);
      setSubmissionResult(`Submission failed: ${err.message}`);
      setCurrentSubmissionId(null);
    }
  }, [user, navigate, location, id, language, isInCollabSession]);
  const handleAiReview = useCallback(async () => {
    if (!user) {
      toast.error("Please log in to get AI review.");
      navigate("/login", { state: { from: location } });
      return;
    }
    const codeToReview = editorRef.current?.getValue();
    if (!codeToReview || !codeToReview.trim()) {
      toast.warning("Please write some code to review.");
      return;
    }

    setIsAiReviewing(true);
    setIsAiModalOpen(true);
    setAiReviewContent(""); 
    try {
      const result = await getAIReview({ problemId: id, code: codeToReview });
      setAiReviewContent(result.review);
    } catch (err) {
      toast.error(err.message || "An error occurred during AI review.");
      setAiReviewContent("Could not retrieve AI review. Please try again.");
    } finally {
      setIsAiReviewing(false);
    }
  }, [user, navigate, location, id]);

  /**
   * Initiates a new collaboration session by generating a unique session ID and navigating.
   */
  const handleCollaboration = useCallback(() => {
    if (!user) {
      toast.error("Please log in to start a collaboration session.");
      navigate("/login", { state: { from: location } });
      return;
    }
    const newSessionId = uuidv4();
    navigate(`/problems/${id}/collab/${newSessionId}`);
  }, [user, navigate, location, id]);
  const handleLeaveCollaboration = useCallback(() => {
    if (editorRef.current) {
        localStorage.setItem(`code-${id}-${language}`, editorRef.current.getValue());
    }
    navigate(`/problems/${id}`);
  }, [navigate, id, language]);
  const handleCopyLink = useCallback(() => {
    const joinLink = `${window.location.origin}/problems/${id}/collab/${sessionId}/join`;
    const tempInput = document.createElement('textarea');
    tempInput.value = joinLink;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    toast.success("Invite link copied to clipboard!");
  }, [id, sessionId]);

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
        <h2 className="text-3xl font-bold text-white mb-2">
          Problem Not Found
        </h2>
        <p className="text-red-300 mb-6">
          {error || "Unable to load the problem."}
        </p>
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
      {/* AI Review Modal */}
      <AIReviewModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        isLoading={isAiReviewing}
        reviewContent={aiReviewContent}
      />
      {/* Conditional rendering for collaboration layout vs. single-user layout */}
      {isInCollabSession ? (
        <ResizablePanelGroup
          direction="horizontal"
          className="max-w-full mx-auto rounded-lg h-[calc(100vh-80px)]"
        >
          <ResizablePanel defaultSize={65}>
            <div className="h-full p-1">
              <MainContent
                problem={problem}
                language={language}
                setLanguage={setLanguage}
                code={code}
                handleCodeChange={handleCodeChange}
                handleCursorChange={handleCursorChange}
                cursors={cursors}
                submissionResult={submissionResult}
                isInCollabSession={isInCollabSession}
                handleCopyLink={handleCopyLink}
                handleLeaveCollaboration={handleLeaveCollaboration}
                handleAiReview={handleAiReview}
                isAiReviewing={isAiReviewing}
                isSubmitting={isSubmitting}
                handleSubmit={handleSubmit}
                sessionId={sessionId}
                handleCollaboration={handleCollaboration}
                participants={participants}
                isConnected={isConnected}
                onCodeEditorMount={handleCodeEditorMount}
              />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={35}>
            <div className="h-full p-1 pl-2">
              <ChatPanel
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                isSessionActive={isInCollabSession}
                participants={participants}
                hostId={hostId}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <div className="max-w-7xl mx-auto">
          <MainContent
            problem={problem}
            language={language}
            setLanguage={setLanguage}
            code={code}
            onCodeChange={handleCodeChange}
            handleCursorChange={null}
            cursors={null} 
            submissionResult={submissionResult}
            isInCollabSession={isInCollabSession}
            handleCopyLink={handleCopyLink} 
            handleLeaveCollaboration={null} 
            handleAiReview={handleAiReview}
            isAiReviewing={isAiReviewing}
            isSubmitting={isSubmitting}
            handleSubmit={handleSubmit}
            sessionId={sessionId}
            handleCollaboration={handleCollaboration}
            participants={null} 
            isConnected={false} 
            onCodeEditorMount={handleCodeEditorMount}
          />
        </div>
      )}
    </div>
  );
};

const ProblemDetailPageWrapper = () => {
  const { sessionId } = useParams();
  return (
    <YjsCollabProvider roomId={sessionId}>
      <ProblemDetailPage />
    </YjsCollabProvider>
  );
};

export default ProblemDetailPageWrapper;
