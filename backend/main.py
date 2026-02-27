from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random

# 🔹 Database imports
from database import engine
from models import Base

# 🔹 Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI()

from routers import auth
from routers import typing

app.include_router(auth.router)
app.include_router(typing.router)

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Later restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sample texts
TEXTS = [
    "The quick brown fox jumps over the lazy dog",
    "Typing speed improves with consistent practice",
    "React and FastAPI make a powerful combination",
    "Consistency is the key to becoming better"
]

class TypingRequest(BaseModel):
    typed_text: str
    original_text: str
    time_taken: float  # in seconds


@app.get("/")
def root():
    return {"message": "Typing Speed API Running with Database Connected"}


@app.get("/get-text")
def get_text():
    return {"text": random.choice(TEXTS)}


@app.post("/calculate")
def calculate_result(data: TypingRequest):
    typed = data.typed_text.strip()
    original = data.original_text.strip()

    # Word comparison
    typed_words = typed.split()
    original_words = original.split()

    correct_words = 0

    for i in range(min(len(typed_words), len(original_words))):
        if typed_words[i] == original_words[i]:
            correct_words += 1

    # Calculate WPM
    minutes = data.time_taken / 60
    wpm = correct_words / minutes if minutes > 0 else 0

    accuracy = (correct_words / len(original_words)) * 100

    return {
        "correct_words": correct_words,
        "wpm": round(wpm, 2),
        "accuracy": round(accuracy, 2)
    }