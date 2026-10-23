// Genera los SVG animados del perfil: `node scripts/build-svg.mjs`.
// Solo SMIL y CSS dentro del SVG, porque GitHub los muestra como <img>
// y ahí no corre JavaScript.
import { mkdirSync, writeFileSync } from "node:fs";

const C = {
  bg: "#0b1416",
  surface: "#121e21",
  line: "#22343a",
  fg: "#e9f1f1",
  muted: "#86999c",
  accent: "#a97bff",
  aqua: "#5fd3c4",
};
const MONO = "ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', monospace";
const SERIF = "'Iowan Old Style', 'Palatino Linotype', Georgia, serif";

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

mkdirSync("assets", { recursive: true });

// ───────────────────────── Banner ─────────────────────────
const banner = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="320" viewBox="0 0 1200 320" role="img" aria-label="Samuel Felipe Quiroz Piñeros — Front-End Developer">
  <defs>
    <radialGradient id="a" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${C.accent}" stop-opacity=".45"/>
      <stop offset="1" stop-color="${C.accent}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="b" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${C.aqua}" stop-opacity=".28"/>
      <stop offset="1" stop-color="${C.aqua}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grain" width="3" height="3" patternUnits="userSpaceOnUse">
      <circle cx="1.5" cy="1.5" r=".5" fill="#fff" fill-opacity=".05"/>
    </pattern>
    <linearGradient id="rule" gradientUnits="userSpaceOnUse" x1="70" y1="0" x2="1130" y2="0">
      <stop offset="0" stop-color="${C.aqua}"/>
      <stop offset="1" stop-color="${C.accent}"/>
    </linearGradient>
    <clipPath id="frame"><rect width="1200" height="320" rx="14"/></clipPath>
  </defs>
  <style>
    .rise { opacity: 0; animation: rise 1s cubic-bezier(.16,1,.3,1) forwards; }
    .d1 { animation-delay: .15s } .d2 { animation-delay: .35s } .d3 { animation-delay: .9s }
    @keyframes rise { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: none } }
    .draw { stroke-dasharray: 1060; stroke-dashoffset: 1060; animation: draw 1.6s cubic-bezier(.77,0,.18,1) .6s forwards; }
    @keyframes draw { to { stroke-dashoffset: 0 } }
    .caret { animation: blink 1.1s steps(1) infinite; }
    @keyframes blink { 50% { opacity: 0 } }
    @media (prefers-reduced-motion: reduce) { .rise, .draw { animation: none; opacity: 1; stroke-dashoffset: 0 } }
  </style>
  <g clip-path="url(#frame)">
    <rect width="1200" height="320" fill="${C.bg}"/>
    <circle cx="180" cy="40" r="300" fill="url(#a)">
      <animateTransform attributeName="transform" type="translate" values="0 0; 120 60; -40 110; 0 0" dur="22s" repeatCount="indefinite"/>
    </circle>
    <circle cx="1080" cy="300" r="320" fill="url(#b)">
      <animateTransform attributeName="transform" type="translate" values="0 0; -140 -50; 60 -100; 0 0" dur="28s" repeatCount="indefinite"/>
    </circle>
    <rect width="1200" height="320" fill="url(#grain)"/>
    <rect x=".5" y=".5" width="1199" height="319" rx="14" fill="none" stroke="${C.line}"/>

    <g class="rise d1">
      <line x1="70" y1="96" x2="110" y2="96" stroke="${C.accent}"/>
      <text x="126" y="101" fill="${C.accent}" font-family="${MONO}" font-size="14" letter-spacing="2.4">FRONT-END DEVELOPER · ZIPAQUIRÁ, COLOMBIA</text>
      <rect class="caret" x="548" y="88" width="8" height="16" fill="${C.accent}"/>
    </g>
    <text class="rise d2" x="66" y="190" fill="${C.fg}" font-family="${SERIF}" font-size="74" letter-spacing="-1.5">Samuel Felipe Quiroz <tspan fill="${C.accent}" font-style="italic">Piñeros</tspan></text>
    <path class="draw" d="M70 228 H1130" stroke="url(#rule)" stroke-width="2" fill="none"/>
    <text class="rise d3" x="70" y="268" fill="${C.muted}" font-family="${MONO}" font-size="15" letter-spacing="1">
      <tspan fill="${C.aqua}">§</tspan> interfaces rápidas, accesibles y con detalle — React · Next.js · TypeScript · Tailwind
    </text>
  </g>
</svg>
`;
writeFileSync("assets/banner.svg", banner);

// ───────────────────────── Terminal ─────────────────────────
// Cada línea se «teclea» destapando un carácter cada `TYPE` segundos.
const CHAR = 9.05; // ancho aproximado de un carácter monoespaciado a 15px
const TYPE = 0.045;
const lines = [
  { prompt: true, text: "whoami" },
  { text: "Samuel Quiroz — Front-End Developer Jr · Colombia · remoto", color: C.fg },
  { prompt: true, text: "cat stack.txt" },
  { text: "react  next.js  typescript  tailwind  mongodb  firebase  jest", color: C.aqua },
  { prompt: true, text: "ls experiencia/" },
  { text: "2026_av3x/  2025_freelance-colombia/  2025_freelance-argentina/", color: C.accent },
  { text: "2024_coder-house/", color: C.accent },
  { prompt: true, text: "echo $STATUS" },
  { text: "✔ abierto a nuevos proyectos y oportunidades", color: C.fg },
];

const PROMPT = "samuel@portfolio:~$ ";
const W = 760;
const top = 64;
const lh = 26;
let t = 0.6;
let body = "";
let clips = "";

lines.forEach((line, i) => {
  const y = top + i * lh;
  const prefix = line.prompt ? PROMPT : "";
  const full = prefix + line.text;
  const typed = line.prompt ? line.text.length : 0;
  // Los comandos se teclean; las respuestas aparecen de golpe, como en una terminal.
  const start = t;
  const dur = line.prompt ? typed * TYPE : 0.01;
  const startW = prefix.length * CHAR;
  const endW = full.length * CHAR + 20;
  const values = line.prompt
    ? Array.from({ length: typed + 1 }, (_, k) => (startW + k * CHAR).toFixed(1)).join(";")
    : `0;${endW}`;
  clips += `<clipPath id="l${i}"><rect x="24" y="${y - 18}" height="${lh}" width="0">
      <animate attributeName="width" begin="${start.toFixed(2)}s" dur="${dur.toFixed(2)}s" values="${values}" calcMode="discrete" fill="freeze"/>
      <set attributeName="width" begin="${(start + dur).toFixed(2)}s" to="${endW}"/>
    </rect></clipPath>\n`;
  const content = line.prompt
    ? `<tspan fill="${C.aqua}">samuel@portfolio</tspan><tspan fill="${C.muted}">:</tspan><tspan fill="${C.accent}">~</tspan><tspan fill="${C.muted}">$ </tspan><tspan fill="${C.fg}">${esc(line.text)}</tspan>`
    : `<tspan fill="${line.color}">${esc(line.text)}</tspan>`;
  body += `<text x="28" y="${y}" clip-path="url(#l${i})" xml:space="preserve">${content}</text>\n`;
  t = start + dur + (line.prompt ? 0.35 : 0.12);
});

const lastY = top + lines.length * lh;
const H = lastY + 34;
const terminal = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Terminal: Samuel Quiroz, Front-End Developer. Stack: React, Next.js, TypeScript, Tailwind. Abierto a nuevos proyectos.">
  <defs>
${clips}  </defs>
  <style>
    text { font-family: ${MONO}; font-size: 15px; }
    .caret { opacity: 0; animation: blink 1.1s steps(1) ${t.toFixed(2)}s infinite; }
    @keyframes blink { 0% { opacity: 1 } 50% { opacity: 0 } }
  </style>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="12" fill="${C.bg}" stroke="${C.line}"/>
  <path d="M.5 12.5a12 12 0 0 1 12-12h${W - 25}a12 12 0 0 1 12 12V34H.5z" fill="${C.surface}"/>
  <line x1="0" y1="34" x2="${W}" y2="34" stroke="${C.line}"/>
  <circle cx="22" cy="17" r="5.5" fill="#ff5f57"/><circle cx="40" cy="17" r="5.5" fill="#febc2e"/><circle cx="58" cy="17" r="5.5" fill="#28c840"/>
  <text x="${W / 2}" y="22" fill="${C.muted}" text-anchor="middle" style="font-size:12px;letter-spacing:1px">~/theace07 — zsh</text>
${body}  <g opacity="0">
    <set attributeName="opacity" to="1" begin="${t.toFixed(2)}s" fill="freeze"/>
    <text x="28" y="${lastY}" xml:space="preserve"><tspan fill="${C.aqua}">samuel@portfolio</tspan><tspan fill="${C.muted}">:</tspan><tspan fill="${C.accent}">~</tspan><tspan fill="${C.muted}">$ </tspan></text>
    <rect class="caret" x="${28 + PROMPT.length * CHAR}" y="${lastY - 14}" width="9" height="18" fill="${C.accent}"/>
  </g>
</svg>
`;
writeFileSync("assets/terminal.svg", terminal);

console.log("assets/banner.svg y assets/terminal.svg generados");
