import type { Candidate } from "@/types/interview";

export const candidates: Candidate[] = [
  {
    id: "cand_01",
    name: "Alex Chen",
    role: "AI Engineering Participant",
    completedMissions: 24,
    skippedTopics: ["Model Deployment", "Monitoring"],
    learningSignals: ["Fast Responder", "Strong Edge-Case Awareness"],
  },
  {
    id: "cand_02",
    name: "Samira Patel",
    role: "AI Engineering Participant",
    completedMissions: 29,
    skippedTopics: ["Advanced MCP"],
    learningSignals: ["Excellent Vector DB Understanding", "High Coding Completion Rate"],
  },
  {
    id: "cand_03",
    name: "Jordan Lee",
    role: "AI Engineering Participant",
    completedMissions: 18,
    skippedTopics: ["Prompt Engineering", "Fine-tuning"],
    learningSignals: ["Needs Probing on Evaluation", "Good Agentic Workflow Concepts"],
  },
];
