"""merge branches

Revision ID: ed7a434fb416
Revises: b777a36a4d82, ba33e518e7ba
Create Date: 2026-08-08 05:42:04.888688

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ed7a434fb416'
down_revision: Union[str, None] = ('b777a36a4d82', 'ba33e518e7ba')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
