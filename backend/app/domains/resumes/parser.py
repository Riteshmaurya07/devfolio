import io
import re
from typing import Dict, Any, List
from pypdf import PdfReader
from docx import Document
from app.core.exceptions import ValidationError

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB Security Cap

def parse_resume_file_library_first(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    if len(file_bytes) > MAX_FILE_SIZE:
        raise ValidationError(message="Resume file size exceeds maximum limit of 5MB.")

    extracted_text = ""
    if filename.endswith(".pdf"):
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
        except Exception as e:
            raise ValidationError(message=f"Failed to parse PDF file: {str(e)}")
    elif filename.endswith(".docx"):
        try:
            doc = Document(io.BytesIO(file_bytes))
            for p in doc.paragraphs:
                extracted_text += p.text + "\n"
        except Exception as e:
            raise ValidationError(message=f"Failed to parse DOCX file: {str(e)}")
    else:
        raise ValidationError(message="Unsupported resume format. Please upload PDF or DOCX.")

    # Library-First Structured Extraction
    email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", extracted_text)
    phone_match = re.search(r"\+?\d[\d\s-]{8,14}\d", extracted_text)
    
    lines = [l.strip() for l in extracted_text.split("\n") if l.strip()]
    name_guess = lines[0] if lines else "Candidate Name"

    skills_keywords = ["python", "typescript", "react", "fastapi", "postgresql", "docker", "redis", "git", "aws", "node.js", "java", "c++"]
    detected_skills = [kw.capitalize() for kw in skills_keywords if kw in extracted_text.lower()]

    return {
        "contact": {
            "name": name_guess,
            "email": email_match.group(0) if email_match else "",
            "phone": phone_match.group(0) if phone_match else "",
            "location": "",
            "website": "",
            "linkedin": "",
            "github": ""
        },
        "summary": lines[1] if len(lines) > 1 else "",
        "skills": list(set(detected_skills)),
        "experience": [],
        "education": [],
        "projects": [],
        "certifications": []
    }
