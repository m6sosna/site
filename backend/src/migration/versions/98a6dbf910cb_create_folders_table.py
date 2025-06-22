"""create folders table

Revision ID: 98a6dbf910cb
Revises: d3a9720ad7d4
Create Date: 2025-06-22 15:56:53.066627

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '98a6dbf910cb'
down_revision: Union[str, None] = 'd3a9720ad7d4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
