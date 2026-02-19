import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [typedText, setTypedText] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [result, setResult] = useState<any>(null);

  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);

  const backendURL = "http://127.0.0.1:8000";

  // Fetch text
  const fetchText = async () => {
    const res = await axios.get(`${backendURL}/get-text`);
    setText(res.data.text);
  };

  useEffect(() => {
    fetchText();
  }, []);

  // TIMER
  useEffect(() => {
    let interval: any;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }

    if (timeLeft === 0) {
      setIsRunning(false);
      submitTest();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // ESC KEY RESTART
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        restartTest();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (!isRunning) {
      setStartTime(Date.now());
      setIsRunning(true);
    }

    setTypedText(value);

    if (value.length === text.length) {
      submitTest();
    }
  };

  const submitTest = async () => {
    if (!startTime) return;

    const timeTaken = (Date.now() - startTime) / 1000;

    const response = await axios.post(`${backendURL}/calculate`, {
      typed_text: typedText,
      original_text: text,
      time_taken: timeTaken
    });

    setResult(response.data);
    setIsRunning(false);
  };

  const restartTest = () => {
    setTypedText("");
    setStartTime(null);
    setResult(null);
    setTimeLeft(60);
    setIsRunning(false);
    fetchText();
  };

  // Render colored characters
  const renderText = () => {
    return text.split("").map((char, index) => {
      let color = "#6b7280";

      if (index < typedText.length) {
        color = char === typedText[index] ? "#a855f7" : "#ef4444";
      }

      return (
        <span key={index} style={{ color }}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="container">

      <div className="top-bar">
        <div className="timer">{timeLeft}s</div>
        <div className="language">english</div>
      </div>

      <div className="text-display">
        {renderText()}
      </div>

      <input
        type="text"
        className="hidden-input"
        autoFocus
        value={typedText}
        onChange={handleChange}
      />

      {result && (
        <div className="results">
          <h2>Results</h2>
          <p>WPM: {result.wpm}</p>
          <p>Accuracy: {result.accuracy}%</p>
          <p className="restart-hint">Press ESC to restart</p>
        </div>
      )}

    </div>
  );
}

export default App;
