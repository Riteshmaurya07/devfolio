import re
from typing import Dict, Any, List, Optional

ACTION_VERBS = {
    "built", "developed", "architected", "engineered", "implemented", "designed",
    "scaled", "optimized", "managed", "led", "created", "spearheaded", "accelerated"
}

ROLE_KEYWORDS = {
    "fullstack": ["python", "typescript", "react", "fastapi", "postgresql", "docker", "redis", "git"],
    "backend": ["python", "fastapi", "postgresql", "redis", "celery", "docker", "grpc", "sql"],
    "frontend": ["typescript", "react", "next.js", "tailwind", "css", "html", "state management"]
}

def calculate_ats_score(content: dict, target_role: Optional[str] = None) -> Dict[str, Any]:
    score = 0
    grammar_patterns = []
    keyword_suggestions = []
    missing_skills = []
    action_verb_feedback = []

    contact = content.get("contact", {})
    experience = content.get("experience", [])
    skills = [s.lower() for s in content.get("skills", [])]
    summary = content.get("summary", "")

    # 1. Contact Completeness (Max 20 pts)
    if contact.get("name") and contact.get("email"):
        score += 15
    if contact.get("phone") or contact.get("linkedin") or contact.get("github"):
        score += 5

    # 2. Section Completeness (Max 30 pts)
    if summary and len(summary) >= 30:
        score += 10
    if len(experience) >= 1:
        score += 10
    if len(skills) >= 3:
        score += 10

    # 3. Action Verbs Check (Max 25 pts)
    action_verb_count = 0
    for exp in experience:
        for highlight in exp.get("highlights", []):
            first_word = highlight.strip().split(" ")[0].lower() if highlight.strip() else ""
            if first_word in ACTION_VERBS:
                action_verb_count += 1
            # Pattern-based passive voice check
            if re.search(r"\b(was|were|been|being)\b\s+\w+ed\b", highlight, re.IGNORECASE):
                grammar_patterns.append(f"Avoid passive voice in: '{highlight[:40]}...'")

    if action_verb_count >= 3:
        score += 25
        action_verb_feedback.append("Strong action-verb coverage across bullet points.")
    else:
        score += action_verb_count * 8
        action_verb_feedback.append("Start experience bullets with strong action verbs (e.g., Engineered, Architected, Scaled).")

    # 4. Target Role Alignment & Keywords (Max 25 pts)
    role_key = (target_role or "fullstack").lower()
    expected_keywords = ROLE_KEYWORDS.get(role_key, ROLE_KEYWORDS["fullstack"])
    
    matched_count = 0
    for kw in expected_keywords:
        if kw in skills or any(kw in summary.lower() for _ in [1]):
            matched_count += 1
        else:
            missing_skills.append(kw.capitalize())

    score += min(25, matched_count * 4)
    if missing_skills:
        keyword_suggestions.append(f"Consider adding key skills for {role_key.capitalize()} role: {', '.join(missing_skills[:4])}")

    final_score = min(100, max(0, score))

    return {
        "score": final_score,
        "grammar_patterns": grammar_patterns,
        "keyword_suggestions": keyword_suggestions,
        "missing_skills": missing_skills,
        "action_verb_feedback": action_verb_feedback,
        "summary": f"ATS Compatibility Score: {final_score}/100"
    }
