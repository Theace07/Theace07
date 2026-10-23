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

// ─────────────────── Pantalla de título pixel art ───────────────────
// Un «juego indie» en SVG: el personaje corre por un mundo con parallax,
// recoge gemas (+XP) y el HUD muestra nivel y experiencia. Todo se dibuja
// con rectángulos sobre una rejilla, sin imágenes externas.
const FONT = {
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  B: ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
  C: [".###.", "#...#", "#....", "#....", "#....", "#...#", ".###."],
  D: ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  F: ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
  G: [".###.", "#...#", "#....", "#.###", "#...#", "#...#", ".####"],
  H: ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  I: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "#####"],
  J: ["..###", "...#.", "...#.", "...#.", "#..#.", "#..#.", ".##.."],
  K: ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
  L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  M: ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
  N: ["#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#", "#...#"],
  O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  P: ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
  Q: [".###.", "#...#", "#...#", "#...#", "#.#.#", "#..#.", ".##.#"],
  R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  S: [".###.", "#...#", "#....", ".###.", "....#", "#...#", ".###."],
  T: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  U: ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  V: ["#...#", "#...#", "#...#", "#...#", "#...#", ".#.#.", "..#.."],
  W: ["#...#", "#...#", "#...#", "#.#.#", "#.#.#", "##.##", "#...#"],
  X: ["#...#", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "#...#"],
  Y: ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
  Z: ["#####", "....#", "...#.", "..#..", ".#...", "#....", "#####"],
  0: [".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."],
  1: ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
  2: [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
  3: ["#####", "...#.", "..#..", "...#.", "....#", "#...#", ".###."],
  4: ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
  5: ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
  6: ["..##.", ".#...", "#....", "####.", "#...#", "#...#", ".###."],
  7: ["#####", "....#", "...#.", "..#..", ".#...", ".#...", ".#..."],
  8: [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
  9: [".###.", "#...#", "#...#", ".####", "....#", "...#.", ".##.."],
  "/": ["....#", "....#", "...#.", "..#..", ".#...", "#....", "#...."],
  "+": [".....", "..#..", "..#..", "#####", "..#..", "..#..", "....."],
  "-": [".....", ".....", ".....", "#####", ".....", ".....", "....."],
  ">": ["#....", "##...", "###..", "####.", "###..", "##...", "#...."],
  ".": [".....", ".....", ".....", ".....", ".....", ".....", "..#.."],
  " ": [".....", ".....", ".....", ".....", ".....", ".....", "....."],
};

const cell = (x, y, w, h = w) => `M${x} ${y}h${w}v${h}h-${w}z`;
const textWidth = (text, s) => text.length * 6 * s - s;
function pixelText(text, x, y, s) {
  let d = "";
  [...text].forEach((char, i) => {
    (FONT[char] ?? FONT[" "]).forEach((row, r) => {
      [...row].forEach((bit, c) => {
        if (bit === "#") d += cell(x + i * 6 * s + c * s, y + r * s, s);
      });
    });
  });
  return d;
}

/** Sprite a partir de filas de caracteres: un <path> por color. */
function sprite(rows, palette, x, y, s) {
  const byColor = {};
  rows.forEach((row, r) => {
    [...row].forEach((key, c) => {
      if (palette[key]) byColor[palette[key]] = (byColor[palette[key]] ?? "") + cell(x + c * s, y + r * s, s);
    });
  });
  return Object.entries(byColor)
    .map(([fill, d]) => `<path fill="${fill}" d="${d}"/>`)
    .join("");
}

let pseed = 11;
const prand = () => ((pseed = (pseed * 16807) % 2147483647) / 2147483647);

const GW = 960;
const GH = 300;
const P = 4; // tamaño del «píxel» del mundo
const GROUND = 252;
const SPEED = 200; // px/s del suelo; el resto de capas va más lento

/** Cordillera periódica (se repite sin costura cada GW px), escalonada a P. */
function ridge(mid, amp1, k1, amp2, k2, phase) {
  let d = "";
  for (let x = 0; x < GW; x += P) {
    const t = (x / GW) * Math.PI * 2;
    const h = mid + amp1 * Math.sin(k1 * t + phase) + amp2 * Math.sin(k2 * t + phase * 2.3);
    const top = GROUND - Math.round(h / P) * P;
    d += `M${x} ${top}h${P}V${GROUND}h-${P}z`;
  }
  return d;
}

/** Una capa que se desplaza en bucle: dos copias seguidas, desplazadas -GW. */
const layer = (inner, seconds) =>
  `<g class="scroll" style="animation-duration:${seconds}s">${inner}<g transform="translate(${GW} 0)">${inner}</g></g>`;

// Cielo por bandas, como en los juegos de 16 bits.
const SKY = ["#081014", "#0a1418", "#0c181d", "#0f1e24", "#122429"];
const sky = SKY.map((fill, i) => `<rect x="0" y="${i * 52}" width="${GW}" height="52" fill="${fill}"/>`).join("");

let stars = "";
for (let i = 0; i < 46; i++) {
  const x = Math.round((prand() * GW) / P) * P;
  const y = Math.round((prand() * 150) / P) * P + 8;
  const size = prand() < 0.2 ? 4 : 2;
  const twinkle = prand() < 0.45;
  stars += `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${prand() < 0.3 ? "#c9b6f2" : "#dce8e8"}"${
    twinkle ? ` class="tw" style="animation-delay:${(prand() * 3).toFixed(2)}s"` : ` opacity=".7"`
  }/>`;
}

// Luna pixelada con cráteres y halo.
let moonD = "";
let craterD = "";
let haloD = "";
const MX = 856;
const MY = 118;
for (let gy = -11; gy <= 11; gy++) {
  for (let gx = -11; gx <= 11; gx++) {
    const r = Math.hypot(gx, gy);
    const x = MX + gx * P;
    const y = MY + gy * P;
    if (r <= 7) {
      const crater = (gx === -2 && gy === -2) || (gx === 3 && gy === 1) || (gx === -3 && gy === 3) || (gx === 2 && gy === -4) || (gx === 4 && gy === 2);
      if (crater) craterD += cell(x, y, P);
      else moonD += cell(x, y, P);
    } else if (r <= 10.5) haloD += cell(x, y, P);
  }
}
const moon = `<path d="${haloD}" fill="#a97bff" opacity=".12"/><path d="${moonD}" fill="#ece4ff"/><path d="${craterD}" fill="#c7b6f4"/>`;

// Capas del mundo.
const farMountains = `<path d="${ridge(92, 28, 2, 14, 5, 0.7)}" fill="#142c35"/>`;
const hills = `<path d="${ridge(44, 14, 3, 8, 7, 2.1)}" fill="#183a40"/>`;

let city = "";
let windows = { "#5fd3c4": "", "#a97bff": "", "#e0b860": "" };
for (let x = 8; x < GW - 40; ) {
  const w = (6 + Math.floor(prand() * 8)) * P;
  const h = (10 + Math.floor(prand() * 18)) * P;
  const top = GROUND - h;
  city += cell(x, top, w, h);
  for (let wy = top + 8; wy < GROUND - 8; wy += 12) {
    for (let wx = x + 6; wx < x + w - 6; wx += 10) {
      if (prand() < 0.22) {
        const roll = prand();
        const key = roll < 0.5 ? "#5fd3c4" : roll < 0.85 ? "#a97bff" : "#e0b860";
        windows[key] += cell(wx, wy, P);
      }
    }
  }
  x += w + (1 + Math.floor(prand() * 4)) * P;
}
const cityLayer =
  `<path d="${city}" fill="#0c181c"/>` +
  Object.entries(windows)
    .map(([fill, d]) => `<path d="${d}" fill="${fill}" opacity=".75"/>`)
    .join("");

// Suelo: bloques que se repiten cada 32 px y una línea de luz aqua.
let groundTop = "";
let groundBricks = "";
for (let x = 0; x < GW + 32; x += 32) {
  groundTop += cell(x, GROUND, 24, P);
  groundBricks += cell(x + 4, GROUND + 14, 12, P) + cell(x + 20, GROUND + 28, 12, P);
}
const ground =
  `<rect x="0" y="${GROUND}" width="${GW}" height="${GH - GROUND}" fill="#0f1f23"/>` +
  `<g class="scroll" style="animation-duration:${(32 / SPEED).toFixed(2)}s;--loop:-32px">` +
  `<path d="${groundTop}" fill="#3aa597"/><path d="${groundBricks}" fill="#16302f"/></g>`;

// Personaje: traje oscuro, camisa blanca y corbata violeta, como en la foto.
const HERO_PAL = {
  H: "#2a1d16", S: "#e2a57c", s: "#b9785a", E: "#1a1012", W: "#f1f4f4",
  B: "#232b4d", b: "#34406e", R: "#a97bff", P: "#151a26", K: "#07080c",
};
const heroBody = [
  "...HHHH...",
  "..HHHHHH..",
  ".HHHHHHHH.",
  ".HHSSSSHH.",
  ".HSSESSEH.",
  ".HSSSSSSs.",
  "..SSssSS..",
  "...SSSS...",
  "..BBWRBB..",
  ".BBBWRBBB.",
  "BbBBWRBBbB",
  "SbBBWWBBbS",
  "..BBBBBB..",
  "..PPPPPP..",
];
const legsA = ["..PP..PP..", ".PP....PP.", ".KK....KK."];
const legsB = ["...PPPP...", "...PP.PP..", "...KK.KK.."];
const HX = 168;
const HP = 5; // el personaje, un poco más grande que el mundo
const heroH = (heroBody.length + 3) * HP;
const hero =
  `<path d="${cell(HX + 5, GROUND - 2, 40, 4)}" fill="#000" opacity=".35"/>` +
  `<g class="fA">${sprite([...heroBody, ...legsA], HERO_PAL, HX, GROUND - heroH, HP)}</g>` +
  `<g class="fB">${sprite([...heroBody, ...legsB], HERO_PAL, HX, GROUND - heroH - HP, HP)}</g>`;

// Gemas (commits) que llegan al personaje y se convierten en +XP.
const GEM_PAL = { o: "#6d3bd6", y: "#a97bff", w: "#ffffff", l: "#c9b6f2" };
const gemRows = ["..ooo..", ".olyyo.", "olwyyyo", "olyyyyo", "oyyyyyo", ".oyyyo.", "..ooo.."];
const COIN_T = 4; // segundos que tarda cada gema en llegar y repetirse
const gemY = GROUND - 74;
let gems = "";
let pops = "";
[0, 1, 2].forEach((i) => {
  const delay = `-${((COIN_T / 3) * i).toFixed(2)}s`;
  gems += `<g class="gem" style="animation-delay:${delay}"><g class="bob" style="animation-delay:${delay}">${sprite(gemRows, GEM_PAL, HX + 12, gemY, 4)}</g></g>`;
  pops += `<path class="pop" style="animation-delay:${delay}" d="${pixelText("+XP", HX + 4, GROUND - heroH - 24, 2)}" fill="#5fd3c4"/>`;
});

// HUD y título.
const TITLE = "SAMUEL QUIROZ";
const TS = 6;
const tx = (GW - textWidth(TITLE, TS)) / 2;
const SUB = "FRONT-END DEVELOPER";
const SS = 3;
const sx = (GW - textWidth(SUB, SS)) / 2;
const START = "> PULSA START";
const PS = 2;
const px0 = (GW - textWidth(START, PS)) / 2;
const place = "ZIPAQUIRA CO";

const hud =
  `<path d="${pixelText("LVL 2", 24, 20, 2)}" fill="#e9f1f1"/>` +
  `<path d="${pixelText("XP", 24, 40, 2)}" fill="#5fd3c4"/>` +
  `<rect x="52" y="40" width="124" height="14" fill="#0b1416" stroke="#5fd3c4" stroke-width="2"/>` +
  `<rect class="xp" x="56" y="44" width="116" height="6" fill="#5fd3c4"/>` +
  `<path d="${pixelText(place, GW - 24 - textWidth(place, 2), 20, 2)}" fill="#e9f1f1"/>` +
  `<path d="${pixelText("REMOTO", GW - 24 - textWidth("REMOTO", 2), 40, 2)}" fill="#a97bff"/>`;

const title =
  `<path d="${pixelText(TITLE, tx + TS, 66 + TS, TS)}" fill="#6d3bd6"/>` +
  `<path d="${pixelText(TITLE, tx, 66, TS)}" fill="#f4f0ff"/>` +
  `<path d="${pixelText(SUB, sx, 124, SS)}" fill="#5fd3c4"/>` +
  `<path class="blink" d="${pixelText(START, px0, 158, PS)}" fill="#e9f1f1"/>`;

const hero_svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${GW}" height="${GH}" viewBox="0 0 ${GW} ${GH}" shape-rendering="crispEdges" role="img" aria-label="Pantalla de título de un videojuego pixel art: Samuel Quiroz, Front-End Developer, corre por una ciudad de noche recogiendo gemas de experiencia. Nivel 2.">
  <defs>
    <clipPath id="screen"><rect width="${GW}" height="${GH}" rx="14"/></clipPath>
    <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000" opacity=".22"/></pattern>
    <radialGradient id="vignette" cx="50%" cy="50%" r="75%"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
  </defs>
  <style>
    .scroll { animation: scroll linear infinite; }
    @keyframes scroll { to { transform: translateX(var(--loop, -${GW}px)); } }
    .tw { animation: tw 2.4s steps(1) infinite; }
    @keyframes tw { 50% { opacity: .15; } }
    .fA { animation: fA .32s steps(1) infinite; }
    .fB { animation: fB .32s steps(1) infinite; }
    @keyframes fA { 50% { opacity: 0; } }
    @keyframes fB { 0% { opacity: 0; } 50% { opacity: 1; } }
    .gem { animation: gem ${COIN_T}s linear infinite; }
    @keyframes gem {
      0% { transform: translateX(820px); opacity: 1; }
      80% { transform: translateX(0); opacity: 1; }
      81%, 100% { transform: translateX(0); opacity: 0; }
    }
    .bob { animation: bob .8s steps(2) infinite; }
    @keyframes bob { 50% { transform: translateY(-6px); } }
    .pop { opacity: 0; animation: pop ${COIN_T}s steps(6) infinite; }
    @keyframes pop {
      0%, 80% { opacity: 0; transform: translateY(0); }
      81% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-28px); }
    }
    .xp { transform-box: fill-box; transform-origin: left; animation: xp ${((COIN_T / 3) * 10).toFixed(2)}s steps(10, end) infinite; animation-delay: -${(COIN_T * 0.2).toFixed(2)}s; }
    @keyframes xp { from { transform: scaleX(0); } to { transform: scaleX(1); } }
    .blink { animation: blink 1.1s steps(1) infinite; }
    @keyframes blink { 50% { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) {
      .scroll, .tw, .fB, .gem, .bob, .pop, .xp, .blink { animation: none; }
      .fA { animation: none; } .fB { opacity: 0; }
    }
  </style>
  <g clip-path="url(#screen)">
    ${sky}
    ${stars}
    ${moon}
    ${layer(farMountains, (GW / (SPEED * 0.12)).toFixed(1))}
    ${layer(hills, (GW / (SPEED * 0.3)).toFixed(1))}
    ${layer(cityLayer, (GW / (SPEED * 0.5)).toFixed(1))}
    ${ground}
    ${gems}
    ${hero}
    ${pops}
    ${hud}
    ${title}
    <rect width="${GW}" height="${GH}" fill="url(#scan)"/>
    <rect width="${GW}" height="${GH}" fill="url(#vignette)"/>
  </g>
  <rect x="1" y="1" width="${GW - 2}" height="${GH - 2}" rx="13" fill="none" stroke="#22343a" stroke-width="2"/>
</svg>
`;
writeFileSync("assets/hero.svg", hero_svg);

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

// ─────────────────── Inventario del stack ───────────────────
// Cada tecnología es un objeto en una casilla, con el color de su categoría.
// Un cursor recorre las casillas y la ficha de la derecha describe el objeto
// seleccionado, como en el inventario de un RPG.
const CATEGORIES = [
  {
    name: "Frontend",
    color: "#a97bff",
    items: [
      ["JS", "JavaScript", "ES6+ en todos mis proyectos, del sitio estático a la aplicación con React."],
      ["TS", "TypeScript", "Tipado en los proyectos con Next.js para que el código aguante crecer."],
      ["RE", "React", "Componentes reutilizables en interfaces de e-commerce y dashboards."],
      ["NX", "Next.js", "La base de mis últimos proyectos: rutas, SSR y despliegue."],
      ["H5", "HTML5", "Maquetación semántica y accesible como punto de partida de todo."],
      ["C3", "CSS3", "Diseño responsive y composición con Flexbox y Grid."],
      ["TW", "Tailwind CSS", "Mi herramienta diaria de estilos en los proyectos con Next.js."],
      ["SC", "SCSS", "Variables, anidamiento y orden en proyectos sin framework de estilos."],
      ["BS", "Bootstrap", "Prototipado rápido de interfaces en proyectos de e-commerce."],
      ["API", "REST APIs", "Integración del front con servicios y sistemas backend."],
    ],
  },
  {
    name: "Datos",
    color: "#5fd3c4",
    items: [
      ["MDB", "MongoDB", "Base de los dashboards y las migraciones de datos desde Excel."],
      ["FB", "Firebase", "Autenticación, almacenamiento y base de datos en proyectos de e-commerce."],
    ],
  },
  {
    name: "Calidad",
    color: "#e0b860",
    items: [
      ["JST", "Jest", "Pruebas unitarias para detectar errores antes de que lleguen a producción."],
      ["QA", "Testing automatizado", "Automatización de pruebas para sostener la estabilidad de la aplicación."],
      ["CR", "Code review", "Revisión de código con el equipo: mantiene la calidad y se aprende de los demás."],
    ],
  },
  {
    name: "Git y despliegue",
    color: "#6aa8ff",
    items: [
      ["GIT", "Git", "Ramas, historial limpio y resolución de conflictos en el día a día."],
      ["GH", "GitHub", "Gestión del flujo de trabajo, pull requests y revisión de código."],
      ["GL", "GitLab", "Control de versiones en los proyectos de cliente que lo usaban."],
      ["VC", "Vercel", "Despliegue continuo de los proyectos con Next.js y de los sitios estáticos."],
      ["GCP", "Google Cloud", "Servicios de despliegue e infraestructura en proyectos empresariales."],
    ],
  },
  {
    name: "Método e IA",
    color: "#ff7eb6",
    items: [
      ["SCR", "Scrum", "Sprints, ceremonias y entrega continua junto al resto del equipo."],
      ["KB", "Kanban", "Tablero y flujo de tareas para no perder de vista lo que está en curso."],
      ["CP", "GitHub Copilot", "Apoyo en tareas repetitivas sin dejar de revisar lo que entra al repositorio."],
      ["CL", "Claude", "Exploración de soluciones, refactors y revisión de código."],
      ["CX", "Codex", "Automatización de tareas de desarrollo dentro del editor."],
    ],
  },
];

const items = CATEGORIES.flatMap((cat) => cat.items.map(([abbr, name, note]) => ({ abbr, name, note, cat })));
const INV_COLS = 9;
const SLOT = 56;
const SGAP = 8;
const IX = 28;
const IY = 70;
const INV_ROWS = Math.ceil(items.length / INV_COLS);
const gridW = INV_COLS * (SLOT + SGAP) - SGAP;
const PANEL_X = IX + gridW + 28;
const INV_W = PANEL_X + 300 + 28;
const INV_H = IY + INV_ROWS * (SLOT + SGAP) - SGAP + 64;
const STEP = 1.6; // segundos que el cursor pasa en cada casilla
const CYCLE = STEP * items.length;

const slotPos = (i) => ({ x: IX + (i % INV_COLS) * (SLOT + SGAP), y: IY + Math.floor(i / INV_COLS) * (SLOT + SGAP) });

/** Parte la nota en líneas de como mucho `max` caracteres. */
function wrap(text, max) {
  const lines = [""];
  for (const word of text.split(" ")) {
    const last = lines[lines.length - 1];
    if ((last + " " + word).trim().length > max) lines.push(word);
    else lines[lines.length - 1] = (last + " " + word).trim();
  }
  return lines;
}

let slots = "";
let tips = "";
for (let i = 0; i < INV_COLS * INV_ROWS; i++) {
  const { x, y } = slotPos(i);
  const item = items[i];
  slots += `<rect x="${x}" y="${y}" width="${SLOT}" height="${SLOT}" fill="#0f1a1d" stroke="${item ? item.cat.color : "#1c2b30"}" stroke-opacity="${item ? 0.55 : 1}" stroke-width="2"/>`;
  if (!item) continue;
  // Brillo de rareza en la esquina y la sigla en pixel art.
  slots += `<path d="${cell(x + 4, y + 4, 4)}${cell(x + 8, y + 4, 4)}${cell(x + 4, y + 8, 4)}" fill="${item.cat.color}" opacity=".8"/>`;
  const s = item.abbr.length > 2 ? 2 : 3;
  const tw = textWidth(item.abbr, s);
  slots += `<path d="${pixelText(item.abbr, x + Math.round((SLOT - tw) / 2), y + Math.round((SLOT - 7 * s) / 2) + 2, s)}" fill="#e9f1f1"/>`;

  const lines = wrap(item.note, 36)
    .map((line, l) => `<text x="${PANEL_X + 20}" y="${IY + 104 + l * 18}" class="note">${esc(line)}</text>`)
    .join("");
  tips += `<g class="tip" style="animation-delay:${(i * STEP).toFixed(2)}s">
    <text x="${PANEL_X + 20}" y="${IY + 30}" class="name">${esc(item.name)}</text>
    <rect x="${PANEL_X + 20}" y="${IY + 46}" width="10" height="10" fill="${item.cat.color}"/>
    <text x="${PANEL_X + 38}" y="${IY + 55}" class="cat" fill="${item.cat.color}">${esc(item.cat.name.toUpperCase())}</text>
    <line x1="${PANEL_X + 20}" y1="${IY + 74}" x2="${PANEL_X + 280}" y2="${IY + 74}" stroke="#22343a" stroke-dasharray="4 4"/>
    ${lines}
  </g>`;
}

// El cursor salta de casilla en casilla (step-end entre fotogramas clave).
const cursorFrames = items
  .map((_, i) => {
    const { x, y } = slotPos(i);
    return `${((i / items.length) * 100).toFixed(3)}% { transform: translate(${x - IX}px, ${y - IY}px); }`;
  })
  .join(" ");
const corner = (cx, cy, dx, dy) => `M${cx} ${cy}h${dx * 12}v${dy * 4}h${-dx * 8}v${dy * 8}h${-dx * 4}z`;
const C0 = IX - 6;
const C1 = IX + SLOT + 6;
const R0 = IY - 6;
const R1 = IY + SLOT + 6;
const cursor = `<path class="cursor" d="${corner(C0, R0, 1, 1)}${corner(C1, R0, -1, 1)}${corner(C0, R1, 1, -1)}${corner(C1, R1, -1, -1)}" fill="#ffffff"/>`;

const legend = CATEGORIES.map((cat, i) => {
  const x = IX + i * 150;
  return `<rect x="${x}" y="${INV_H - 34}" width="10" height="10" fill="${cat.color}"/><text x="${x + 18}" y="${INV_H - 25}" class="legend">${esc(cat.name)}</text>`;
}).join("");

const inventory = `<svg xmlns="http://www.w3.org/2000/svg" width="${INV_W}" height="${INV_H}" viewBox="0 0 ${INV_W} ${INV_H}" shape-rendering="crispEdges" role="img" aria-label="Inventario de tecnologías: ${esc(items.map((it) => it.name).join(", "))}">
  <style>
    .name { font: 700 20px ${MONO}; fill: ${C.fg}; }
    .cat { font: 700 11px ${MONO}; letter-spacing: 1.5px; }
    .note { font: 13px ${MONO}; fill: ${C.muted}; }
    .legend { font: 11px ${MONO}; fill: ${C.muted}; }
    .tip { opacity: 0; animation: tip ${CYCLE.toFixed(1)}s step-end infinite; }
    @keyframes tip { 0% { opacity: 1; } ${(100 / items.length).toFixed(3)}% { opacity: 0; } 100% { opacity: 0; } }
    .cursor { animation: cursor ${CYCLE.toFixed(1)}s step-end infinite, blink .8s steps(1) infinite; }
    @keyframes cursor { ${cursorFrames} 100% { transform: translate(0, 0); } }
    @keyframes blink { 50% { opacity: .35; } }
    @media (prefers-reduced-motion: reduce) {
      .cursor { animation: none; }
      .tip { animation: none; }
      .tip:first-of-type { opacity: 1; }
    }
  </style>
  <rect x="1" y="1" width="${INV_W - 2}" height="${INV_H - 2}" rx="13" fill="${C.bg}" stroke="${C.line}" stroke-width="2"/>
  <path d="${pixelText("INVENTARIO", IX, 24, 3)}" fill="${C.fg}"/>
  <path d="${pixelText(`${items.length}/${INV_COLS * INV_ROWS}`, IX + gridW - textWidth(`${items.length}/${INV_COLS * INV_ROWS}`, 2), 30, 2)}" fill="${C.aqua}"/>
  ${slots}
  ${cursor}
  <rect x="${PANEL_X}" y="${IY}" width="300" height="${INV_ROWS * (SLOT + SGAP) - SGAP}" fill="#0f1a1d" stroke="#22343a" stroke-width="2"/>
  ${tips}
  ${legend}
</svg>
`;
writeFileSync("assets/stack.svg", inventory);

console.log("assets/hero.svg, assets/stack.svg y assets/terminal.svg generados");
