import httpx
import re
from typing import Dict, Any, Optional

class GeeksforGeeksClient:
    BASE_URL = "https://www.geeksforgeeks.org/user"

    async def verify_username(self, username: str) -> bool:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        async with httpx.AsyncClient(timeout=8.0, headers=headers) as client:
            try:
                res = await client.get(f"{self.BASE_URL}/{username}/", follow_redirects=True)
                if res.status_code == 200:
                    html = res.text
                    if "page not found" in html.lower() or "user not found" in html.lower():
                        return False
                    return True
            except Exception:
                pass
            return False

    async def fetch_user_info(self, username: str) -> Dict[str, Any]:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        async with httpx.AsyncClient(timeout=10.0, headers=headers) as client:
            res = await client.get(f"{self.BASE_URL}/{username}/", follow_redirects=True)
            if res.status_code != 200:
                raise Exception(f"Failed to fetch GeeksforGeeks profile for '{username}'")

            html = res.text
            if "page not found" in html.lower() or "user not found" in html.lower():
                raise Exception(f"GeeksforGeeks user '{username}' not found")

            # Extract Next.js Server Components payload chunks
            chunks = re.findall(r'self\.__next_f\.push\(\[1,\"(.*?)\"\]\)', html)
            full_payload = ''.join(chunks).encode('utf-8').decode('unicode_escape', errors='ignore') if chunks else html

            total_solved = 0
            coding_score = 0
            rank = None

            m_solved = re.search(r'\"total_problems_solved\":\s*(\d+)', full_payload)
            if m_solved:
                total_solved = int(m_solved.group(1))
            else:
                fallback_solved = re.search(r'Problem[s]?\s*Solved[^\d]*(\d+)', html, re.I)
                if fallback_solved:
                    total_solved = int(fallback_solved.group(1))

            m_score = re.search(r'\"score\":\s*(\d+)', full_payload)
            if m_score:
                coding_score = int(m_score.group(1))
            else:
                fallback_score = re.search(r'Coding\s*Score[^\d]*(\d+)', html, re.I)
                if fallback_score:
                    coding_score = int(fallback_score.group(1))

            m_rank = re.search(r'\"institute_rank\":\s*(\d+)', full_payload)
            if m_rank:
                rank = f"#{m_rank.group(1)}"
            else:
                fallback_rank = re.search(r'Institute\s*Rank[^\d]*(\d+)', html, re.I)
                if fallback_rank:
                    rank = f"#{fallback_rank.group(1)}"

            return {
                "username": username,
                "total_solved": total_solved,
                "coding_score": coding_score,
                "institute_rank": rank
            }
