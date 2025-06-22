"""create folders table

Revision ID: cf87b16ee07b
Revises: 98a6dbf910cb
Create Date: 2025-06-22 15:58:31.982312

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cf87b16ee07b'
down_revision: Union[str, None] = '98a6dbf910cb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
