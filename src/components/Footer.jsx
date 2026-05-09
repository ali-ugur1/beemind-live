import { ExternalLink, Mail, Send } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useToast } from "../contexts/ToastContext";

const Footer = ({ onTabChange }) => {
  const { lang } = useLanguage();
  const toast = useToast();
  const year = new Date().getFullYear();
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const t = (tr, en) => (lang === "tr" ? tr : en);

  const handleLink = (tab) => {
    if (onTabChange) onTabChange(tab);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();

    const { name, email, subject, message } = contactForm;

    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.warning(
        t("Lütfen tüm alanları doldurun", "Please fill in all fields"),
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.warning(
        t(
          "Geçerli bir e-posta adresi girin",
          "Please enter a valid email address",
        ),
      );
      return;
    }

    const mailSubject = encodeURIComponent(subject.trim() || "BeeMora Destek");
    const mailBody = encodeURIComponent(
      `${t("Gönderen", "From")}: ${name.trim()} (${email.trim()})\n\n${message.trim()}`,
    );

    window.location.href = `mailto:beemoraproject@gmail.com?subject=${mailSubject}&body=${mailBody}`;

    toast.success(t("Mail istemcisi açılıyor...", "Opening mail client..."));
    setContactForm({ name: "", email: "", subject: "", message: "" });
    setShowContactForm(false);
  };

  const updateField = (field) => (e) =>
    setContactForm((prev) => ({ ...prev, [field]: e.target.value }));

  const quickLinks = [
    { tab: "dashboard", label: t("Dashboard", "Dashboard") },
    { tab: "reports", label: t("Raporlar", "Reports") },
    { tab: "help", label: t("Yardım", "Help") },
    { tab: "about", label: t("Hakkında", "About") },
  ];

  const inputClass =
    "px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 focus:outline-none transition-colors";

  return (
    <footer className="mt-auto border-t border-gray-800 bg-gray-950/50 px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-amber-500/20 rounded flex items-center justify-center">
                <img
                  src="/beemora-logo.svg"
                  alt="BeeMora"
                  className="w-4 h-4 object-contain"
                  style={{ filter: "brightness(1.2)" }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <span className="text-sm font-bold text-blue-400">BeeMora</span>
              <span className="text-xs text-gray-600">v2.0</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              {t(
                "AI destekli IoT arıcılık yönetim sistemi. Kovanlarınızı akıllı şekilde izleyin.",
                "AI-powered IoT beekeeping management system. Monitor your hives smartly.",
              )}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">
              {t("Hızlı Erişim", "Quick Access")}
            </h4>
            <ul className="space-y-1 text-xs text-gray-500">
              {quickLinks.map(({ tab, label }) => (
                <li key={tab}>
                  <button
                    type="button"
                    onClick={() => handleLink(tab)}
                    className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Project Info */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">
              {t("Teknik Bilgi", "Technical Info")}
            </h4>
            <ul className="space-y-1 text-xs text-gray-500">
              <li>IoT Sensör Ağı</li>
              <li>React 18 + Vite + TailwindCSS</li>
              <li>Node.js + Express + JSON</li>
            </ul>
          </div>

          {/* Contact / Support */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">
              {t("Destek", "Support")}
            </h4>
            <button
              type="button"
              onClick={() => setShowContactForm((prev) => !prev)}
              aria-expanded={showContactForm}
              aria-controls="contact-form"
              className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors mb-2"
            >
              <Mail className="w-3 h-3" />
              {t("Bize Ulaşın", "Contact Us")}
            </button>
            <a
              href="mailto:beemoraproject@gmail.com"
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors block"
            >
              beemoraproject@gmail.com
            </a>
          </div>
        </div>

        {/* Contact Form */}
        {showContactForm && (
          <div
            id="contact-form"
            className="border border-gray-800 rounded-lg p-4 mb-6 bg-gray-900/50"
          >
            <h4 className="text-sm font-semibold text-gray-300 mb-3">
              {t("Daha fazla yardıma ihtiyacınız mı var?", "Need more help?")}
            </h4>
            <form
              onSubmit={handleContactSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
              noValidate
            >
              <input
                type="text"
                name="name"
                autoComplete="name"
                placeholder={t("Adınız", "Your name")}
                value={contactForm.name}
                onChange={updateField("name")}
                maxLength={100}
                className={inputClass}
                required
              />
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder={t("E-posta", "Email")}
                value={contactForm.email}
                onChange={updateField("email")}
                maxLength={150}
                className={inputClass}
                required
              />
              <input
                type="text"
                name="subject"
                placeholder={t("Konu", "Subject")}
                value={contactForm.subject}
                onChange={updateField("subject")}
                maxLength={200}
                className={`${inputClass} md:col-span-2`}
              />
              <textarea
                name="message"
                placeholder={t("Mesajınız...", "Your message...")}
                value={contactForm.message}
                onChange={updateField("message")}
                rows={3}
                maxLength={2000}
                className={`${inputClass} resize-none md:col-span-2`}
                required
              />
              <div className="md:col-span-2 flex items-center justify-between gap-3">
                <span className="text-xs text-gray-600">
                  {contactForm.message.length} / 2000
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    {t("İptal", "Cancel")}
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold text-sm rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    {t("Gönder", "Send")}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-600">
            &copy; {year} BeeMora.{" "}
            {t("Tüm hakları saklıdır.", "All rights reserved.")}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <span
                className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"
                aria-hidden="true"
              />
              {t("Sistem Aktif", "System Active")}
            </span>
            <span>React 18 + Vite</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
