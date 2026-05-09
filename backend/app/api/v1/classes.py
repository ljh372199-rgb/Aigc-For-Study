from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from uuid import UUID
import random
import string

from app.models.class_model import Class, ClassMember
from app.models.course_class_binding import CourseClassBinding
from app.models.course import Course
from app.models.user import User
from app.schemas.class_schema import (
    ClassCreate, 
    ClassResponse, 
    ClassMemberResponse,
    JoinClassRequest,
    InviteCodeResponse
)
from app.api.deps import get_db, get_current_user
from app.core.security import decode_token

router = APIRouter()

def generate_invite_code(length: int = 8) -> str:
    characters = string.ascii_uppercase + string.digits
    return ''.join(random.choices(characters, k=length))

def create_unique_invite_code(db: Session, max_retries: int = 10) -> str:
    for _ in range(max_retries):
        code = generate_invite_code()
        existing = db.query(Class).filter(Class.invite_code == code).first()
        if not existing:
            return code
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to generate unique invite code"
    )

@router.post("/classes", response_model=ClassResponse, status_code=status.HTTP_201_CREATED)
def create_class(
    class_in: ClassCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["teacher", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can create classes"
        )
    
    invite_code = create_unique_invite_code(db)
    
    new_class = Class(
        name=class_in.name,
        description=class_in.description,
        teacher_id=current_user.id,
        invite_code=invite_code
    )
    
    db.add(new_class)
    
    class_member = ClassMember(
        class_id=new_class.id,
        student_id=current_user.id,
        role="teacher"
    )
    db.add(class_member)
    
    db.commit()
    db.refresh(new_class)
    
    return new_class

@router.get("/classes/my")
def get_my_classes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    created_classes = db.query(Class).filter(
        Class.teacher_id == current_user.id
    ).all()
    
    member_class_ids = db.query(ClassMember.class_id).filter(
        ClassMember.student_id == current_user.id
    ).all()
    member_class_ids = [c[0] for c in member_class_ids]
    
    enrolled_classes = []
    if member_class_ids:
        enrolled_classes = db.query(Class).filter(
            Class.id.in_(member_class_ids)
        ).all()
    
    all_classes = {cls.id: cls for cls in created_classes + enrolled_classes}
    
    return [
        {
            "id": str(cls.id),
            "name": cls.name,
            "description": cls.description,
            "teacher_id": str(cls.teacher_id) if cls.teacher_id else None,
            "invite_code": cls.invite_code,
            "status": cls.status,
            "created_at": cls.created_at.isoformat() if cls.created_at else None,
            "updated_at": cls.updated_at.isoformat() if cls.updated_at else None,
        }
        for cls in all_classes.values()
    ]

@router.get("/classes", response_model=list[ClassResponse])
def get_classes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role in ["teacher", "admin"]:
        classes = db.query(Class).filter(Class.teacher_id == current_user.id).all()
    else:
        class_ids = db.query(ClassMember.class_id).filter(
            ClassMember.student_id == current_user.id
        ).all()
        class_ids = [c[0] for c in class_ids]
        classes = db.query(Class).filter(Class.id.in_(class_ids)).all()
    
    return classes

@router.get("/classes/{class_id}", response_model=ClassResponse)
def get_class_detail(
    class_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cls = db.query(Class).filter(Class.id == class_id).first()
    if not cls:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )
    
    if current_user.role in ["teacher", "admin"]:
        if cls.teacher_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own classes"
            )
    else:
        member = db.query(ClassMember).filter(
            ClassMember.class_id == class_id,
            ClassMember.student_id == current_user.id
        ).first()
        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this class"
            )
    
    return cls

@router.get("/classes/{class_id}/invite-code", response_model=InviteCodeResponse)
def get_invite_code(
    class_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cls = db.query(Class).filter(Class.id == class_id).first()
    if not cls:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )
    
    if cls.teacher_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the class owner can access the invite code"
        )
    
    return InviteCodeResponse(
        invite_code=cls.invite_code,
        class_id=cls.id,
        class_name=cls.name
    )

@router.post("/classes/join")
def join_class(
    join_request: JoinClassRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["student", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can join classes"
        )
    
    cls = db.query(Class).filter(Class.invite_code == join_request.invite_code).first()
    if not cls:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid invite code"
        )
    
    existing_member = db.query(ClassMember).filter(
        ClassMember.class_id == cls.id,
        ClassMember.student_id == current_user.id
    ).first()
    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already a member of this class"
        )
    
    new_member = ClassMember(
        class_id=cls.id,
        student_id=current_user.id,
        role="student"
    )
    
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    
    return {
        "message": "Successfully joined the class",
        "class_id": str(cls.id),
        "class_name": cls.name
    }


@router.get("/classes/{class_id}/courses")
def get_class_courses(
    class_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cls = db.query(Class).filter(Class.id == class_id).first()
    if not cls:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )
    
    member = db.query(ClassMember).filter(
        ClassMember.class_id == class_id,
        ClassMember.student_id == current_user.id
    ).first()
    
    if not member and cls.teacher_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this class"
        )
    
    bindings = db.query(CourseClassBinding).filter(
        CourseClassBinding.class_id == class_id
    ).all()
    
    result = []
    for binding in bindings:
        course = db.query(Course).filter(Course.id == binding.course_id).first()
        if course:
            result.append({
                "id": str(course.id),
                "title": course.title,
                "description": course.description,
                "cover_image": course.cover_image,
                "teacher_id": str(course.teacher_id),
                "status": course.status,
                "created_at": course.created_at.isoformat() if course.created_at else None,
                "updated_at": course.updated_at.isoformat() if course.updated_at else None,
                "binding_id": str(binding.id),
                "bound_at": binding.created_at.isoformat() if binding.created_at else None
            })
    
    return result
