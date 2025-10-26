import { useEffect, useRef, useState } from "react";

export type UseVoiceOpts = {
  lang?: string;
  interim?: boolean;
  autoStopMs?: number;
};

function useVoice({
  lang = "en-US",
  interim = false,
  autoStopMs = 800,
}: UseVoiceOpts = {}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recogRef = useRef<any>(null);
  const autoTimer = useRef<any>(null);

  useEffect(() => {
    const SR: any =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    setSupported(true);

    const r = new SR();
    r.lang = lang;
    r.interimResults = interim;
    r.continuous = true;

    r.onresult = (e: any) => {
      let t = "";
      for (let i = e.resultIndex; i < e.results.length; i++)
        t += e.results[i][0].transcript;
      setTranscript(t.trim());

      // stop listening shortly after user pauses
      if (autoTimer.current) clearTimeout(autoTimer.current);
      autoTimer.current = setTimeout(() => stop(), autoStopMs);
    };

    r.onend = () => setListening(false);
    recogRef.current = r;
  }, [lang, interim, autoStopMs]);

  const start = () => {
    if (recogRef.current && !listening) {
      recogRef.current.start();
      setListening(true);
    }
  };

  const stop = () => {
    if (recogRef.current && listening) {
      recogRef.current.stop();
      setListening(false);
    }
  };

  const speak = (text: string) => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    synth.cancel();
    synth.speak(u);
  };

  return {
    supported,
    listening,
    transcript,
    setTranscript,
    start,
    stop,
    speak,
  };
}

export { useVoice };
export default useVoice;
