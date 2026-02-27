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

  const [selectedTime, setSelectedTime] = useState(30);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isRunning, setIsRunning] = useState(false);

  const [liveWPM, setLiveWPM] = useState(0);
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);
  const [finalStats, setFinalStats] = useState<any>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const backendURL = "http://127.0.0.1:8000";

  // Fetch text
  const fetchText = async () => {
    const res = await axios.get(`${backendURL}/get-text`);
    setText(res.data.text);
  };

  useEffect(() => {
    fetchText();
  }, []);

  // Timer logic
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

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => { });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
        }
      }, 150);
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
    setTimeLeft(selectedTime);
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

  const changeTime = (time: number) => {
    setSelectedTime(time);
    setTimeLeft(time);
    restartTest();
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
    <div className="app">

      <Particles
        options={{
          particles: {
            number: { value: 40 },
            size: { value: 2 },
            move: { speed: 0.3 },
            color: { value: "#a855f7" }
          }
        }}
      />

      {/* HEADER */}
      <div className="header">
        <div className="navbar">
          <div className="logo">⚡ TypeMaster</div>
          <div className="nav-icons">
            <span>⌨</span>
            <span>🏆</span>
            <span>⚙</span>
          </div>
        </div>

        <div className="mode-bar">
          <span className="active">time</span>
          <span>words</span>
          <span>quote</span>
          <span>zen</span>
        </div>

        <div className="time-selector">
          {[15, 30, 60, 120].map((t) => (
            <span
              key={t}
              className={selectedTime === t ? "active-time" : ""}
              onClick={() => changeTime(t)}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* MAIN CENTER */}
      <div className="main">
        <div className="language">english</div>

        <div className="stats">
          <span>{timeLeft}s</span>
          <span>WPM: {liveWPM}</span>
        </div>

        <div className="text-area">
          {renderText()}
        </div>

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

            <p>Press ESC to restart</p>
          </motion.div>
        )}
      </div>

      <input
        ref={inputRef}
        type="text"
        className="hidden-input"
        autoFocus
        value={typedText}
        onChange={handleChange}
      />

      <audio ref={audioRef} src="/type.mp3" preload="auto" />

      {/* FOOTER */}
      <div className="footer">
        <span>esc — restart</span>
        <span>ctrl + shift + p — command line</span>
      </div>

    </div>
  );
}
export default App;