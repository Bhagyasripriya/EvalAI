/**
 * Core domain types for The Interview Agent frontend.
 * Shared across candidate selection, live interview, and feedback flows.
 */

/** Identifies who authored a chat message in the interview session. */
export type SenderType = "agent" | "user" | "system";

/**
 * A cohort participant selected for a personalized technical assessment.
 * Profile data drives question targeting and sidebar learning signals.
 */
export interface Candidate {
  /** Stable unique identifier (e.g. `cand_01`). */
  id: string;
  /** Display name shown in the interview header and chat. */
  name: string;
  /** Cohort or target role label (e.g. "AI Engineering Participant"). */
  role: string;
  /** Number of completed daily missions out of the full cohort program. */
  completedMissions: number;
  /** Curriculum topics the candidate skipped or did not complete. */
  skippedTopics: string[];
  /** Observed behavioral or skill signals from prior cohort activity. */
  learningSignals: string[];
}

/**
 * A single day in the 31-day AI cohort curriculum.
 * Used to map interview questions to specific learning modules.
 */
export interface CurriculumDay {
  /** Day index within the cohort (1–31). */
  day: number;
  /** High-level module grouping (e.g. "RAG", "Agentic AI"). */
  module: string;
  /** Specific topic covered on this day. */
  topic: string;
  /** Learning objectives the candidate should demonstrate. */
  objectives: string[];
}

/**
 * A single message in the live interview chat transcript.
 */
export interface Message {
  /** Unique message identifier. */
  id: string;
  /** Message author: AI interviewer, candidate, or system notice. */
  sender: SenderType;
  /** Message body text. */
  text: string;
  /** Human-readable or ISO timestamp for display. */
  timestamp: string;
  /** Cohort day this message relates to, when applicable. */
  dayCovered?: number;
}

/**
 * Real-time progress indicators shown in the interview HUD.
 * Tracks question volume and which curriculum days have been assessed.
 */
export interface AssessmentHUD {
  /** Current question number in the active session. */
  questionCount: number;
  /** Cohort day numbers covered so far (may be non-contiguous). */
  daysCovered: number[];
}

/** Hiring recommendation tier derived from the overall assessment score. */
export type HireRecommendation =
  | "Strong Hire"
  | "Hire"
  | "Lean Hire"
  | "No Hire";

/**
 * Structured post-interview evaluation delivered after session completion.
 */
export interface FeedbackReport {
  /** Composite technical score on a 0–100 scale. */
  overallScore: number;
  /** Final hiring recommendation tier. */
  recommendation: HireRecommendation;
  /** Narrative summary of the candidate's performance. */
  summary: string;
  /** Notable strengths demonstrated during the interview. */
  keyStrengths: string[];
  /** Areas where the candidate should deepen knowledge or practice. */
  growthAreas: string[];
}

/**
 * Payload returned after each candidate answer or agent turn.
 * Drives chat updates, HUD progress, and end-of-interview feedback.
 */
export interface ChatResponse {
  /** The AI interviewer's next message or closing statement. */
  reply: string;
  /** Cohort day addressed by this exchange, when applicable. */
  dayCovered?: number;
  /** Whether the interview has reached its completion criteria. */
  isComplete: boolean;
  /** Full evaluation report, present only when `isComplete` is true. */
  feedbackReport?: FeedbackReport;
}
