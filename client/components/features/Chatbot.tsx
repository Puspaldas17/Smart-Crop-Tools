import { useEffect, useMemo, useState } from "react";
import { useSpeech, languages } from "./useSpeech";
import { Mic, StopCircle, Send } from "lucide-react";

export default function Chatbot() {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [lang, setLang] = useState("en-IN");
  const {
    listening,
    transcript,
    setTranscript,
    start,
    stop,
    speak,
    supported,
  } = useSpeech(lang);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null,
  );

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
      setTranscript("");
    }
  }, [transcript, setTranscript]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((p) =>
      setCoords({ lat: p.coords.latitude, lon: p.coords.longitude }),
    );
  }, []);

  useEffect(() => {
    const focusHandler = () => inputRef.current?.focus();
    const langHandler = (e: any) => setLang(e?.detail || "en-IN");
    window.addEventListener("chat:focus", focusHandler as any);
    window.addEventListener("chat:set-language", langHandler as any);
    return () => {
      window.removeEventListener("chat:focus", focusHandler as any);
      window.removeEventListener("chat:set-language", langHandler as any);
    };
  }, []);

  async function send() {
    if (!input.trim()) return;
    const msg = input.trim();
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setInput("");
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg, ...(coords || {}) }),
    });
    const data = await res.json();
    const reply = res.ok ? data.reply : data.error || "Error";
    setMessages((m) => [...m, { role: "assistant", content: reply }]);
    speak(reply);
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 p-3">
        <div className="text-sm font-semibold">AI Chatbot</div>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1 text-sm"
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </div>
      <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="text-sm text-slate-500">
            Ask about weather, market prices, crop/fertilizer advice…
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`${m.role === "user" ? "justify-end" : "justify-start"} flex`}
          >
            <div
              className={`${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-slate-100 text-slate-800"} max-w-[80%] rounded-lg px-3 py-2 text-sm`}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t border-slate-200 p-3">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question…"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        {supported &&
          (listening ? (
            <button
              onClick={stop}
              title="Stop"
              className="rounded-md border border-slate-300 p-2 text-slate-700"
            >
              <StopCircle className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={start}
              title="Speak"
              className="rounded-md border border-slate-300 p-2 text-slate-700"
            >
              <Mic className="h-5 w-5" />
            </button>
          ))}
        <button
          onClick={send}
          className="rounded-md bg-primary p-2 text-primary-foreground"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
