from typing import Dict, Any, List, Optional

def assemble_career_context(
    profile: Optional[Dict[str, Any]] = None,
    resume: Optional[Dict[str, Any]] = None,
    github: Optional[Dict[str, Any]] = None,
    coding: Optional[Dict[str, Any]] = None,
    roadmaps: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Pure deterministic multi-module context assembler with strict token budget compression.
    - Compresses raw daily submission/contribution calendars into high-level aggregate metrics.
    - Caps resume experience/projects to top 3 recent items.
    """
    profile = profile or {}
    resume = resume or {}
    github = github or {}
    coding = coding or {}
    roadmaps = roadmaps or []

    # 1. Profile Summary
    profile_summary = {
        "name": profile.get("name", "Developer"),
        "username": profile.get("username", ""),
        "bio": (profile.get("bio") or profile.get("about") or "")[:200],  # Token Cap
        "current_position": profile.get("current_position", ""),
        "company": profile.get("company", ""),
        "skills": profile.get("skills", [])[:15],
        "location": profile.get("location", "")
    }

    # 2. Resume Summary (Capped to top 3 items)
    experiences = resume.get("content", {}).get("experience", [])[:3]
    projects = resume.get("content", {}).get("projects", [])[:3]

    resume_summary = {
        "title": resume.get("title", "Master Resume"),
        "template": resume.get("template_name", "modern"),
        "skills": resume.get("content", {}).get("skills", [])[:15],
        "recent_positions": [e.get("position") for e in experiences if e.get("position")],
        "recent_projects": [p.get("title") for p in projects if p.get("title")]
    }

    # 3. GitHub Summary (Compressed Calendar -> Aggregate Total)
    repos = github.get("repositories", [])
    github_summary = {
        "github_username": github.get("github_username", ""),
        "public_repos_count": len(repos),
        "top_languages": list(set(r.get("language") for r in repos if r.get("language")))[:5]
    }

    # 4. Coding Dashboard Summary (Compressed Topic Analysis)
    coding_summary = {
        "total_solved": coding.get("total_solved", 0),
        "weak_areas": [w.get("topic") for w in coding.get("weak_areas", [])[:5]]
    }

    # 5. Roadmap Progress Summary
    roadmap_summary = []
    for r in roadmaps[:3]:
        roadmap_summary.append({
            "template_id": str(r.get("roadmap_template_id", "")),
            "completion_percentage": r.get("completion_percentage", 0.0)
        })

    return {
        "profile": profile_summary,
        "resume": resume_summary,
        "github": github_summary,
        "coding": coding_summary,
        "roadmaps": roadmap_summary,
        "assembled_at_version": "1.0"
    }
