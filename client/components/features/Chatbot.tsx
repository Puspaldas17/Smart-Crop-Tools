import React, { useEffect, useRef, useState } from "react";
import { useSpeech, languages } from "./useSpeech";
import { Mic, StopCircle, Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

export default function Chatbot() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { farmer } = useAuth();
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
  const [voiceMode, setVoiceMode] = useState(false);

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
      setTranscript("");
    }
  }, [transcript, setTranscript]);

  useEffect(() => {
    if (farmer?.language && farmer.language !== lang) setLang(farmer.language);
  }, [farmer, lang]);

  // Load previous chat messages for this user
  useEffect(() => {
    const key = farmer?.phone ? `chat:${farmer.phone}` : "chat:anon";
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setMessages(parsed);
      }
    } catch { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmer?.phone]);

  // Persist messages whenever they change
  useEffect(() => {
    const key = farmer?.phone ? `chat:${farmer.phone}` : "chat:anon";
    try {
      localStorage.setItem(key, JSON.stringify(messages));
    } catch { }
  }, [messages, farmer?.phone]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((p) =>
      setCoords({ lat: p.coords.latitude, lon: p.coords.longitude }),
    );
  }, []);

  useEffect(() => {
    const focusHandler = () => inputRef.current?.focus();
    const langHandler = (e: any) => setLang(e?.detail || "en-IN");
    const voiceHandler = () => {
      setVoiceMode(true);
      try {
        speak(t('chat.mic_prompt'));
      } catch { }
      const el = document.getElementById("chat");
      el?.scrollIntoView({ behavior: "smooth" });
    };
    window.addEventListener("chat:focus", focusHandler as any);
    window.addEventListener("chat:set-language", langHandler as any);
    window.addEventListener("chat:voice-mode", voiceHandler as any);
    return () => {
      window.removeEventListener("chat:focus", focusHandler as any);
      window.removeEventListener("chat:set-language", langHandler as any);
      window.removeEventListener("chat:voice-mode", voiceHandler as any);
    };
  }, [speak, t]);

  async function send() {
    if (!input.trim()) return;
    const msg = input.trim();
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setInput("");
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 8000);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Pass 'lang' to server so it knows which language to reply in
        body: JSON.stringify({ message: msg, lang, ...(coords || {}) }),
        signal: controller.signal,
      });
      clearTimeout(id);
      const data = await res.json().catch(() => ({}));
      const reply = res.ok
        ? data.reply
        : data.error || t('common.error');
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      try {
        speak(reply);
      } catch { }
    } catch (e) {
      const reply = "Network unavailable — please try again later.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    }
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 p-4">
        <div className="text-sm font-semibold">{t('chat.title')}</div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={voiceMode}
              onChange={(e) => setVoiceMode(e.target.checked)}
            />
            {t('chat.voice_mode')}
          </label>
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
      </div>
      {voiceMode && (
        <div className="p-4">
          <div className="mb-3 text-center text-sm text-slate-600">
            {t('chat.mic_prompt')}
          </div>
          <div className="flex justify-center">
            {listening ? (
              <button
                onClick={stop}
                className="h-24 w-24 rounded-full border-4 border-rose-300 bg-rose-500 text-white shadow"
              >
                <StopCircle className="mx-auto h-10 w-10" />
              </button>
            ) : (
              <button
                onClick={start}
                className="h-24 w-24 rounded-full border-4 border-emerald-300 bg-emerald-500 text-white shadow"
              >
                <Mic className="mx-auto h-10 w-10" />
              </button>
            )}
          </div>
        </div>
      )}
      <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto p-5">
        {messages.length === 0 && !voiceMode && (
          <div className="text-sm text-slate-500">
            {t('chat.empty')}
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`${m.role === "user" ? "justify-end" : "justify-start"} flex`}
          >
            <div
              className={`${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-slate-100 text-slate-800"} max-w-[80%] rounded-lg px-4 py-2.5 text-sm`}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t border-slate-200 p-4">
        {!voiceMode && (
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chat.input')}
            className="flex-1 rounded-md border border-slate-300 px-4 py-2.5 text-sm"
          />
        )}
        {!voiceMode && messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            title={t('chat.clear')}
            className="rounded-md border border-slate-300 p-2 text-slate-700"
          >
            {t('chat.clear')}
          </button>
        )}
        {supported &&
          !voiceMode &&
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
