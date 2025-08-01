import React from 'react';
import { useLanguage } from './LanguageContext';
import { translations } from '../data/i18n';

const Footer: React.FC = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  
  return (
    <div
      className="
        border-t border-pink-200/50 dark:border-gray-700/50 
        py-6 
        transition-colors duration-300 
        backdrop-blur-sm
        bg-gradient-to-br 
        from-pink-100 via-purple-50 to-indigo-100 
        dark:from-gray-950 dark:via-gray-900 dark:to-gray-950
      "
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center space-x-3">

          {/* Email */}
          <a
            href="mailto:admin@lunastream.watch"
            className="bg-[#EA4335] hover:bg-[#D33B2C] text-white p-3 rounded-lg shadow-md transition-all duration-200 transform hover:-translate-y-0.5 group"
            title={t.footer_email_us}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="currentColor"
              className="bi bi-envelope"
              viewBox="0 0 16 16"
            >
              <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z" />
            </svg>
          </a>

          {/* Discord */}
          <a
            href="https://discord.gg/8ubGetGGge"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#5865F2] hover:bg-[#4752C4] text-white p-3 rounded-lg shadow-md transition-all duration-200 transform hover:-translate-y-0.5 group"
            title={t.footer_join_discord}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="currentColor"
              className="bi bi-discord"
              viewBox="0 0 16 16"
            >
              <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612" />
            </svg>
          </a>

          {/* TikTok */}
          <a
            href="https://tiktok.com/@lunastream.watch"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-900 hover:bg-gray-800 text-white p-3 rounded-lg shadow-md transition-all duration-200 transform hover:-translate-y-0.5 group"
            title={t.footer_follow_tiktok}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
            >
              <defs>
                <linearGradient
                  id="tiktok-gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#FF0050" />
                  <stop offset="50%" stopColor="#FF0050" />
                  <stop offset="100%" stopColor="#00F2EA" />
                </linearGradient>
              </defs>
              <path
                fill="url(#tiktok-gradient)"
                d="M19.321 5.562a5.124 5.124 0 0 1-.443-.258 6.228 6.228 0 0 1-1.137-.966c-.849-.849-1.204-1.864-1.204-2.338h-3.861v14.447c0 .706-.287 1.347-.751 1.81a2.57 2.57 0 0 1-1.81.751c-1.421 0-2.571-1.15-2.571-2.571 0-.706.287-1.347.751-1.81a2.57 2.57 0 0 1 1.81-.751c.283 0 .555.046.81.131V10.14a6.571 6.571 0 0 0-.81-.051c-3.632 0-6.571 2.939-6.571 6.571s2.939 6.571 6.571 6.571 6.571-2.939 6.571-6.571V9.282a9.642 9.642 0 0 0 5.645 1.806V7.227a5.86 5.86 0 0 1-2.001-.665z"
              />
            </svg>
          </a>

          {/* Twitter */}
          <a
            href="https://x.com/Lunastreamwatch"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#1DA1F2] hover:bg-[#1A91DA] text-white p-3 rounded-lg shadow-md transition-all duration-200 transform hover:-translate-y-0.5 group"
            title={t.footer_follow_twitter}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="currentColor"
              className="bi bi-twitter"
              viewBox="0 0 16 16"
            >
              <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334q.002-.211-.006-.422A6.7 6.7 0 0 0 16 3.542a6.7 6.7 0 0 1-1.889.518 3.3 3.3 0 0 0 1.447-1.817 6.5 6.5 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.32 9.32 0 0 1-6.767-3.429 3.29 3.29 0 0 0 1.018 4.382A3.3 3.3 0 0 1 .64 6.575v.045a3.29 3.29 0 0 0 2.632 3.218 3.2 3.2 0 0 1-.865.115 3 3 0 0 1-.614-.057 3.28 3.28 0 0 0 3.067 2.277A6.6 6.6 0 0 1 .78 13.58a6 6 0 0 1-.78-.045A9.34 9.34 0 0 0 5.026 15" />
            </svg>
          </a>

          {/* Telegram */}
          <a
            href="https://t.me/lunastreaming"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#0088CC] hover:bg-[#006699] text-white p-3 rounded-lg shadow-md transition-all duration-200 transform hover:-translate-y-0.5 group"
            title={t.footer_join_telegram}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
          </a>

        </div>
      </div>
    </div>
  );
};

export default Footer;
