"use client";

import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  User,
  Zap,
} from "lucide-react";
import { candidates } from "@/data/candidates";
import { cn } from "@/lib/utils";
import type { Candidate } from "@/types/interview";

const TOTAL_COHORT_DAYS = 31;

export interface CandidateSelectorProps {
  /** Called when the user starts an assessment for a candidate. */
  onSelectCandidate: (candidate: Candidate) => void;
  /** Highlights the card matching this candidate ID. */
  selectedCandidateId?: string;
}

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onSelectCandidate: (candidate: Candidate) => void;
}

function CandidateCard({
  candidate,
  isSelected,
  onSelectCandidate,
}: CandidateCardProps) {
  const progressPercent = Math.round(
    (candidate.completedMissions / TOTAL_COHORT_DAYS) * 100,
  );

  return (
    <article
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border p-6 shadow-xl backdrop-blur-sm transition-all duration-300",
        "bg-slate-900/80 border-slate-800 hover:border-indigo-500/50 hover:shadow-indigo-500/10",
        isSelected && "border-indigo-500 ring-2 ring-indigo-500/40 shadow-indigo-500/20",
      )}
    >
      <div className="space-y-5">
        {/* Card header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              aria-hidden="true"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/20"
            >
              <User className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-white">
                {candidate.name}
              </h2>
              <span className="mt-1 inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-xs font-medium text-slate-300">
                <Briefcase className="h-3 w-3 text-indigo-400" aria-hidden="true" />
                {candidate.role}
              </span>
            </div>
          </div>
          <span className="shrink-0 rounded-md bg-slate-800/90 px-2 py-1 font-mono text-[10px] text-slate-400">
            {candidate.id}
          </span>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" aria-hidden="true" />
              Cohort Progress
            </span>
            <span className="font-mono text-indigo-300">
              {candidate.completedMissions}/{TOTAL_COHORT_DAYS}{" "}
              <span className="text-slate-500">({progressPercent}%)</span>
            </span>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-slate-800"
            role="progressbar"
            aria-valuenow={candidate.completedMissions}
            aria-valuemin={0}
            aria-valuemax={TOTAL_COHORT_DAYS}
            aria-label={`${candidate.name} cohort progress`}
          >
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Skipped topics */}
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
            Skipped Topics
          </p>
          {candidate.skippedTopics.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {candidate.skippedTopics.map((topic) => (
                <span
                  key={topic}
                  className="inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-xs text-amber-400"
                >
                  {topic}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No skipped topics</p>
          )}
        </div>

        {/* Learning signals */}
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
            <Zap className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
            Learning Signals
          </p>
          <div className="flex flex-wrap gap-1.5">
            {candidate.learningSignals.map((signal) => (
              <span
                key={signal}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-400"
              >
                {signal}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={() => onSelectCandidate(candidate)}
        className="group/btn mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition-all hover:bg-indigo-500"
      >
        Start Assessment
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover/btn:translate-x-1"
          aria-hidden="true"
        />
      </button>
    </article>
  );
}

export function CandidateSelector({
  onSelectCandidate,
  selectedCandidateId,
}: CandidateSelectorProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8">
      {/* Header */}
      <header className="mb-10 text-center">
        <span className="mb-4 inline-flex items-center rounded-full border border-indigo-500/25 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-300">
          Hackathon Edition
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Select Candidate for{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            AI Evaluation
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400 sm:text-lg">
          Choose a cohort profile to launch a personalized, curriculum-aware
          technical assessment powered by the Interview Agent.
        </p>
      </header>

      {/* Grid */}
      <section
        aria-label="Available candidates"
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            isSelected={selectedCandidateId === candidate.id}
            onSelectCandidate={onSelectCandidate}
          />
        ))}
      </section>
    </div>
  );
}
