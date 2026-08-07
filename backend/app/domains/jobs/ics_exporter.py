from datetime import datetime

def generate_interview_ics(interview_id: str, company: str, role: str, scheduled_at: datetime) -> bytes:
    """
    Pure function generating iCalendar format (.ics) for an interview event.
    """
    dt_stamp = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    dt_start = scheduled_at.strftime("%Y%m%dT%H%M%SZ")

    ics_content = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Devfolio OS//Job Application Tracker//EN
BEGIN:VEVENT
UID:interview-{interview_id}@devfolio.os
DTSTAMP:{dt_stamp}
DTSTART:{dt_start}
SUMMARY:Interview: {role} at {company}
DESCRIPTION:Scheduled interview round for {role} position at {company}.
END:VEVENT
END:VCALENDAR"""
    return ics_content.replace("\n", "\r\n").encode("utf-8")
