import { useId } from "preact/hooks";
import { IkasImage, getDefaultSrc } from "@ikas/bp-storefront";

interface Props {
  text: string;
  /** Sikke yığını görseli (referans btn_coin_stack.png); boşsa SVG çizilir. */
  icon?: IkasImage | null;
  disabled?: boolean;
  busy?: boolean;
  className?: string;
  onClick: () => void;
}

/** Referansın ödeme butonu: masada iki yatık sikke + yaslanmış bir sikke. */
export default function CoinCheckoutButton({ text, icon, disabled, busy, className, onClick }: Props) {
  // Aynı sayfada drawer ve sepet sayfası birlikte render olur; gradyan id'leri çakışmasın.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = (name: string) => `${name}-${uid}`;
  const url = (name: string) => `url(#${id(name)})`;

  return (
    <button
      type="button"
      className={`coin-pay${className ? ` ${className}` : ""}`}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      onClick={onClick}
    >
      <span className="coin-pay__icon" aria-hidden="true">
        {icon ? (
          <img className="coin-pay__img" src={getDefaultSrc(icon)} alt="" />
        ) : (
          <svg viewBox="0 0 64 38" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id={id("face")} cx="38%" cy="32%" r="78%">
                <stop offset="0%" stop-color="#fff3c2" />
                <stop offset="22%" stop-color="#f7d97a" />
                <stop offset="55%" stop-color="#d2a443" />
                <stop offset="85%" stop-color="#8a6315" />
                <stop offset="100%" stop-color="#3a2608" />
              </radialGradient>
              <linearGradient id={id("edge")} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#e3b452" />
                <stop offset="40%" stop-color="#9d7220" />
                <stop offset="80%" stop-color="#5b3f0a" />
                <stop offset="100%" stop-color="#2a1c04" />
              </linearGradient>
              <linearGradient id={id("rim")} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#ffe9a3" />
                <stop offset="50%" stop-color="#c9962f" />
                <stop offset="100%" stop-color="#6a4708" />
              </linearGradient>
              <radialGradient id={id("side")} cx="55%" cy="40%" r="60%">
                <stop offset="0%" stop-color="#f7d97a" />
                <stop offset="70%" stop-color="#a87b22" />
                <stop offset="100%" stop-color="#3a2608" />
              </radialGradient>
              <radialGradient id={id("shadow")} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="rgba(0,0,0,0.7)" />
                <stop offset="60%" stop-color="rgba(0,0,0,0.25)" />
                <stop offset="100%" stop-color="rgba(0,0,0,0)" />
              </radialGradient>
              <radialGradient id={id("hl")} cx="40%" cy="30%" r="35%">
                <stop offset="0%" stop-color="rgba(255,250,220,0.9)" />
                <stop offset="100%" stop-color="rgba(255,250,220,0)" />
              </radialGradient>
            </defs>

            <ellipse cx="32" cy="35" rx="26" ry="2.2" fill={url("shadow")} />

            {/* Alt yatık sikke */}
            <g>
              <path d="M9 27.2 a13 3.4 0 0 0 26 0 v-2.6 a13 3.4 0 0 1 -26 0 z" fill={url("edge")} />
              <g stroke="#3a2608" stroke-width="0.18" opacity="0.55">
                {[10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32].map((x) => (
                  <line key={x} x1={x} y1="24.4" x2={x} y2="27.5" />
                ))}
              </g>
              <ellipse cx="22" cy="24.6" rx="13" ry="3.4" fill={url("side")} />
              <ellipse cx="22" cy="24.6" rx="13" ry="3.4" fill="none" stroke={url("rim")} stroke-width="0.4" />
              <ellipse cx="22" cy="24.6" rx="9.5" ry="2.4" fill="none" stroke="#5b3f0a" stroke-width="0.3" opacity="0.55" />
              <ellipse cx="20.5" cy="23.7" rx="6" ry="1" fill={url("hl")} opacity="0.6" />
            </g>

            {/* Üst yatık sikke */}
            <g className="coin-pay__top">
              <path d="M11 22 a13 3.4 0 0 0 26 0 v-2.6 a13 3.4 0 0 1 -26 0 z" fill={url("edge")} />
              <g stroke="#3a2608" stroke-width="0.18" opacity="0.55">
                {[12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34].map((x) => (
                  <line key={x} x1={x} y1="19.3" x2={x} y2="22.3" />
                ))}
              </g>
              <ellipse cx="24" cy="19.4" rx="13" ry="3.4" fill={url("side")} />
              <ellipse cx="24" cy="19.4" rx="13" ry="3.4" fill="none" stroke={url("rim")} stroke-width="0.4" />
              <ellipse cx="24" cy="19.4" rx="9.5" ry="2.4" fill="none" stroke="#5b3f0a" stroke-width="0.3" opacity="0.55" />
              <ellipse cx="22.5" cy="18.5" rx="6" ry="1" fill={url("hl")} opacity="0.6" />
            </g>

            {/* Yaslanmış sikke */}
            <g className="coin-pay__lean" transform="rotate(16 49 22)">
              <ellipse cx="49" cy="32.5" rx="8" ry="1" fill="rgba(0,0,0,0.5)" />
              <circle cx="49" cy="20" r="11.2" fill={url("rim")} />
              <circle cx="49" cy="20" r="10.2" fill={url("face")} />
              <circle cx="49" cy="20" r="7.6" fill="none" stroke="#5b3f0a" stroke-width="0.32" opacity="0.55" />
              <circle cx="49" cy="20" r="7.6" fill="none" stroke="#5b3f0a" stroke-width="0.32" stroke-dasharray="0.5 0.6" opacity="0.7" />
              <circle cx="49" cy="20" r="3.4" fill="none" stroke="#5b3f0a" stroke-width="0.32" opacity="0.6" />
              <path
                d="M49 17.6 L49.7 19.4 L51.6 19.4 L50.1 20.5 L50.7 22.3 L49 21.2 L47.3 22.3 L47.9 20.5 L46.4 19.4 L48.3 19.4 Z"
                fill="#5b3f0a"
                opacity="0.65"
              />
              <ellipse cx="45.5" cy="16" rx="3.6" ry="2" fill={url("hl")} opacity="0.85" />
            </g>
          </svg>
        )}
      </span>
      <span className="coin-pay__label">{text}</span>
    </button>
  );
}
