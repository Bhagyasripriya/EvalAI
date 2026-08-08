from typing import Dict, Any, Tuple
from app.services.data_loader import data_loader
from app.services.evaluator import evaluator


class InterviewAgent:
    def __init__(self):
        self.curriculum = data_loader.load_curriculum()

    def start_interview(self, candidate: Dict[str, Any]) -> str:
        member = candidate.get("member", {})
        name = member.get("name", "Candidate")
        role = member.get("jobRole", "Software Engineer")
        
        first_topic = "Embeddings & Vector Search"
        reply = (
            f"Welcome {name}! I see you're applying for the {role} position. "
            f"Let's begin your technical interview. To start, can you explain your approach to {first_topic} "
            f"and how you would handle indexing unstructured data for semantic search?"
        )
        return reply

    def process_turn(self, session: Dict[str, Any], user_message: str) -> Tuple[str, bool, Dict[str, Any]]:
        candidate = session["candidate"]
        session["answers"].append(user_message)
        session["current_question_index"] += 1

        curr_index = session["current_question_index"]

        questions = [
            "Great. Moving on to LLMs and Prompt Engineering: How do you structure prompts or schemas when enforcing structured Pydantic outputs from an API?",
            "In terms of Agentic AI & Systems: What are the primary trade-offs between using single-agent ReAct frameworks versus multi-agent orchestration like LangGraph or CrewAI?",
        ]

        if curr_index <= len(questions):
            next_question = questions[curr_index - 1]
            return next_question, False, None
        else:
            session["done"] = True
            feedback_data = evaluator.evaluate_candidate(candidate, session["answers"])
            session["feedback"] = feedback_data
            return "Thank you for completing the interview questions! You can now request your detailed feedback.", True, feedback_data


agent = InterviewAgent()