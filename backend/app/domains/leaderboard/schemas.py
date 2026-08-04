from pydantic import BaseModel
from typing import List, Optional

class LeaderboardUser(BaseModel):
    username: str
    avatar_url: Optional[str]
    developer_score: int
    total_problems_solved: int
    current_streak: int

class LeaderboardResponse(BaseModel):
    users: List[LeaderboardUser]
