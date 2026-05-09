from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import UUID
from datetime import datetime, timedelta

from app.models.user import User
from app.models.check_in import DailyCheckIn
from app.models.exercise import Exercise
from app.models.assignment import Assignment
from app.models.submission import AssignmentSubmission
from app.schemas.analytics import StudentProgress, StudentStats, ClassStats, AssignmentStats
from app.core.security import require_role
from app.api.deps import get_db, get_current_active_user

router = APIRouter()

@router.get("/students/me", response_model=StudentProgress)
def get_my_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    check_ins = db.query(DailyCheckIn).filter(DailyCheckIn.user_id == current_user.id).all()
    total_study_time = sum(c.duration_minutes or 0 for c in check_ins)
    
    exercises = db.query(Exercise).filter(Exercise.student_id == current_user.id).all()
    completed_exercises = len([e for e in exercises if e.submitted_at])
    
    submissions = db.query(AssignmentSubmission).filter(AssignmentSubmission.student_id == current_user.id).all()
    completed_assignments = len([s for s in submissions if s.status == "graded"])
    
    recent_checkins = [c for c in check_ins if c.check_in_date and c.check_in_date >= (datetime.now().date() - timedelta(days=7))]
    current_streak = len(recent_checkins)
    
    avg_score = None
    graded_subs = [s for s in submissions if s.score is not None]
    if graded_subs:
        avg_score = sum(s.score for s in graded_subs) / len(graded_subs)
    
    return StudentProgress(
        total_study_time=total_study_time,
        total_exercises=len(exercises),
        completed_exercises=completed_exercises,
        total_assignments=len(submissions),
        completed_assignments=completed_assignments,
        average_score=avg_score,
        current_streak=current_streak
    )

@router.get("/student/{student_id}/progress", response_model=StudentProgress)
def get_student_progress(
    student_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role == "student" and str(current_user.id) != str(student_id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    check_ins = db.query(DailyCheckIn).filter(DailyCheckIn.user_id == student_id).all()
    total_study_time = sum(c.duration_minutes or 0 for c in check_ins)
    
    exercises = db.query(Exercise).filter(Exercise.student_id == student_id).all()
    completed_exercises = len([e for e in exercises if e.submitted_at])
    
    submissions = db.query(AssignmentSubmission).filter(AssignmentSubmission.student_id == student_id).all()
    completed_assignments = len([s for s in submissions if s.status == "graded"])
    
    recent_checkins = [c for c in check_ins if c.check_in_date and c.check_in_date >= (datetime.now().date() - timedelta(days=7))]
    current_streak = len(recent_checkins)
    
    avg_score = None
    graded_subs = [s for s in submissions if s.score is not None]
    if graded_subs:
        avg_score = sum(s.score for s in graded_subs) / len(graded_subs)
    
    return StudentProgress(
        total_study_time=total_study_time,
        total_exercises=len(exercises),
        completed_exercises=completed_exercises,
        total_assignments=len(submissions),
        completed_assignments=completed_assignments,
        average_score=avg_score,
        current_streak=current_streak
    )

@router.get("/student/{student_id}/stats", response_model=StudentStats)
async def get_student_stats(
    student_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role == "student" and str(current_user.id) != str(student_id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    from app.services.ai_service import ai_service
    
    return await ai_service.analyze_learning_progress(str(student_id))

@router.get("/teacher/{teacher_id}/class-stats", response_model=ClassStats)
def get_class_stats(
    teacher_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["teacher", "admin"]))
):
    if current_user.role == "teacher" and str(current_user.id) != str(teacher_id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    assignments = db.query(Assignment).filter(Assignment.teacher_id == teacher_id).all()
    assignment_ids = [a.id for a in assignments]
    
    submissions = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.assignment_id.in_(assignment_ids)
    ).all()
    
    total_students = len(set(s.student_id for s in submissions))
    graded_subs = [s for s in submissions if s.score is not None]
    
    average_score = 0
    if graded_subs:
        average_score = sum(s.score for s in graded_subs) / len(graded_subs)
    
    return ClassStats(
        total_students=total_students,
        average_completion_rate=len(submissions) / max(len(assignment_ids) * total_students, 1) * 100,
        average_score=average_score,
        top_performers=[],
        struggling_students=[]
    )

@router.get("/teacher/{teacher_id}/assignment-stats", response_model=AssignmentStats)
def get_assignment_stats(
    teacher_id: UUID,
    assignment_id: UUID = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["teacher", "admin"]))
):
    query = db.query(AssignmentSubmission)
    
    if assignment_id:
        query = query.filter(AssignmentSubmission.assignment_id == assignment_id)
    elif current_user.role == "teacher":
        assignments = db.query(Assignment).filter(Assignment.teacher_id == current_user.id).all()
        query = query.filter(AssignmentSubmission.assignment_id.in_([a.id for a in assignments]))
    
    submissions = query.all()
    graded = [s for s in submissions if s.score is not None]
    
    score_dist = {"A": 0, "B": 0, "C": 0, "D": 0, "F": 0}
    for s in graded:
        if s.score >= 90:
            score_dist["A"] += 1
        elif s.score >= 80:
            score_dist["B"] += 1
        elif s.score >= 70:
            score_dist["C"] += 1
        elif s.score >= 60:
            score_dist["D"] += 1
        else:
            score_dist["F"] += 1
    
    return AssignmentStats(
        total_submissions=len(submissions),
        graded_submissions=len(graded),
        average_score=sum(s.score for s in graded) / len(graded) if graded else 0,
        score_distribution=score_dist
    )
