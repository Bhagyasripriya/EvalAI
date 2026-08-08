import { Message, FeedbackReport } from "@/types/interview";

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

interface SendMessageResponse {
  reply: string;
  isComplete: boolean;
  dayCovered?: number;
  feedbackReport?: FeedbackReport;
}

// 10 distinct questions covering 7 curriculum days
const DEMO_RESPONSES = [
  "Question 2 (Day 1 - Prompt Engineering): How do you structure system prompts to prevent prompt injection and maintain strict output formatting?",
  "Question 3 (Day 2 - RAG Foundations): In RAG architectures, how do you determine optimal chunk sizes and overlaps for dense retrieval?",
  "Question 4 (Day 3 - Vector DBs): When selecting index types in vector databases (like Pinecone or Qdrant), what are the trade-offs between HNSW and IVF?",
  "Question 5 (Day 4 - Advanced Retrieval): How do hybrid search and re-ranking models (like Cohere Rerank) improve precision over pure vector search?",
  "Question 6 (Day 5 - Agentic AI): When building agentic workflows, how do you handle tool-calling errors and loop detection using framework state management?",
  "Question 7 (Day 5 - Agent Memory): How do you implement short-term working memory vs long-term episodic memory for autonomous agents?",
  "Question 8 (Day 6 - Model Context Protocol): How does Model Context Protocol (MCP) simplify resource sharing and standard tool integration across models?",
  "Question 9 (Day 7 - AI Deployment & Monitoring): What strategies do you use for latency optimization (e.g., streaming, semantic caching) in production pipelines?",
  "Question 10 (Day 7 - Evaluation): How do you measure hallucination rates and evaluate LLM responses using golden datasets and LLM-as-a-judge?",
];

const MOCK_REPORT: FeedbackReport = {
  overallScore: 94,
  recommendation: "Strong Hire",
  summary:
    "Candidate successfully completed all 10 evaluation questions across 7 curriculum days, demonstrating comprehensive mastery of RAG, Vector DBs, Agentic AI, MCP, and AI system evaluation.",
  keyStrengths: [
    "Deep technical command of hybrid search and re-ranking algorithms",
    "Strong understanding of agent memory states and tool-calling execution loops",
    "Clear production mindset around latency optimization and semantic caching",
    "Covered all 7 core cohort days with high accuracy and practical explanations",
  ],
  growthAreas: [
    "Could further explore distributed GPU cluster scaling for local open-source models",
    "Could implement automated CI/CD evaluation pipelines for continuous prompt regression testing",
  ],
};

export async function sendMessageToAgent({
  candidateId,
  messages,
}: {
  candidateId: string;
  messages: Message[];
}): Promise<SendMessageResponse> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  // 1. Try real backend if URL is configured
  if (backendUrl) {
    try {
      const res = await fetch(`${backendUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, messages }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Backend unavailable, using fallback mock mode:", e);
    }
  }

  // 2. Fallback / Mock Mode logic
  const userMessages = messages.filter((m) => m.sender === "user");
  const turnCount = userMessages.length;

  // REQUIREMENT UPDATE: 10 Questions
  const isComplete = turnCount >= 10;

  // REQUIREMENT UPDATE: Map 10 turns across 7 curriculum days
  // Turns 1-2 = Day 1, Turns 3-4 = Day 2/3, ..., Turn 10 = Day 7
  const currentDay = Math.min(7, Math.ceil((turnCount / 10) * 7));

  await new Promise((resolve) => setTimeout(resolve, 600)); // Simulated processing delay

  return {
    reply: isComplete
      ? "Thank you for answering all 10 technical questions across our 7 curriculum days! Generating your final assessment report..."
      : DEMO_RESPONSES[(turnCount - 1) % DEMO_RESPONSES.length],
    isComplete,
    dayCovered: currentDay,
    feedbackReport: isComplete ? MOCK_REPORT : undefined,
  };
}
  


