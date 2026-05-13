import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Trash2, Sparkles, Search, Copy, Check, Mic, MicOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import { searchKnowledge } from "../utils/beeSearch";
import beeKnowledge from "../data/beeKnowledge";
import { useSpeechInput } from "../hooks/useSpeechInput";

const SUGGESTED_TR = [
  "Arıcılığa nasıl başlarım?",
  "Kovan için ideal sıcaklık nedir?",
  "Varroa tedavisi nasıl yapılır?",
  "Oğul vermeyi nasıl önlerim?",
  "Bal hasadı ne zaman yapılır?",
  "BeeMora sensörü nasıl kurulur?",
];

const SUGGESTED_EN = [
  "How do I start beekeeping?",
  "What is the ideal hive temperature?",
  "How is Varroa mite treated?",
  "How do I prevent swarming?",
  "When is honey harvested?",
  "How to set up BeeMora sensor?",
];

const TR = {
  title: "Maya",
  subtitle: "Arıcılık hakkında merak ettiğiniz her şeyi sorun",
  placeholder: "Maya'ya bir şey sorun...",
  send: "Gönder",
  clear: "Temizle",
  suggestedTitle: "Sık Sorulan Sorular",
  noResults: "Bu konuda bilgi tabanımda eşleşme bulamadım. Lütfen sorunuzu farklı kelimelerle tekrar deneyin.",
  welcome: "Merhaba! Ben Maya 🐝 Arıcılık, kovan bakımı, hastalıklar, sensörler ve daha fazlası hakkında sorularınızı yanıtlayabilirim.",
  poweredBy: "BeeMora Bilgi Tabanı",
  relatedTitle: "İlgili Konular",
  copied: "Kopyalandı",
  category: {
    genel: "Genel", ekipman: "Ekipman", koloni: "Koloni",
    hastalık: "Hastalık", üretim: "Üretim", mevsimsel: "Mevsimsel",
    sensör: "Sensör", bakım: "Bakım", beemora: "BeeMora",
  },
};

const EN = {
  title: "Maya",
  subtitle: "Ask anything about beekeeping",
  placeholder: "Ask Maya anything...",
  send: "Send",
  clear: "Clear",
  suggestedTitle: "Frequently Asked Questions",
  noResults: "I couldn't find a match in my knowledge base. Please try rephrasing your question.",
  welcome: "Hello! I'm Maya 🐝 I can answer questions about beekeeping, hive care, diseases, sensors, and more.",
  poweredBy: "BeeMora Knowledge Base",
  relatedTitle: "Related Topics",
  copied: "Copied",
  category: {
    genel: "General", ekipman: "Equipment", koloni: "Colony",
    hastalık: "Disease", üretim: "Production", mevsimsel: "Seasonal",
    sensör: "Sensor", bakım: "Maintenance", beemora: "BeeMora",
  },
};

const CATEGORY_COLORS = {
  genel: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  ekipman: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  koloni: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  hastalık: "bg-red-500/10 text-red-400 border-red-500/20",
  üretim: "bg-green-500/10 text-green-400 border-green-500/20",
  mevsimsel: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  sensör: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  bakım: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  beemora: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

// Renders bold (**text**) and numbered lists within answer text
function RichText({ text }) {
  const lines = text.split("\n").filter(Boolean);
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
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
          <p key={i} className="text-sm leading-relaxed text-gray-200">
            {rendered}
          </p>
        );
      })}
    </div>
  );
}

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);
  return (
    <button
      onClick={handleCopy}
      className="p-1 text-gray-600 hover:text-gray-400 transition-colors rounded"
      title={label}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

const AIAssistantView = () => {
  const { lang } = useLanguage();
  const t = lang === "tr" ? TR : EN;
  const suggested = lang === "tr" ? SUGGESTED_TR : SUGGESTED_EN;

  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem("beemora_chat");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { isListening, error: speechError, supported: speechSupported, start: startSpeech, stop: stopSpeech } = useSpeechInput({
    onResult: (transcript) => setInput((prev) => prev ? prev + " " + transcript : transcript),
    lang,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    try {
      sessionStorage.setItem("beemora_chat", JSON.stringify(messages));
    } catch {}
  }, [messages]);

  const handleSend = useCallback(
    (text) => {
      const query = (text || input).trim();
      if (!query) return;

      setMessages((prev) => [
        ...prev,
        { role: "user", content: query, timestamp: Date.now() },
      ]);
      setInput("");
      setIsTyping(true);

      setTimeout(() => {
        const { best, related } = searchKnowledge(query, lang, beeKnowledge);

        const answer = best
          ? lang === "tr" ? best.answer_tr : best.answer_en
          : t.noResults;

        const relatedItems = best
          ? related.map((r) => ({
              question: lang === "tr" ? r.question_tr : r.question_en,
              category: r.category,
            }))
          : [];

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: answer,
            related: relatedItems,
            category: best?.category,
            timestamp: Date.now(),
          },
        ]);
        setIsTyping(false);
      }, 600 + Math.random() * 400);
    },
    [input, lang, t],
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl flex items-center justify-center">
            <Bot className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-100">{t.title}</h2>
            <p className="text-sm text-gray-500">{t.subtitle}</p>
          </div>
        </div>
        {messages.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMessages([])}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-red-400 hover:bg-red-500/10 border border-gray-700/50 hover:border-red-500/20 rounded-lg transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t.clear}
          </motion.button>
        )}
      </div>

      {/* Chat Container */}
      <div
        className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden flex flex-col"
        style={{ height: "calc(100vh - 280px)", minHeight: "500px" }}
      >
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scroll">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-amber-400" />
              </div>
              <p className="text-gray-400 text-sm max-w-md mb-8">{t.welcome}</p>
              <div className="w-full max-w-lg">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {t.suggestedTitle}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggested.map((q, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSend(q)}
                      className="text-left px-4 py-3 bg-gray-800/50 hover:bg-amber-500/10 border border-gray-700/50 hover:border-amber-500/30 rounded-xl text-sm text-gray-300 hover:text-amber-300 transition-all"
                    >
                      <Search className="w-3.5 h-3.5 inline mr-2 opacity-50" />
                      {q}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={msg.timestamp + "-" + i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-5 h-5 text-amber-400" />
                  </div>
                )}

                <div className={`max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "rounded-tr-sm bg-amber-500/20 border border-amber-500/30 text-gray-100"
                        : "rounded-tl-sm bg-gray-800/80 border border-gray-700/50"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p>{msg.content}</p>
                    ) : (
                      <RichText text={msg.content} />
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1.5 px-1">
                    {msg.category && (
                      <span
                        className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${
                          CATEGORY_COLORS[msg.category] || "bg-gray-800 text-gray-500 border-gray-700"
                        }`}
                      >
                        {t.category[msg.category] || msg.category}
                      </span>
                    )}
                    {msg.role === "assistant" && (
                      <CopyButton text={msg.content} label={t.copied} />
                    )}
                  </div>

                  {msg.related?.length > 0 && (
                    <div className="mt-2 p-3 bg-gray-800/40 border border-gray-700/30 rounded-xl w-full">
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        {t.relatedTitle}
                      </p>
                      <div className="space-y-1">
                        {msg.related.map((r, j) => (
                          <button
                            key={j}
                            onClick={() => handleSend(r.question)}
                            className="block w-full text-left text-xs text-amber-400/80 hover:text-amber-300 transition-colors py-0.5"
                          >
                            → {r.question}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center shrink-0 mt-1">
                    <User className="w-5 h-5 text-blue-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 items-start"
            >
              <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-amber-400" />
              </div>
              <div className="px-4 py-3 bg-gray-800/80 border border-gray-700/50 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-amber-400/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-amber-400/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-amber-400/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-800 p-4 bg-gray-900/80">
          <div className="flex gap-3 items-center">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? (lang === "tr" ? "🎤 Dinleniyor..." : "🎤 Listening...") : t.placeholder}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 focus:border-amber-500/50 rounded-xl text-sm text-gray-100 placeholder-gray-500 outline-none transition-colors disabled:opacity-50"
                disabled={isTyping}
              />
            </div>
            {speechSupported && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isListening ? stopSpeech : startSpeech}
                disabled={isTyping}
                className={`p-3 rounded-xl transition-colors shrink-0 ${isListening ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" : "bg-gray-700 hover:bg-gray-600 text-gray-300 disabled:opacity-50"}`}
                title={lang === "tr" ? (isListening ? "Durdur" : "Sesli gir") : (isListening ? "Stop" : "Voice input")}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="p-3 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-700 disabled:text-gray-500 text-black rounded-xl transition-colors shrink-0"
              title={t.send}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
          {speechError && (
            <p className="text-xs text-red-400 mt-1">{speechError}</p>
          )}
          <p className="text-center text-xs text-gray-600 mt-2">
            {t.poweredBy}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantView;
