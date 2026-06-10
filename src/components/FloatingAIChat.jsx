import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, X, Send, Trash2, ChevronDown, Mic, MicOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { searchKnowledge } from "../utils/beeSearch";
import beeKnowledge from "../data/beeKnowledge";
import { useSpeechInput } from "../hooks/useSpeechInput";
import { generateMayaResponse } from "../utils/mayaChat";

const SUGGESTED = [
  "Arıcılığa nasıl başlarım?",
  "Varroa tedavisi nasıl yapılır?",
  "BeeMora sensörü ne işe yarar?",
  "Bal hasadı ne zaman yapılır?",
];

const WELCOME =
  "Merhaba! Ben Maya 🐝 Arıcılık, kovan bakımı, hastalıklar veya BeeMora hakkında sorularınızı yanıtlayabilirim.";

const NO_RESULT = null;

// Simple bold/list renderer for answer text
function RichText({ text }) {
  const lines = text.split("\n").filter(Boolean);
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        // Bold (**text**)
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        const rendered = parts.map((part, j) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={j} className="text-amber-300 font-semibold">
              {part.slice(2, -2)}
            </strong>
          ) : (
            part
          )
        );
        return (
          <p key={i} className="text-sm leading-relaxed">
            {rendered}
          </p>
        );
      })}
    </div>
  );
}

export default function FloatingAIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: WELCOME, id: 0, plain: true },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const { isListening, supported: speechSupported, start: startSpeech, stop: stopSpeech } = useSpeechInput({
    onResult: (transcript) => setInput((prev) => prev ? prev + " " + transcript : transcript),
    lang: "tr",
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  const send = useCallback(
    (text) => {
      const q = (text || input).trim();
      if (!q) return;
      setInput("");

      setMessages((prev) => [
        ...prev,
        { role: "user", text: q, id: Date.now() },
      ]);
      setTyping(true);

      setTimeout(() => {
        const { best } = searchKnowledge(q, "tr", beeKnowledge);
        const answer = best
          ? best.answer_tr
          : generateMayaResponse(q, "tr").text;
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: answer, id: Date.now() + 1 },
        ]);
        setTyping(false);
        if (!open) setUnread((n) => n + 1);
      }, 500 + Math.random() * 400);
    },
    [input, open],
  );

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const clear = () =>
    setMessages([{ role: "bot", text: WELCOME, id: 0, plain: true }]);

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-amber-500 hover:bg-amber-600 rounded-full flex items-center justify-center shadow-xl shadow-amber-500/40 transition-colors"
            aria-label="Maya"
          >
            <Bot className="w-7 h-7 text-black" />
            {unread > 0 ? (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {unread}
              </span>
            ) : (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full flex items-center justify-center">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping absolute" />
                <span className="w-2 h-2 bg-emerald-500 rounded-full relative" />
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-6 right-6 z-50 w-[370px] max-w-[calc(100vw-24px)] bg-gray-900 border border-gray-700/60 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden"
            style={{ height: "540px" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/10 border-b border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-amber-500/20 border border-amber-500/30 rounded-xl flex items-center justify-center">
                  <Bot className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-100 leading-none mb-0.5">
                    Maya
                  </p>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-pulse" />
                    Çevrimiçi · BeeMora
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 1 && (
                  <button
                    onClick={clear}
                    className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg transition-colors"
                    title="Sohbeti temizle"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 text-gray-500 hover:text-gray-200 rounded-lg transition-colors"
                  aria-label="Kapat"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scroll">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "bot" && (
                      <div className="w-7 h-7 bg-amber-500/20 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-4 h-4 text-amber-400" />
                      </div>
                    )}
                    <div
                      className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "rounded-tr-sm bg-amber-500/20 border border-amber-500/30 text-gray-100"
                          : "rounded-tl-sm bg-gray-800 border border-gray-700/40 text-gray-200"
                      }`}
                    >
                      {msg.plain ? (
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                      ) : (
                        <RichText text={msg.text} />
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing */}
              {typing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2 items-center"
                >
                  <div className="w-7 h-7 bg-amber-500/20 rounded-lg flex items-center justify-center">
                    <Bot className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="px-3.5 py-2.5 bg-gray-800 border border-gray-700/40 rounded-2xl rounded-tl-sm flex gap-1.5">
                    <span className="w-1.5 h-1.5 bg-amber-400/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-amber-400/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-amber-400/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </motion.div>
              )}

              {/* Suggested questions */}
              {messages.length === 1 && !typing && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-1"
                >
                  <p className="text-[10px] text-gray-500 mb-2 font-semibold uppercase tracking-wider">
                    Örnek sorular
                  </p>
                  <div className="space-y-1.5">
                    {SUGGESTED.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => send(q)}
                        className="w-full text-left text-xs px-3 py-2 bg-gray-800/60 hover:bg-amber-500/10 border border-gray-700/50 hover:border-amber-500/30 rounded-xl text-gray-300 hover:text-amber-300 transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-800 p-3 flex gap-2 bg-gray-900/80">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={isListening ? "🎤 Dinleniyor..." : "Sorunuzu yazın..."}
                disabled={typing}
                className="flex-1 px-3.5 py-2.5 bg-gray-800 border border-gray-700 focus:border-amber-500/50 rounded-xl text-sm text-gray-100 placeholder-gray-500 outline-none transition-colors disabled:opacity-50"
              />
              {speechSupported && (
                <button
                  onClick={isListening ? stopSpeech : startSpeech}
                  disabled={typing}
                  className={`p-2.5 rounded-xl transition-colors shrink-0 ${isListening ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" : "bg-gray-700 hover:bg-gray-600 text-gray-300 disabled:opacity-50"}`}
                  title={isListening ? "Durdur" : "Sesli gir"}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}
              <button
                onClick={() => send()}
                disabled={!input.trim() || typing}
                className="p-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-700 disabled:text-gray-500 text-black rounded-xl transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
