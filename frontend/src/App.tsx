import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [text, setText] = useState("");
  const [typedText, setTypedText] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [result, setResult] = useState<any>(null);

  const backendURL = "http://127.0.0.1:8000";

  // Fetch text
  useEffect(() => {
    axios.get(`${backendURL}/get-text`)
      .then(res => setText(res.data.text));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!startTime) {
      setStartTime(Date.now());
    }
    setTypedText(e.target.value);
  };

  const handleSubmit = async () => {
    if (!startTime) return;

    const timeTaken = (Date.now() - startTime) / 1000;

    const response = await axios.post(`${backendURL}/calculate`, {
      typed_text: typedText,
      original_text: text,
      time_taken: timeTaken
    });

    setResult(response.data);
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Typing Speed Test</h1>

      <p><strong>Type this:</strong></p>
      <p style={{ background: "#eee", padding: "10px" }}>{text}</p>

      <textarea
        rows={5}
        style={{ width: "100%", marginTop: "20px" }}
        value={typedText}
        onChange={handleChange}
      />

      <button onClick={handleSubmit} style={{ marginTop: "20px" }}>
        Submit
      </button>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h2>Results:</h2>
          <p>Correct Words: {result.correct_words}</p>
          <p>WPM: {result.wpm}</p>
          <p>Accuracy: {result.accuracy}%</p>
        </div>
      )}
    </div>
  );
}

export default App;
