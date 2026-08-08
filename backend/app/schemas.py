from typing import List, Optional
from pydantic import BaseModel, Field


class Member(BaseModel):
    id: str
    name: str
    jobRole: str
    yearsExperience: float
    education: str
    status: str


class Mission(BaseModel):
    day: int
    title: str
    passed: Optional[bool] = False
    skipped: Optional[bool] = False
    attempts: Optional[int] = 0


class Signals(BaseModel):
    commitDays: int
    missionsCompleted: int
    missionsFirstTry: int


class Candidate(BaseModel):
    member: Member
    missions: List[Mission]
    signals: Signals


class Feedback(BaseModel):
    summary: str
    strengths: List[str]
    gaps: List[str]
    next: List[str]


# Dedicated Schemas for Separate Endpoints

# 1. Start Interview
class StartInterviewRequest(BaseModel):
    sessionId: str = Field(..., min_length=1)
    candidate: Candidate


class StartInterviewResponse(BaseModel):
    reply: str
    done: bool = False


# 2. Interview Chat Turn
class ChatRequest(BaseModel):
    sessionId: str = Field(..., min_length=1)
    message: str = Field(..., min_length=1)


class ChatResponse(BaseModel):
    reply: str
    done: bool


# 3. Feedback Response
class FeedbackResponse(BaseModel):
    sessionId: str
    completed: bool
    feedback: Optional[Feedback] = None