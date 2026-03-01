from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import TypingResult, User
from auth_utils import get_current_user  # we will define this
from datetime import datetime

router = APIRouter()

# DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/save-result")
def save_result(wpm: float, accuracy: float,
                db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):

    new_result = TypingResult(
        wpm=wpm,
        accuracy=accuracy,
        user_id=current_user.id,
        created_at=datetime.utcnow()
    )

    db.add(new_result)
    db.commit()
    db.refresh(new_result)

    return {"message": "Result saved successfully"}

@router.get("/leaderboard")
def leaderboard(db: Session = Depends(get_db)):

    top_users = (
        db.query(User.username, TypingResult.wpm)
        .join(TypingResult)
        .order_by(TypingResult.wpm.desc())
        .limit(10)
        .all()
    )

    return top_users

@router.get("/profile")
def profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    results = db.query(TypingResult).filter(
        TypingResult.user_id == current_user.id
    ).all()

    if not results:
        return {
            "best_wpm": 0,
            "average_wpm": 0,
            "total_tests": 0
        }

    best_wpm = max(r.wpm for r in results)
    avg_wpm = sum(r.wpm for r in results) / len(results)

    return {
        "best_wpm": round(best_wpm, 2),
        "average_wpm": round(avg_wpm, 2),
        "total_tests": len(results)
    }