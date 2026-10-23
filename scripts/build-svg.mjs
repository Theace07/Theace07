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
const SANS = "'Segoe UI', -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif";

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

mkdirSync("assets", { recursive: true });

// ─────────────────── Gráfico de contribuciones ───────────────────
// 53 semanas × 7 días, como el de GitHub, pero las contribuciones dibujan
// «<SAMUEL/>». Las semanas se llenan de izquierda a derecha al cargar y
// luego un destello recorre las letras en bucle.
const GLYPHS = {
  "<": ["...#.", "..#..", ".#...", "#....", ".#...", "..#..", "...#."],
  S: [".###.", "#...#", "#....", ".###.", "....#", "#...#", ".###."],
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  M: ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
  U: ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  "/": ["....#", "....#", "...#.", "..#..", ".#...", "#....", "#...."],
  ">": [".#...", "..#..", "...#.", "....#", "...#.", "..#..", ".#..."],
};
const WORD = "<SAMUEL/>"; // 9 glifos × 5 + 8 huecos = 53 columnas: un año justo
const COLS = 53;
const ROWS = 7;

// Mapa de celdas: 0 = vacía, "name" = letra, "tag" = < / >.
const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
[...WORD].forEach((char, i) => {
  GLYPHS[char].forEach((row, r) => {
    [...row].forEach((bit, c) => {
      if (bit === "#") grid[r][i * 6 + c] = "<>/".includes(char) ? "tag" : "name";
    });
  });
});

// Ruido de fondo determinista (siempre el mismo SVG para el mismo código).
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

// Fuera del nombre solo hay tonos verdeazulados apagados, para que las letras
// (violeta y aqua brillantes) se lean sin esfuerzo.
const LEVELS = ["#141d20", "#17302f", "#1c4442", "#235855"]; // menos → más
const CELL = 12;
const PITCH = 15;
const GX = 64; // margen izquierdo para los días
const GY = 104; // arriba: nombre y meses
const graphW = COLS * PITCH - (PITCH - CELL);
const HERO_W = GX + graphW + 40;
const HERO_H = GY + ROWS * PITCH + 66;

let cells = "";
for (let c = 0; c < COLS; c++) {
  for (let r = 0; r < ROWS; r++) {
    const kind = grid[r][c];
    const x = GX + c * PITCH;
    const y = GY + r * PITCH;
    // Al cargar, cada semana llega un poco después que la anterior.
    const enter = 250 + c * 32 + r * 14;
    if (kind) {
      const glint = 3200 + c * 38;
      cells += `<rect class="${kind}" x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2.5" style="animation-delay:${enter}ms,${glint}ms"/>`;
    } else {
      const roll = rand();
      const level = roll < 0.7 ? 0 : roll < 0.9 ? 1 : roll < 0.98 ? 2 : 3;
      cells += `<rect class="bg" fill="${LEVELS[level]}" x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2.5" style="animation-delay:${enter}ms"/>`;
    }
  }
}

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const months = MONTHS.map(
  (m, i) => `<text x="${GX + Math.round(i * 4.42) * PITCH}" y="${GY - 10}" class="lbl">${m}</text>`,
).join("");
const days = [
  ["Lun", 1],
  ["Mié", 3],
  ["Vie", 5],
]
  .map(([d, r]) => `<text x="${GX - 12}" y="${GY + r * PITCH + 10}" class="lbl" text-anchor="end">${d}</text>`)
  .join("");

const legendX = GX + graphW - 5 * PITCH - 34;
const legendY = GY + ROWS * PITCH + 18;
const legend = [...LEVELS, C.accent]
  .map((fill, i) => `<rect x="${legendX + i * PITCH}" y="${legendY}" width="${CELL}" height="${CELL}" rx="2.5" fill="${fill}"/>`)
  .join("");

const hero = `<svg xmlns="http://www.w3.org/2000/svg" width="${HERO_W}" height="${HERO_H}" viewBox="0 0 ${HERO_W} ${HERO_H}" role="img" aria-label="Gráfico de contribuciones que dibuja &lt;SAMUEL/&gt; — Samuel Felipe Quiroz Piñeros, Front-End Developer">
  <style>
    .lbl { font: 11px ${MONO}; fill: ${C.muted}; }
    .bg, .name, .tag { transform-box: fill-box; transform-origin: center; }
    .bg { animation: on .5s cubic-bezier(.16,1,.3,1) backwards; }
    .name { fill: ${C.accent}; animation: on .5s cubic-bezier(.16,1,.3,1) backwards, glint-name 6s ease-in-out infinite; }
    .tag { fill: ${C.aqua}; animation: on .5s cubic-bezier(.16,1,.3,1) backwards, glint-tag 6s ease-in-out infinite; }
    @keyframes on { from { fill: ${LEVELS[0]}; transform: scale(.3); } }
    @keyframes glint-name { 0%, 14%, 100% { fill: ${C.accent}; } 5% { fill: #efe6ff; } }
    @keyframes glint-tag { 0%, 14%, 100% { fill: ${C.aqua}; } 5% { fill: #e2fffb; } }
    @media (prefers-reduced-motion: reduce) { .bg, .name, .tag { animation: none; } }
  </style>
  <rect x=".5" y=".5" width="${HERO_W - 1}" height="${HERO_H - 1}" rx="14" fill="${C.bg}" stroke="${C.line}"/>

  <text x="${GX}" y="44" fill="${C.fg}" font-family="${SANS}" font-size="24" font-weight="700" letter-spacing="-.5">Samuel Felipe Quiroz Piñeros</text>
  <text x="${GX + graphW}" y="44" fill="${C.accent}" font-family="${MONO}" font-size="12" letter-spacing="1.6" text-anchor="end">FRONT-END DEVELOPER · ZIPAQUIRÁ, CO</text>
  <text x="${GX}" y="66" class="lbl" style="font-size:12px">2+ años de commits convertidos en interfaces rápidas, accesibles y con detalle</text>

  ${months}
  ${days}
  ${cells}

  <text x="${GX}" y="${legendY + 10}" class="lbl">React · Next.js · TypeScript · Tailwind CSS</text>
  <text x="${legendX - 8}" y="${legendY + 10}" class="lbl" text-anchor="end">Menos</text>
  ${legend}
  <text x="${legendX + 5 * PITCH + 3}" y="${legendY + 10}" class="lbl">Más</text>
</svg>
`;
writeFileSync("assets/hero.svg", hero);

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

console.log("assets/hero.svg y assets/terminal.svg generados");
