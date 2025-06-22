"""create folders table

Revision ID: d3a9720ad7d4
Revises: 9c3e90319823
Create Date: 2025-06-22 15:55:46.309854

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd3a9720ad7d4'
down_revision: Union[str, None] = '9c3e90319823'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
