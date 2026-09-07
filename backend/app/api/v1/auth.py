import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.config import UserRole
from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.user import User
from app.models.audit import AuditLog
from app.schemas.auth import UserRegister, UserLogin, Token, UserResponse

router = APIRouter()


def mask_phone_number(phone: str) -> str:
    """Mask sensitive phone number for privacy compliance (Rule 8)."""
    digits = re.sub(r"\D", "", phone)
    if len(digits) >= 10:
        return f"+91 ******{digits[-4:]}"
    elif len(digits) >= 4:
        return f"******{digits[-4:]}"
    return "******"


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """Register a new user account with role assignment and privacy masking."""
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
    
    masked_phone = mask_phone_number(user_in.phone) if user_in.phone else None

    user = User(
        email=user_in.email.lower(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role,
        phone_masked=masked_phone,
        facility_type=user_in.facility_type,
        facility_id=user_in.facility_id,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Record registration audit
    audit = AuditLog(
        user_id=user.id,
        action="USER_REGISTERED",
        resource_type="USER",
        resource_id=str(user.id),
        details=f"User registered with role {user.role.value}"
    )
    db.add(audit)
    db.commit()

    return user


@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate credentials and issue JWT access token with role claims."""
    user = db.query(User).filter(User.email == login_data.email.lower()).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account. Contact administrator."
        )

    token = create_access_token(
        subject=user.id,
        role=user.role.value,
        email=user.email,
        facility_id=user.facility_id
    )

    # Log successful login
    audit = AuditLog(
        user_id=user.id,
        action="USER_LOGIN_SUCCESS",
        resource_type="AUTH",
        resource_id=str(user.id),
        details=f"Successful login for role {user.role.value}"
    )
    db.add(audit)
    db.commit()

    return Token(
        access_token=token,
        token_type="bearer",
        role=user.role,
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        facility_type=user.facility_type,
        facility_id=user.facility_id
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Return currently authenticated user profile."""
    return current_user
