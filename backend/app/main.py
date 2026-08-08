from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from app.schemas import (
    StartInterviewRequest,
    ChatRequest,
)
from app.store import session_store
from app.services.agent import agent

app = FastAPI(
    title="AI Technical Interviewer API",
    version="1.0.0",
)

# Enable CORS Middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows requests from any origin (update to specific frontend URL in production)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Allows all headers
)


@app.get("/")
async def root():
    return {"message": "AI Technical Interviewer API is running"}


@app.post("/interview/start")
async def start_interview(req: StartInterviewRequest):
    session = session_store.create_session(
        session_id=req.sessionId,
        candidate_data=req.candidate.model_dump(),
    )
    greeting = agent.start_interview(session["candidate"])
    return {"reply": greeting, "done": False}


@app.post("/interview/chat")
async def chat_interview(req: ChatRequest):
    session = session_store.get_session(req.sessionId)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Session ID '{req.sessionId}' not found. Please start the interview first.",
        )

    if session.get("done", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Interview session is already completed. Check your feedback using the feedback endpoint.",
        )

    reply_text, is_done, feedback_dict = agent.process_turn(session, req.message)
    session_store.update_session(req.sessionId, session)

    return {"reply": reply_text, "done": is_done}


@app.get("/interview/feedback/{session_id}")
async def get_feedback(session_id: str):
    session = session_store.get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session ID '{session_id}' not found.",
        )

    if not session.get("done", False):
        return {
            "sessionId": session_id,
            "completed": False,
            "feedback": None,
            "message": "Interview is still in progress. Complete all questions first.",
        }

    return {
        "sessionId": session_id,
        "completed": True,
        "feedback": session.get("feedback"),
    }