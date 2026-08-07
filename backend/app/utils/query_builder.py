from typing import Type, TypeVar, Optional, Any
from sqlalchemy.future import select
from sqlalchemy.sql import Select
from sqlalchemy import asc, desc

ModelT = TypeVar("ModelT")

class QueryBuilder:
    @staticmethod
    def apply_sort(
        stmt: Select,
        model: Type[ModelT],
        sort_by: Optional[str] = None,
        order: str = "asc"
    ) -> Select:
        if not sort_by or not hasattr(model, sort_by):
            return stmt

        column = getattr(model, sort_by)
        if order.lower() == "desc":
            return stmt.order_by(desc(column))
        return stmt.order_by(asc(column))
