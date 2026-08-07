import pytest
from app.domains.resumes.ats_scorer import calculate_ats_score
from app.domains.resumes.pdf_generator import generate_pdf_bytes
from app.domains.resumes.docx_generator import generate_docx_bytes

SAMPLE_RESUME_CONTENT = {
    "contact": {
        "name": "Alex Mercer",
        "email": "alex@example.com",
        "phone": "+1234567890",
        "location": "San Francisco, CA",
        "website": "https://alexmercer.dev",
        "linkedin": "linkedin.com/in/alex",
        "github": "github.com/alex"
    },
    "summary": "Senior Software Engineer with 6+ years of experience building scalable backend microservices.",
    "skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "Redis", "TypeScript", "React"],
    "experience": [
        {
            "company": "Tech Corp",
            "position": "Senior Backend Engineer",
            "location": "San Francisco, CA",
            "start_date": "2022-01",
            "end_date": "Present",
            "is_current": True,
            "highlights": [
                "Engineered high-throughput API gateway processing 50k requests/sec.",
                "Architected distributed PostgreSQL database strategy reducing latency by 40%."
            ]
        }
    ],
    "projects": [
        {
            "title": "DevFolio OS",
            "description": "Developer portfolio OS application built with FastAPI and Next.js.",
            "tech_stack": ["Python", "FastAPI", "Next.js"],
            "repo_url": "https://github.com/alex/devfolio-os"
        }
    ]
}

def test_ats_score_calculation():
    # 1. Full content score
    result = calculate_ats_score(SAMPLE_RESUME_CONTENT, target_role="backend")
    assert result["score"] >= 80
    assert len(result["missing_skills"]) == 0 or "Grpc" in result["missing_skills"]

    # 2. Empty content edge case
    empty_result = calculate_ats_score({}, target_role="fullstack")
    assert empty_result["score"] == 0
    assert len(empty_result["keyword_suggestions"]) > 0

def test_pdf_rendering():
    pdf_bytes = generate_pdf_bytes(SAMPLE_RESUME_CONTENT, template_name="modern")
    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 500
    assert pdf_bytes.startswith(b"%PDF")

def test_docx_rendering():
    docx_bytes = generate_docx_bytes(SAMPLE_RESUME_CONTENT, template_name="modern")
    assert isinstance(docx_bytes, bytes)
    assert len(docx_bytes) > 500
    assert docx_bytes[:4] == b"PK\x03\x04"  # Zip archive header for docx
