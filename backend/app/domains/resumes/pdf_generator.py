import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_pdf_bytes(content: dict, template_name: str = "modern") -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    
    styles = getSampleStyleSheet()
    
    # Template Accent Styling
    primary_color = colors.HexColor("#1e293b")
    accent_color = colors.HexColor("#2563eb")

    if template_name == "minimal":
        primary_color = colors.HexColor("#000000")
        accent_color = colors.HexColor("#333333")
    elif template_name == "creative":
        primary_color = colors.HexColor("#030712")
        accent_color = colors.HexColor("#7c3aed")

    title_style = ParagraphStyle(
        "HeaderTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=primary_color
    )

    contact_style = ParagraphStyle(
        "ContactLine",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#475569")
    )

    section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=accent_color,
        spaceBefore=8,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        "BodyTextCustom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1e293b")
    )

    story = []

    # Header Contact Info
    contact = content.get("contact", {})
    story.append(Paragraph(contact.get("name", "Developer Resume"), title_style))
    
    contact_bits = [b for b in [contact.get("email"), contact.get("phone"), contact.get("location"), contact.get("website")] if b]
    if contact_bits:
        story.append(Paragraph(" • ".join(contact_bits), contact_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1, color=accent_color, spaceBefore=0, spaceAfter=8))

    # Summary
    summary = content.get("summary")
    if summary:
        story.append(Paragraph("SUMMARY", section_heading))
        story.append(Paragraph(summary, body_style))
        story.append(Spacer(1, 8))

    # Skills
    skills = content.get("skills", [])
    if skills:
        story.append(Paragraph("SKILLS & TECH STACK", section_heading))
        story.append(Paragraph(", ".join(skills), body_style))
        story.append(Spacer(1, 8))

    # Experience
    experience = content.get("experience", [])
    if experience:
        story.append(Paragraph("WORK EXPERIENCE", section_heading))
        for exp in experience:
            head = f"<b>{exp.get('position')}</b> — <i>{exp.get('company')}</i> ({exp.get('start_date')} - {exp.get('end_date', 'Present')})"
            story.append(Paragraph(head, body_style))
            for h in exp.get("highlights", []):
                story.append(Paragraph(f"• {h}", body_style))
            story.append(Spacer(1, 4))
        story.append(Spacer(1, 6))

    # Projects
    projects = content.get("projects", [])
    if projects:
        story.append(Paragraph("FEATURED PROJECTS", section_heading))
        for proj in projects:
            story.append(Paragraph(f"<b>{proj.get('title')}</b>", body_style))
            if proj.get("description"):
                story.append(Paragraph(proj.get("description"), body_style))
            story.append(Spacer(1, 4))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
