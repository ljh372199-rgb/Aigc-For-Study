from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from datetime import datetime

from app.models.user import User
from app.models.assignment import Assignment
from app.models.submission import AssignmentSubmission
from app.schemas.assignment import (
    AssignmentCreate, AssignmentUpdate, AssignmentResponse,
    SubmissionCreate, SubmissionUpdate, SubmissionResponse
)
from app.core.security import require_role
from app.api.deps import get_db, get_current_active_user

router = APIRouter()

@router.post("/", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED)
def create_assignment(
    assignment_in: AssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["teacher", "admin"]))
):
    assignment = Assignment(
        teacher_id=current_user.id,
        **assignment_in.model_dump()
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment

@router.get("/", response_model=List[AssignmentResponse])
def list_assignments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(Assignment)

    if current_user.role == "teacher":
        query = query.filter(Assignment.teacher_id == current_user.id)

    return query.order_by(Assignment.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/{assignment_id}", response_model=AssignmentResponse)
def get_assignment(
    assignment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return assignment

@router.put("/{assignment_id}", response_model=AssignmentResponse)
def update_assignment(
    assignment_id: UUID,
    assignment_update: AssignmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["teacher", "admin"]))
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    if current_user.role != "admin" and assignment.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    for field, value in assignment_update.model_dump(exclude_unset=True).items():
        setattr(assignment, field, value)

    db.commit()
    db.refresh(assignment)
    return assignment

@router.delete("/{assignment_id}")
def delete_assignment(
    assignment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["teacher", "admin"]))
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    if current_user.role != "admin" and assignment.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(assignment)
    db.commit()
    return {"message": "Assignment deleted"}

@router.post("/{assignment_id}/submit", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
def submit_assignment(
    assignment_id: UUID,
    submission_in: SubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["student"]))
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    existing = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.assignment_id == assignment_id,
        AssignmentSubmission.student_id == current_user.id
    ).first()

    if existing:
        existing.content = submission_in.content
        existing.attachments = submission_in.attachments
        existing.submitted_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing

    submission = AssignmentSubmission(
        assignment_id=assignment_id,
        student_id=current_user.id,
        content=submission_in.content,
        attachments=submission_in.attachments
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission

@router.get("/{assignment_id}/submissions", response_model=List[SubmissionResponse])
def list_submissions(
    assignment_id: UUID,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    if current_user.role == "teacher" and assignment.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    query = db.query(AssignmentSubmission).filter(AssignmentSubmission.assignment_id == assignment_id)

    return query.offset(skip).limit(limit).all()

@router.put("/submissions/{submission_id}/grade", response_model=SubmissionResponse)
async def grade_submission(
    submission_id: UUID,
    update_data: SubmissionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["teacher", "admin"]))
):
    submission = db.query(AssignmentSubmission).filter(AssignmentSubmission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    assignment = db.query(Assignment).filter(Assignment.id == submission.assignment_id).first()
    if current_user.role != "admin" and assignment.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if update_data.score is not None:
        submission.score = update_data.score
    if update_data.feedback is not None:
        submission.feedback = update_data.feedback
    if update_data.status is not None:
        submission.status = update_data.status

    submission.graded_at = datetime.utcnow()

    db.commit()
    db.refresh(submission)
    return submission
