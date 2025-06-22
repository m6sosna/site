"""create folders table

Revision ID: 9c3e90319823
Revises: f6e20722737f
Create Date: 2025-06-22 15:55:19.290503

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9c3e90319823'
down_revision: Union[str, None] = 'f6e20722737f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
