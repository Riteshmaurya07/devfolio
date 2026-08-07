import pytest
from app.domains.ai.context_assembler import assemble_career_context

SAMPLE_PROFILE = {
    "name": "Alex Mercer",
    "username": "alexm",
    "bio": "Full stack engineer building developer productivity tools and scalable backend APIs.",
    "current_position": "Senior Software Engineer",
    "company": "TechCorp",
    "skills": ["Python", "FastAPI", "TypeScript", "React", "Docker", "PostgreSQL", "Redis"],
    "location": "San Francisco, CA"
}

SAMPLE_RESUME = {
    "title": "Master Resume",
    "template_name": "modern",
    "content": {
        "skills": ["Python", "FastAPI", "TypeScript"],
        "experience": [
            {"position": "Senior Backend Engineer", "company": "TechCorp"},
            {"position": "Software Engineer", "company": "DevStudio"}
        ],
        "projects": [
            {"title": "DevFolio OS"}
        ]
    }
}

SAMPLE_GITHUB = {
    "github_username": "alexm",
    "repositories": [
        {"name": "devfolio-os", "language": "TypeScript"},
        {"name": "fastapi-core", "language": "Python"}
    ]
}

SAMPLE_CODING = {
    "total_solved": 150,
    "weak_areas": [{"topic": "Dynamic Programming", "attempts": 30, "solve_ratio": 0.2}]
}

SAMPLE_ROADMAPS = [
    {"roadmap_template_id": "tmpl-1", "completion_percentage": 60.0}
]

def test_assemble_career_context_structure():
    ctx = assemble_career_context(
        profile=SAMPLE_PROFILE,
        resume=SAMPLE_RESUME,
        github=SAMPLE_GITHUB,
        coding=SAMPLE_CODING,
        roadmaps=SAMPLE_ROADMAPS
    )

    assert ctx["profile"]["name"] == "Alex Mercer"
    assert ctx["resume"]["title"] == "Master Resume"
    assert len(ctx["resume"]["recent_positions"]) == 2
    assert "TypeScript" in ctx["github"]["top_languages"]
    assert ctx["coding"]["total_solved"] == 150
    assert "Dynamic Programming" in ctx["coding"]["weak_areas"]
    assert len(ctx["roadmaps"]) == 1

def test_assemble_career_context_defaults():
    empty_ctx = assemble_career_context()
    assert empty_ctx["profile"]["name"] == "Developer"
    assert empty_ctx["resume"]["title"] == "Master Resume"
    assert empty_ctx["coding"]["total_solved"] == 0
    assert empty_ctx["roadmaps"] == []
