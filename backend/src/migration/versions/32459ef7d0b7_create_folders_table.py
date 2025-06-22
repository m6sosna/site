"""create folders table

Revision ID: 32459ef7d0b7
Revises: cf87b16ee07b
Create Date: 2025-06-22 15:58:59.582226

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '32459ef7d0b7'
down_revision: Union[str, None] = 'cf87b16ee07b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
