import { useCallback, useEffect, useRef, useState } from "react";

const SR: any =
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    : undefined;

export function useSpeech(lang: string = "en-IN") {
  const [supported, setSupported] = useState<boolean>(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recRef = useRef<any>(null);

  useEffect(() => {
    setSupported(
      Boolean(typeof window !== "undefined" && (SR || window.speechSynthesis)),
    );
  }, []);

  const start = useCallback(() => {
    if (!SR) return;
    const rec = new SR();
    rec.lang = lang;
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e: any) => {
      const text = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join(" ");
      setTranscript(text);
      setListening(false);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  }, [lang]);

  const stop = useCallback(() => {
    const rec = recRef.current;
    if (rec) rec.stop();
    setListening(false);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang;
      window.speechSynthesis.speak(utter);
    },
    [lang],
  );

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

export const languages = [
  { code: "en-IN", label: "English (India)" },
  { code: "hi-IN", label: "Hindi" },
  { code: "bn-IN", label: "Bengali" },
  { code: "mr-IN", label: "Marathi" },
  { code: "ta-IN", label: "Tamil" },
  { code: "te-IN", label: "Telugu" },
];
