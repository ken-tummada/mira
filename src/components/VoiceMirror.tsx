import { useEffect, useState } from "react";
import { useVoice } from "../providers/useVoice";
import { sendToAI } from "../providers/SendToAI";

function VoiceMirror() {
  const {
    supported,
    listening,
    transcript,
    setTranscript,
    start,
    stop,
    speak,
  } = useVoice();
  const [lastReply, setLastReply] = useState("");

  // Voice commands that navigate your widgets
  const commands = [
    {
      match: /\b(weather|temperature|forecast)\b/i,
      run: async () => {
        window.dispatchEvent(
          new CustomEvent("mirror:navigate", { detail: "weather" }),
        );
        return "Showing today's weather.";
      },
    },
    {
      match: /\b(news|headlines)\b/i,
      run: async () => {
        window.dispatchEvent(
          new CustomEvent("mirror:navigate", { detail: "news" }),
        );
        return "Here are the latest headlines.";
      },
    },
    {
      match: /\b(calendar|schedule|events)\b/i,
      run: async () => {
        window.dispatchEvent(
          new CustomEvent("mirror:navigate", { detail: "calendar" }),
        );
        return "Opening your calendar.";
      },
    },
    {
      match: /\b(time|clock|hour)\b/i,
      run: async () => {
        window.dispatchEvent(
          new CustomEvent("mirror:navigate", { detail: "clock" }),
        );
        return "Here's the current time.";
      },
    },
  ];

  async function handleUtterance(text: string) {
    for (const c of commands) {
      if (c.match.test(text)) {
        const r = await c.run();
        setLastReply(r);
        speak(r);
        return;
      }
    }
    // default: ask AI
    const reply = await sendToAI(text);
    setLastReply(reply);
    speak(reply);
  }

  useEffect(() => {
    if (!listening && transcript) {
      const t = transcript.trim();
      setTranscript("");
      if (t) handleUtterance(t);
    }
  }, [listening]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!supported) {
    return (
      <div style={{ color: "gray", textAlign: "center", margin: "1rem" }}>
        Voice recognition not supported in this browser.
      </div>
    );
  }

  return (
    <div
      style={{
        textAlign: "center",
        background: "rgba(255,255,255,0.08)",
        borderRadius: "12px",
        padding: "1rem",
        margin: "1rem auto",
        maxWidth: 520,
      }}
    >
      <button
        onClick={listening ? stop : start}
        style={{
          background: listening ? "#ef4444" : "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "8px",
          padding: "0.6rem 1.2rem",
          cursor: "pointer",
          fontSize: "1rem",
          transition: "background 0.2s",
        }}
      >
        {listening ? "🛑 Stop Listening" : "🎙️ Talk to Mirror"}
      </button>

      <div style={{ marginTop: "0.6rem", fontSize: "0.9rem" }}>
        <b>You:</b> {transcript || <em>(press button and speak)</em>}
      </div>
      <div
        style={{ marginTop: "0.3rem", fontSize: "0.9rem", color: "#a5b4fc" }}
      >
        <b>Mirror:</b> {lastReply}
      </div>
    </div>
  );
}

export default VoiceMirror;
export { VoiceMirror };
