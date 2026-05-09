from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_active_user, require_role
from app.models.user import User
import app.models
from app.models.course import Course, CourseEnrollment
from app.models.class_model import Class, ClassMember
from app.models.course_class_binding import CourseClassBinding
from app.schemas.course import CourseCreate, CourseUpdate, CourseResponse, CourseEnrollmentResponse
from app.schemas.course_class_binding import BindClassRequest, ClassBindingResponse

router = APIRouter()

@router.post("/", response_model=CourseResponse)
def create_course(
    course: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["teacher", "admin"]))
):
    new_course = Course(
        title=course.title,
        description=course.description,
        cover_image=course.cover_image,
        teacher_id=current_user.id
    )
    
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    
    return new_course

@router.get("/", response_model=list[CourseResponse])
def list_courses(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role == "teacher":
        return db.query(Course).filter(Course.teacher_id == current_user.id).offset(skip).limit(limit).all()
    return db.query(Course).offset(skip).limit(limit).all()

@router.get("/{course_id}", response_model=CourseResponse)
def read_course(
    course_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.put("/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: UUID,
    course_update: CourseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["teacher", "admin"]))
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if current_user.role != "admin" and course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this course")
    
    if course_update.title:
        course.title = course_update.title
    if course_update.description:
        course.description = course_update.description
    if course_update.cover_image:
        course.cover_image = course_update.cover_image
    
    db.commit()
    db.refresh(course)
    return course

@router.delete("/{course_id}", response_model=dict)
def delete_course(
    course_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["teacher", "admin"]))
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if current_user.role != "admin" and course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this course")
    
    db.delete(course)
    db.commit()
    
    return {"message": "Course deleted successfully"}

@router.post("/{course_id}/enroll", response_model=CourseEnrollmentResponse)
def enroll_course(
    course_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["student"]))
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    existing = db.query(CourseEnrollment).filter(
        CourseEnrollment.course_id == course_id,
        CourseEnrollment.student_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")
    
    enrollment = CourseEnrollment(
        course_id=course_id,
        student_id=current_user.id
    )
    
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    
    return enrollment

@router.get("/{course_id}/students", response_model=list[CourseEnrollmentResponse])
def get_course_students(
    course_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["teacher", "admin"]))
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if current_user.role != "admin" and course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view students")
    
    return db.query(CourseEnrollment).filter(CourseEnrollment.course_id == course_id).all()


@router.post("/{course_id}/classes", response_model=ClassBindingResponse)
def bind_course_to_class(
    course_id: UUID,
    request: BindClassRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["teacher", "admin"]))
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if current_user.role != "admin" and course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to bind this course")
    
    cls = db.query(Class).filter(Class.id == request.class_id).first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")
    
    existing = db.query(CourseClassBinding).filter(
        CourseClassBinding.course_id == course_id,
        CourseClassBinding.class_id == request.class_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Course already bound to this class")
    
    binding = CourseClassBinding(
        course_id=course_id,
        class_id=request.class_id
    )
    
    db.add(binding)
    db.commit()
    db.refresh(binding)
    
    return ClassBindingResponse(
        id=binding.id,
        course_id=binding.course_id,
        class_id=binding.class_id,
        class_name=cls.name,
        created_at=binding.created_at
    )


@router.delete("/{course_id}/classes/{class_id}", response_model=dict)
def unbind_course_from_class(
    course_id: UUID,
    class_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["teacher", "admin"]))
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if current_user.role != "admin" and course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to unbind this course")
    
    binding = db.query(CourseClassBinding).filter(
        CourseClassBinding.course_id == course_id,
        CourseClassBinding.class_id == class_id
    ).first()
    if not binding:
        raise HTTPException(status_code=404, detail="Binding not found")
    
    db.delete(binding)
    db.commit()
    
    return {"message": "Course unbound from class successfully"}


@router.get("/{course_id}/classes", response_model=list[dict])
def get_course_classes(
    course_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    bindings = db.query(CourseClassBinding).filter(
        CourseClassBinding.course_id == course_id
    ).all()
    
    result = []
    for binding in bindings:
        cls = db.query(Class).filter(Class.id == binding.class_id).first()
        if cls:
            result.append({
                "id": str(cls.id),
                "name": cls.name,
                "description": cls.description,
                "teacher_id": str(cls.teacher_id),
                "invite_code": cls.invite_code,
                "status": cls.status,
                "created_at": cls.created_at.isoformat() if cls.created_at else None,
                "updated_at": cls.updated_at.isoformat() if cls.updated_at else None,
                "binding_id": str(binding.id),
                "bound_at": binding.created_at.isoformat() if binding.created_at else None
            })
    
    return result
