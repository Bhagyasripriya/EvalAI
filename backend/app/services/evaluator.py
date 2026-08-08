from typing import Dict, Any, List
from app.services.data_loader import data_loader


class CandidateEvaluator:
    def __init__(self):
        self.curriculum = data_loader.load_curriculum()

    def evaluate_candidate(self, candidate: Dict[str, Any], answers: List[str]) -> Dict[str, Any]:
        member = candidate.get("member", {})
        missions = candidate.get("missions", [])
        signals = candidate.get("signals", {})

        passed_missions = [m for m in missions if m.get("passed")]
        skipped_missions = [m for m in missions if m.get("skipped")]
        failed_or_multi_attempt = [m for m in missions if m.get("attempts", 0) > 2]

        strengths = []
        gaps = []
        next_steps = []

        # Evaluate strengths based on high first-try rate and passed missions
        if signals.get("missionsFirstTry", 0) >= 15:
            strengths.append(f"Strong execution across AI concepts with {signals.get('missionsFirstTry')} first-try completions.")
        else:
            strengths.append(f"Demonstrated persistence through {signals.get('commitDays', 0)} active commit days.")

        if len(passed_missions) > 0:
            top_titles = [m["title"] for m in passed_missions[:3]]
            strengths.append(f"Successfully completed key missions including: {', '.join(top_titles)}.")

        # Evaluate gaps from skipped and high-attempt missions
        if skipped_missions:
            skipped_titles = [m["title"] for m in skipped_missions]
            gaps.append(f"Skipped critical curriculum missions: {', '.join(skipped_titles)}.")

        if failed_or_multi_attempt:
            multi_titles = [m["title"] for m in failed_or_multi_attempt[:2]]
            gaps.append(f"Required multiple attempts (>2) on technical missions such as {', '.join(multi_titles)}.")

        if not gaps:
            gaps.append("Minor improvements needed in optimizing token latency and prompt context size.")

        # Recommended Next Steps based on Curriculum Modules
        modules = self.curriculum.get("modules", [])
        if skipped_missions:
            next_steps.append("Revisit skipped curriculum modules to ensure full technical coverage.")
        next_steps.append("Practice hands-on architecture design for multi-agent workflows and MCP integrations.")
        next_steps.append("Focus on production-grade deployment, observability, and containerization.")

        summary = (
            f"{member.get('name')} ({member.get('jobRole')}, {member.get('yearsExperience')} YOE) "
            f"completed {signals.get('missionsCompleted', 0)} missions with {signals.get('commitDays', 0)} commit days. "
            f"Demonstrates practical competency in AI development with targeted areas for operational growth."
        )

        return {
            "summary": summary,
            "strengths": strengths,
            "gaps": gaps,
            "next": next_steps,
        }


evaluator = CandidateEvaluator()