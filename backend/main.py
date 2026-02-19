from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

leaderboard = []

@app.get("/")
def home():
    return {"message": "Typing Speed API Running"}

@app.post("/submit")
def submit_score(name: str, wpm: int, accuracy: int):
    leaderboard.append({
        "name": name,
        "wpm": wpm,
        "accuracy": accuracy
    })
    return {"message": "Score submitted"}

@app.get("/leaderboard")
def get_leaderboard():
    sorted_board = sorted(leaderboard, key=lambda x: x["wpm"], reverse=True)
    return sorted_board
