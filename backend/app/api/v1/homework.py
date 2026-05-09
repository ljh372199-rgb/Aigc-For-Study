from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_active_user, require_role
from app.models.user import User
import app.models
from app.models.course import Course
from app.models.homework import Homework, HomeworkSubmission
from app.schemas.homework import HomeworkCreate, HomeworkUpdate, HomeworkResponse, HomeworkSubmissionCreate, HomeworkSubmissionUpdate, HomeworkSubmissionResponse

router = APIRouter()

@router.post("/", response_model=HomeworkResponse)
def create_homework(
    homework: HomeworkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["teacher", "admin"]))
):
    course = db.query(Course).filter(Course.id == homework.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if current_user.role != "admin" and course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to create homework for this course")
    
    new_homework = Homework(
        title=homework.title,
        description=homework.description,
        course_id=homework.course_id,
        deadline=homework.deadline,
        max_score=homework.max_score
    )
    
    db.add(new_homework)
    db.commit()
    db.refresh(new_homework)
    
    return new_homework

@router.get("/", response_model=list[HomeworkResponse])
def list_homeworks(
    course_id: UUID = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(Homework)
    
    if course_id:
        query = query.filter(Homework.course_id == course_id)
    
    if current_user.role == "teacher":
        query = query.join(Course).filter(Course.teacher_id == current_user.id)
    
    return query.offset(skip).limit(limit).all()

@router.get("/{homework_id}", response_model=HomeworkResponse)
def read_homework(
    homework_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    homework = db.query(Homework).filter(Homework.id == homework_id).first()
    if not homework:
        raise HTTPException(status_code=404, detail="Homework not found")
    return homework

@router.put("/{homework_id}", response_model=HomeworkResponse)
def update_homework(
    homework_id: UUID,
    homework_update: HomeworkUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["teacher", "admin"]))
):
    homework = db.query(Homework).filter(Homework.id == homework_id).first()
    if not homework:
        raise HTTPException(status_code=404, detail="Homework not found")
    
    course = db.query(Course).filter(Course.id == homework.course_id).first()
    if current_user.role != "admin" and course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this homework")
    
    if homework_update.title:
        homework.title = homework_update.title
    if homework_update.description:
        homework.description = homework_update.description
    if homework_update.deadline:
        homework.deadline = homework_update.deadline
    if homework_update.max_score:
        homework.max_score = homework_update.max_score
    
    db.commit()
    db.refresh(homework)
    return homework

@router.delete("/{homework_id}", response_model=dict)
def delete_homework(
    homework_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["teacher", "admin"]))
):
    homework = db.query(Homework).filter(Homework.id == homework_id).first()
    if not homework:
        raise HTTPException(status_code=404, detail="Homework not found")
    
    course = db.query(Course).filter(Course.id == homework.course_id).first()
    if current_user.role != "admin" and course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this homework")
    
    db.delete(homework)
    db.commit()
    
    return {"message": "Homework deleted successfully"}

@router.post("/{homework_id}/submit", response_model=HomeworkSubmissionResponse)
def submit_homework(
    homework_id: UUID,
    submission: HomeworkSubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["student"]))
):
    homework = db.query(Homework).filter(Homework.id == homework_id).first()
    if not homework:
        raise HTTPException(status_code=404, detail="Homework not found")
    
    existing = db.query(HomeworkSubmission).filter(
        HomeworkSubmission.homework_id == homework_id,
        HomeworkSubmission.student_id == current_user.id
    ).first()
    if existing:
        existing.content = submission.content
        existing.status = "submitted"
        db.commit()
        db.refresh(existing)
        return existing
    
    new_submission = HomeworkSubmission(
        homework_id=homework_id,
        student_id=current_user.id,
        content=submission.content
    )
    
    db.add(new_submission)
    db.commit()
    db.refresh(new_submission)
    
    return new_submission

@router.get("/{homework_id}/submissions", response_model=list[HomeworkSubmissionResponse])
def get_homework_submissions(
    homework_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["teacher", "admin"]))
):
    homework = db.query(Homework).filter(Homework.id == homework_id).first()
    if not homework:
        raise HTTPException(status_code=404, detail="Homework not found")
    
    course = db.query(Course).filter(Course.id == homework.course_id).first()
    if current_user.role != "admin" and course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view submissions")
    
    return db.query(HomeworkSubmission).filter(HomeworkSubmission.homework_id == homework_id).all()

@router.get("/submissions/mine", response_model=list[HomeworkSubmissionResponse])
def get_my_submissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["student"]))
):
    return db.query(HomeworkSubmission).filter(HomeworkSubmission.student_id == current_user.id).all()

@router.put("/submissions/{submission_id}", response_model=HomeworkSubmissionResponse)
def grade_submission(
    submission_id: UUID,
    update: HomeworkSubmissionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["teacher", "admin"]))
):
    submission = db.query(HomeworkSubmission).filter(HomeworkSubmission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    homework = db.query(Homework).filter(Homework.id == submission.homework_id).first()
    course = db.query(Course).filter(Course.id == homework.course_id).first()
    
    if current_user.role != "admin" and course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to grade this submission")
    
    if update.score is not None:
        submission.score = update.score
    if update.feedback:
        submission.feedback = update.feedback
    if update.status:
        submission.status = update.status
    
    db.commit()
    db.refresh(submission)
    
    return submission