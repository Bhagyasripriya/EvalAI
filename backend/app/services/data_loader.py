import json
from pathlib import Path
from typing import List, Dict, Any
from app.config import CANDIDATES_FILE, CURRICULUM_FILE


class DataLoader:
    def __init__(self, candidates_path: Path = CANDIDATES_FILE, curriculum_path: Path = CURRICULUM_FILE):
        self.candidates_path = candidates_path
        self.curriculum_path = curriculum_path

    def load_curriculum(self) -> Dict[str, Any]:
        if not self.curriculum_path.exists():
            raise FileNotFoundError(f"Curriculum file not found at {self.curriculum_path}")
        with open(self.curriculum_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def load_candidates(self) -> List[Dict[str, Any]]:
        if not self.candidates_path.exists():
            raise FileNotFoundError(f"Candidates file not found at {self.candidates_path}")
        with open(self.candidates_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("candidates", [])


data_loader = DataLoader()