"""Add classes and class_members tables

Revision ID: 003
Revises: 002
Create Date: 2026-05-09 10:00:00

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table('classes',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('description', sa.String(length=500), nullable=True),
        sa.Column('teacher_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('invite_code', sa.String(length=8), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('invite_code')
    )

    op.create_table('class_members',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('class_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('student_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('role', sa.String(length=20), nullable=True),
        sa.Column('joined_at', sa.DateTime(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('class_members')
    op.drop_table('classes')