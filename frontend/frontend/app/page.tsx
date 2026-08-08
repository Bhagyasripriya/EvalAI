"use client";

import { useState } from "react";
import { Candidate, FeedbackReport } from "@/types/interview";
import { CandidateSelector } from "@/components/CandidateSelector";
import { InterviewWorkspace } from "@/components/InterviewWorkspace";
import { FeedbackReportView } from "@/components/FeedbackReportView";

type ScreenStep = "SELECT" | "INTERVIEW" | "REPORT";

export default function Home() {
  const [step, setStep] = useState<ScreenStep>("SELECT");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [finalReport, setFinalReport] = useState<FeedbackReport | null>(null);

  const handleSelectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setStep("INTERVIEW");
  };

  const handleCompleteAssessment = (report: FeedbackReport) => {
    setFinalReport(report);
    setStep("REPORT");
  };

  const handleReset = () => {
    setSelectedCandidate(null);
    setFinalReport(null);
    setStep("SELECT");
  };

  return (
    <main className="min-h-screen bg-slate-950">
      {step === "SELECT" && (
        <div className="py-12 px-6">
          <CandidateSelector
            onSelectCandidate={handleSelectCandidate}
            selectedCandidateId={selectedCandidate?.id}
          />
        </div>
      )}

      {step === "INTERVIEW" && selectedCandidate && (
        <InterviewWorkspace
          candidate={selectedCandidate}
          onCompleteAssessment={handleCompleteAssessment}
          onBack={handleReset}
        />
      )}

      {step === "REPORT" && selectedCandidate && finalReport && (
        <FeedbackReportView
          candidate={selectedCandidate}
          report={finalReport}
          onReset={handleReset}
        />
      )}
    </main>
  );
}