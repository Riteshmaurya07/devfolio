import httpx
import re
import json
from typing import Dict, Any, Optional

class CodeChefClient:
    BASE_URL = "https://www.codechef.com/users"

    async def verify_username(self, username: str) -> bool:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        async with httpx.AsyncClient(timeout=8.0, headers=headers) as client:
            try:
                res = await client.get(f"{self.BASE_URL}/{username}", follow_redirects=True)
                if res.status_code == 200:
                    html = res.text
                    if "could not be found" in html.lower() or "page not found" in html.lower():
                        return False
                    return True
            except Exception:
                pass
            return False

    async def fetch_user_info(self, username: str) -> Dict[str, Any]:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        async with httpx.AsyncClient(timeout=10.0, headers=headers) as client:
            res = await client.get(f"{self.BASE_URL}/{username}", follow_redirects=True)
            if res.status_code != 200:
                raise Exception(f"Failed to fetch CodeChef profile for '{username}'")

            html = res.text
            if "could not be found" in html.lower() or "page not found" in html.lower():
                raise Exception(f"CodeChef user '{username}' not found")

            # Extract rating history and current rating
            current_rating = 0
            highest_rating = 0
            m = re.search(r'var all_rating = (\[.*?\]);', html)
            if m:
                try:
                    history = json.loads(m.group(1))
                    if history:
                        current_rating = int(history[-1].get("rating", 0))
                        highest_rating = max((int(x.get("rating", 0)) for x in history), default=current_rating)
                except Exception:
                    pass

            if not current_rating:
                # Fallback rating regex
                rm = re.search(r'class=\"rating-number\"[^>]*>(\d+)', html)
                if rm:
                    current_rating = int(rm.group(1))
                    highest_rating = max(highest_rating, current_rating)

            # Determine stars
            if current_rating >= 2500:
                stars = "7★"
            elif current_rating >= 2200:
                stars = "6★"
            elif current_rating >= 2000:
                stars = "5★"
            elif current_rating >= 1800:
                stars = "4★"
            elif current_rating >= 1600:
                stars = "3★"
            elif current_rating >= 1400:
                stars = "2★"
            elif current_rating > 0:
                stars = "1★"
            else:
                stars = "Unrated"

            # Problems solved
            total_solved = 0
            sm = re.search(r'Fully Solved \((\d+)\)', html) or re.search(r'Total Problems Solved[^\d]*(\d+)', html)
            if sm:
                total_solved = int(sm.group(1))

            return {
                "username": username,
                "current_rating": current_rating,
                "highest_rating": highest_rating,
                "stars": stars,
                "total_solved": total_solved
            }
