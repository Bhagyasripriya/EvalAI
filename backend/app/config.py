import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

CANDIDATES_FILE = DATA_DIR / "candidates.json"
CURRICULUM_FILE = DATA_DIR / "curriculum.json"

MAX_QUESTIONS_PER_INTERVIEW = 3