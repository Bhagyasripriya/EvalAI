"use client";

import React from "react";
import { Candidate, FeedbackReport } from "@/types/interview";
import {
  Trophy,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Download,
  Share2,
} from "lucide-react";

interface FeedbackReportViewProps {
  candidate: Candidate;
  report: FeedbackReport;
  onReset: () => void;
}

export const FeedbackReportView: React.FC<FeedbackReportViewProps> = ({
  candidate,
  report,
  onReset,
}) => {
  const getBadgeColor = (rec: string) => {
    switch (rec) {
      case "Strong Hire":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "Hire":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "Lean Hire":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      default:
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center justify-center font-sans">
      <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
              Assessment Report Generated
            </span>
            <h1 className="text-3xl font-bold mt-2">{candidate.name}</h1>
            <p className="text-slate-400 text-sm">{candidate.role} Candidate Evaluation</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => alert("Report downloaded as PDF")}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onReset}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Evaluate Another Candidate</span>
            </button>
          </div>
        </div>

        {/* Score & Recommendation Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-xl flex flex-col items-center justify-center text-center">
            <Trophy className="w-8 h-8 text-amber-400 mb-2" />
            <span className="text-xs uppercase tracking-wider text-slate-400">Overall Score</span>
            <span className="text-4xl font-extrabold text-white mt-1">{report.overallScore} / 100</span>
          </div>

          <div className="md:col-span-2 bg-slate-950/80 border border-slate-800 p-6 rounded-xl flex flex-col justify-center">
            <span className="text-xs uppercase tracking-wider text-slate-400 mb-2">Recommendation</span>
            <div>
              <span className={`inline-block text-lg font-bold px-4 py-1.5 rounded-lg border ${getBadgeColor(report.recommendation)}`}>
                {report.recommendation}
              </span>
            </div>
            <p className="text-slate-300 text-sm mt-3 leading-relaxed">{report.summary}</p>
          </div>
        </div>

        {/* Strengths & Growth Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-emerald-950/20 border border-emerald-500/20 p-6 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle className="w-5 h-5" />
              <h3>Key Technical Strengths</h3>
            </div>
            <ul className="space-y-2 text-slate-300 text-sm">
              {report.keyStrengths.map((str, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-950/20 border border-amber-500/20 p-6 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-semibold">
              <AlertCircle className="w-5 h-5" />
              <h3>Growth & Optimization Areas</h3>
            </div>
            <ul className="space-y-2 text-slate-300 text-sm">
              {report.growthAreas.map((area, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};