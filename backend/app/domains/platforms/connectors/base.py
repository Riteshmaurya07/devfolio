from abc import ABC, abstractmethod
from typing import Dict, Any

class PlatformConnector(ABC):
    @property
    @abstractmethod
    def platform_name(self) -> str:
        pass

    @abstractmethod
    async def fetch_stats(self, username: str) -> Dict[str, Any]:
        """Fetch raw stats from the external platform."""
        pass

    @abstractmethod
    def parse_metrics(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse raw data into normalized metrics (e.g. problems solved, stars)."""
        pass
