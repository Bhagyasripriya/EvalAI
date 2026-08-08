from typing import Dict, Any, Optional
import threading


class SessionStore:
    def __init__(self):
        self._sessions: Dict[str, Dict[str, Any]] = {}
        self._lock = threading.Lock()

    def create_session(self, session_id: str, candidate_data: dict) -> Dict[str, Any]:
        with self._lock:
            session = {
                "session_id": session_id,
                "candidate": candidate_data,
                "history": [],
                "current_question_index": 0,
                "answers": [],
                "done": False,
                "feedback": None,
            }
            self._sessions[session_id] = session
            return session

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            return self._sessions.get(session_id)

    def update_session(self, session_id: str, session_data: Dict[str, Any]):
        with self._lock:
            self._sessions[session_id] = session_data

    def delete_session(self, session_id: str):
        with self._lock:
            if session_id in self._sessions:
                del self._sessions[session_id]


session_store = SessionStore()