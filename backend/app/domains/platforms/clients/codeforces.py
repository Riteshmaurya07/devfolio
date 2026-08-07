import httpx
from typing import Dict, Any, Optional

class CodeforcesClient:
    BASE_URL = "https://codeforces.com/api"

    async def verify_username(self, handle: str) -> bool:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.get(f"{self.BASE_URL}/user.info?handles={handle}")
            if res.status_code == 200:
                data = res.json()
                return data.get("status") == "OK"
            return False

    async def fetch_user_info(self, handle: str) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=10.0) as client:
            info_res = await client.get(f"{self.BASE_URL}/user.info?handles={handle}")
            status_res = await client.get(f"{self.BASE_URL}/user.status?handle={handle}&from=1&count=500")

            if info_res.status_code != 200 or status_res.status_code != 200:
                raise Exception("Failed to fetch Codeforces user stats")

            user_data = info_res.json()["result"][0]
            submissions = status_res.json().get("result", [])

            topic_analysis = {}
            solved_set = set()
            calendar = {}

            for sub in submissions:
                verdict = sub.get("verdict")
                creation_time = sub.get("creationTimeSeconds")

                if creation_time:
                    day_key = str(creation_time // 86400 * 86400)
                    calendar[day_key] = calendar.get(day_key, 0) + 1

                problem = sub.get("problem", {})
                prob_id = f"{problem.get('contestId')}_{problem.get('index')}"
                tags = problem.get("tags", [])

                for tag in tags:
                    if tag not in topic_analysis:
                        topic_analysis[tag] = {"solved": 0, "attempts": 0}
                    topic_analysis[tag]["attempts"] += 1
                    if verdict == "OK" and prob_id not in solved_set:
                        topic_analysis[tag]["solved"] += 1

                if verdict == "OK":
                    solved_set.add(prob_id)

            return {
                "handle": user_data.get("handle"),
                "rating": user_data.get("rating", 0),
                "max_rating": user_data.get("maxRating", 0),
                "rank": user_data.get("rank", "unrated"),
                "max_rank": user_data.get("maxRank", "unrated"),
                "total_solved": len(solved_set),
                "submission_calendar": calendar,
                "topic_analysis": topic_analysis,
                "contest_history": []
            }
