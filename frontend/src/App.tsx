import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Particles from "react-tsparticles";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from "chart.js";
import { Line } from "react-chartjs-2";
import "./App.css";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

function App() {
  const [text, setText] = useState("");
  const [typedText, setTypedText] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);

  const [liveWPM, setLiveWPM] = useState(0);
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);
  const [finalStats, setFinalStats] = useState<any>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const backendURL = "http://127.0.0.1:8000";

  // Fetch text
  const fetchText = async () => {
    const res = await axios.get(`${backendURL}/get-text`);
    setText(res.data.text);
  };

  useEffect(() => {
    fetchText();
  }, []);

  // TIMER + LIVE WPM
  useEffect(() => {
    let interval: any;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);

        if (startTime) {
          const minutes = (Date.now() - startTime) / 60000;
          const words = typedText.length / 5;
          const wpm = words / minutes;
          const calculatedWPM = Math.max(Math.round(wpm), 0);

          setLiveWPM(calculatedWPM);
          setWpmHistory(prev => [...prev, calculatedWPM]);
        }
      }, 1000);
    }

    if (timeLeft === 0 && isRunning) {
      finishTest();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // ESC restart
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

    // FIXED SOUND LOGIC
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }

    if (value.length >= text.length) {
      finishTest();
    }
  };

  const finishTest = async () => {
    setIsRunning(false);

    if (!startTime) return;

    const timeTaken = (Date.now() - startTime) / 1000;

    const response = await axios.post(`${backendURL}/calculate`, {
      typed_text: typedText,
      original_text: text,
      time_taken: timeTaken
    });

    setFinalStats(response.data);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const restartTest = () => {
    setTypedText("");
    setStartTime(null);
    setTimeLeft(60);
    setIsRunning(false);
    setLiveWPM(0);
    setWpmHistory([]);
    setFinalStats(null);
    fetchText();

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    inputRef.current?.focus();
  };

  const renderText = () => {
    return text.split("").map((char, index) => {
      let className = "default";

      if (index < typedText.length) {
        className =
          char === typedText[index] ? "correct" : "incorrect";
      }

      if (index === typedText.length) {
        className += " current";
      }

      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="container">

      <Particles
        options={{
          particles: {
            number: { value: 60 },
            size: { value: 2 },
            move: { speed: 0.4 },
            color: { value: "#a855f7" }
          }
        }}
      />

      <div className="top-bar">
        <div className="timer">{timeLeft}s</div>
        <div className="live-wpm">Live WPM: {liveWPM}</div>
      </div>

      <div className="text-display">{renderText()}</div>

      <input
        ref={inputRef}
        type="text"
        className="hidden-input"
        autoFocus
        value={typedText}
        onChange={handleChange}
      />

      <audio ref={audioRef} src="/type.mp3" preload="auto" />

      {finalStats && (
        <motion.div
          className="results"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2>Final Results</h2>
          <p>Final WPM: {finalStats.wpm}</p>
          <p>Accuracy: {finalStats.accuracy}%</p>
          <p>Correct Words: {finalStats.correct_words}</p>
          <p>Total Characters Typed: {typedText.length}</p>

          <div className="graph">
            <Line
              data={{
                labels: wpmHistory.map((_, i) => i),
                datasets: [
                  {
                    label: "WPM Over Time",
                    data: wpmHistory,
                    borderColor: "#a855f7",
                    tension: 0.3
                  }
                ]
              }}
            />
          </div>

          <p className="restart-hint">Press ESC to restart</p>
        </motion.div>
      )}

    </div>
  );
}

export default App;
