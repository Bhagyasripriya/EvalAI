"use client";

import React, { useState, useEffect, useRef } from "react";
import { Candidate, Message, FeedbackReport } from "@/types/interview";
import { sendMessageToAgent } from "@/lib/api";
import {
  Send,
  ArrowLeft,
  FastForward,
  Bot,
  User,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Flame,
  Calendar,
  Layers,
} from "lucide-react";

interface InterviewWorkspaceProps {
  candidate: Candidate;
  onBack: () => void;
  onCompleteAssessment: (report: FeedbackReport) => void;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

export const InterviewWorkspace: React.FC<InterviewWorkspaceProps> = ({
  candidate,
  onBack,
  onCompleteAssessment,
}) => {
  const TOTAL_QUESTIONS = 10;
  const QUESTIONS_PER_DAY = 2;
  const TOTAL_DAYS = 5;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "agent",
      text: `Welcome ${candidate.name}! Let's begin your technical evaluation covering the AI Cohort curriculum.\n\nQuestion 1 (Day 1 - Question 1/2): Can you explain your approach to system prompt structuring and guardrails in production LLM applications?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const userMessagesCount = messages.filter((m) => m.sender === "user").length;

  // Calculate Days Covered & Days Streak
  const currentDay = Math.min(TOTAL_DAYS, Math.floor(userMessagesCount / QUESTIONS_PER_DAY) + 1);
  const questionsInCurrentDay = (userMessagesCount % QUESTIONS_PER_DAY) + 1;
  const daysStreak = Math.max(1, currentDay);

  // Keep ref synchronized with state to manage reliable auto-restarts
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // CONTINUOUS SPEECH RECOGNITION (NEVER AUTO-STOPS & LIVE AUTO-TYPES)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true; // FORCE CONTINUOUS LISTENING (NO 2-SECOND TIMEOUTS)
        recognition.interimResults = true; // STREAMS REAL-TIME TRANSCRIPT DIRECTLY TO INPUT BOX
        recognition.lang = "en-US";

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let fullTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            fullTranscript += event.results[i][0].transcript;
          }
          if (fullTranscript.trim()) {
            setInput(fullTranscript); // AUTOMATICALLY TYPES WHAT PARTICIPANT SPEAKS
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.warn("Speech recognition event:", event.error);
          if (event.error === "network" || event.error === "no-speech") {
            // Ignore minor audio drops to keep session alive
            return;
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          // AUTO-RESTART: IF USER HAS NOT CLICKED STOP, RE-START RECOGNITION IMMEDIATELY
          if (isListeningRef.current) {
            try {
              recognition.start();
            } catch (e) {
              setIsListening(false);
            }
          }
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Text-to-Speech Output for Agent Replies
  const speakText = (text: string) => {
    if (isMuted || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Toggle Continuous Microphone On/Off
  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    if (isListening) {
      // User clicked stop explicitly
      setIsListening(false);
      isListeningRef.current = false;
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    } else {
      // Start listening session
      try {
        setInput(""); // Clear previous text for a clean spoken answer
        setIsListening(true);
        isListeningRef.current = true;
        recognitionRef.current.start();
      } catch (err) {
        console.warn("Could not start continuous speech recognition:", err);
        setIsListening(false);
        isListeningRef.current = false;
      }
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    // Turn off mic when sending answer
    if (isListening) {
      setIsListening(false);
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendMessageToAgent({
        candidateId: candidate.id,
        messages: updatedMessages,
      });

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "agent",
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, agentMessage]);
      speakText(response.reply);

      if (response.isComplete && response.feedbackReport) {
        setTimeout(() => {
          onCompleteAssessment(response.feedbackReport!);
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFastForward = () => {
    const sampleAnswers = [
      "I use system prompt isolation and Pydantic schemas to enforce structured JSON responses.",
      "For Day 1 Question 2, I prevent prompt injection by escaping untrusted user inputs with delimited delimiters.",
      "For RAG chunking, I use ~512 token chunk sizes with 10% overlap to preserve semantic context across sentence boundaries.",
      "For hybrid search, I combine BM25 keyword matching with dense vector embeddings via Reciprocal Rank Fusion.",
      "For vector DB indexing, I prefer HNSW for low-latency production search over IVF.",
      "I implement scalar quantization in Pinecone/Qdrant to reduce memory overhead by 75%.",
      "In agentic AI systems, tool calling loops use strict JSON schema validation and retry backoffs.",
      "Agent state uses short-term sliding context buffers and long-term episodic memory in vector DBs.",
      "For Model Context Protocol (MCP), I isolate tool execution boundaries using Dockerized microservices.",
      "For evaluation, I measure hallucination rates on golden datasets using an LLM-as-a-judge framework.",
    ];

    const currentTurn = userMessagesCount;
    const sampleText = sampleAnswers[currentTurn % sampleAnswers.length];
    handleSend(sampleText);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* HEADER HUD: Progress, Curriculum Days, Days Streak */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">{candidate.name}</h1>
            <p className="text-xs text-slate-400">{candidate.role} Technical Evaluation</p>
          </div>
        </div>

        {/* METRICS HUD */}
        <div className="flex items-center gap-6 bg-slate-950/80 border border-slate-800 px-5 py-2.5 rounded-2xl">
          {/* Questions Progress: X/10 with Green Indicator Dots */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Questions Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white">
                {userMessagesCount} / {TOTAL_QUESTIONS}
              </span>
              <div className="flex gap-1 ml-1">
                {Array.from({ length: TOTAL_QUESTIONS }).map((_, idx) => (
                  <span
                    key={idx}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      idx < userMessagesCount
                        ? "bg-emerald-500 shadow-sm shadow-emerald-500/50"
                        : "bg-slate-800 border border-slate-700"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800" />

          {/* Curriculum Days Progress */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Curriculum Progress</span>
            </div>
            <span className="text-sm font-bold text-cyan-400">
              Day {currentDay} / {TOTAL_DAYS} ({userMessagesCount < TOTAL_QUESTIONS ? `Q${questionsInCurrentDay}/2` : "Done"})
            </span>
          </div>

          <div className="h-8 w-px bg-slate-800" />

          {/* Days Streak */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Days Streak</span>
            </div>
            <span className="text-sm font-bold text-amber-400">
              🔥 {daysStreak} {daysStreak === 1 ? "Day" : "Days"} Streak
            </span>
          </div>
        </div>

        {/* MUTE & FAST-FORWARD CONTROLS */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2.5 rounded-xl border transition-colors ${
              isMuted
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            }`}
            title={isMuted ? "Unmute Voice Output" : "Mute Voice Output"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <button
            onClick={handleFastForward}
            disabled={isLoading || userMessagesCount >= TOTAL_QUESTIONS}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-lg disabled:opacity-50"
          >
            <FastForward className="w-4 h-4" />
            <span>Fast-Forward ⏩</span>
          </button>
        </div>
      </header>

      {/* CHAT MESSAGES DISPLAY */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser ? "bg-indigo-600 text-white" : "bg-slate-800 text-cyan-400 border border-slate-700"
                }`}
              >
                {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div
                className={`max-w-2xl p-4 rounded-2xl text-sm leading-relaxed ${
                  isUser
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-xl"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <span className="block text-[10px] opacity-60 mt-2 text-right">{msg.timestamp}</span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3 text-slate-400 text-xs italic">
            <Bot className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span>AI Interviewer is evaluating answer...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* FOOTER: VOICE INPUT BUTTON + LIVE AUTO-TYPING FIELD */}
      <footer className="bg-slate-900 border-t border-slate-800 p-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-3">
          
          {/* CLICK TO SPEAK VOICE BUTTON */}
          <button
            type="button"
            onClick={toggleMic}
            className={`w-full md:w-auto px-4 py-3 rounded-xl border flex items-center justify-center gap-2 font-semibold text-xs transition-all ${
              isListening
                ? "bg-rose-600 border-rose-500 text-white animate-pulse shadow-lg shadow-rose-600/50"
                : "bg-indigo-600/20 border-indigo-500/40 text-indigo-300 hover:bg-indigo-600 hover:text-white"
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" />
                <span>Listening... Click to Stop</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>Click to Speak Answer 🎤</span>
              </>
            )}
          </button>

          {/* INPUT FIELD SHOWING LIVE SPOKEN TEXT */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={isListening ? "🎙️ Listening... Speak your answer now..." : "Type your answer or click the Speak button..."}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full"
          />

          {/* SEND BUTTON */}
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="p-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all disabled:opacity-50 w-full md:w-auto flex justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </footer>

    </div>
  );
};