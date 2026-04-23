// ── Color conversion ──────────────────────────────────────────────

function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return { r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255) };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.min(100, Math.max(0, s));
  l = Math.min(96, Math.max(4, l));
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

function hexToHsl(hex) {
  const rgb = hexToRgb(hex);
  return rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
}

// ── Palette generators ────────────────────────────────────────────

function genMonochromatic({ h, s }) {
  return [
    { hex: hslToHex(h, s, 15), label: '아주 어두움' },
    { hex: hslToHex(h, s, 30), label: '어두움' },
    { hex: hslToHex(h, s, 50), label: '기준' },
    { hex: hslToHex(h, s, 65), label: '밝음' },
    { hex: hslToHex(h, s, 82), label: '아주 밝음' },
  ];
}

function genComplementary({ h, s, l }) {
  const c = (h + 180) % 360;
  return [
    { hex: hslToHex(h, s, Math.max(l - 20, 10)), label: '기준 (어두움)' },
    { hex: hslToHex(h, s, l),                    label: '기준' },
    { hex: hslToHex(h, s, Math.min(l + 20, 88)), label: '기준 (밝음)' },
    { hex: hslToHex(c, s, Math.max(l - 20, 10)), label: '보색 (어두움)' },
    { hex: hslToHex(c, s, l),                    label: '보색' },
    { hex: hslToHex(c, s, Math.min(l + 20, 88)), label: '보색 (밝음)' },
  ];
}

function genAnalogous({ h, s, l }) {
  return [
    { hex: hslToHex(h - 60, s, l), label: '-60°' },
    { hex: hslToHex(h - 30, s, l), label: '-30°' },
    { hex: hslToHex(h,      s, l), label: '기준' },
    { hex: hslToHex(h + 30, s, l), label: '+30°' },
    { hex: hslToHex(h + 60, s, l), label: '+60°' },
  ];
}

function genTriadic({ h, s, l }) {
  return [
    { hex: hslToHex(h,            s, l), label: '기준' },
    { hex: hslToHex((h + 120) % 360, s, l), label: '+120°' },
    { hex: hslToHex((h + 240) % 360, s, l), label: '+240°' },
  ];
}

function genTetradic({ h, s, l }) {
  return [
    { hex: hslToHex(h,             s, l), label: '기준' },
    { hex: hslToHex((h + 90)  % 360, s, l), label: '+90°' },
    { hex: hslToHex((h + 180) % 360, s, l), label: '+180°' },
    { hex: hslToHex((h + 270) % 360, s, l), label: '+270°' },
  ];
}

function genSplit({ h, s, l }) {
  return [
    { hex: hslToHex(h, s, Math.max(l - 15, 10)), label: '기준 (어두움)' },
    { hex: hslToHex(h, s, l),                    label: '기준' },
    { hex: hslToHex(h, s, Math.min(l + 15, 88)), label: '기준 (밝음)' },
    { hex: hslToHex((h + 150) % 360, s, l),      label: '+150°' },
    { hex: hslToHex((h + 210) % 360, s, l),      label: '+210°' },
  ];
}

const GENERATORS = {
  monochromatic: genMonochromatic,
  complementary: genComplementary,
  analogous:     genAnalogous,
  triadic:       genTriadic,
  tetradic:      genTetradic,
  split:         genSplit,
};

const TITLES = {
  monochromatic: '단색 (Monochromatic) 팔레트',
  complementary: '보색 (Complementary) 팔레트',
  analogous:     '유사색 (Analogous) 팔레트',
  triadic:       '삼각형 (Triadic) 팔레트',
  tetradic:      '사각형 (Tetradic) 팔레트',
  split:         '분열 보색 (Split-Complementary) 팔레트',
};

// ── UI ────────────────────────────────────────────────────────────

let currentHex = '#7dd3fc';
let currentType = 'monochromatic';

function textColorFor(hsl) {
  return hsl.l < 52 ? '#ffffff' : '#000000';
}

function renderPalette(colors) {
  const grid = document.getElementById('paletteGrid');
  grid.innerHTML = '';

  colors.forEach(({ hex, label }) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const tc  = textColorFor(hsl);
    const hexU   = hex.toUpperCase();
    const rgbStr = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    const hslStr = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

    const div = document.createElement('div');
    div.className = 'swatch';
    div.innerHTML = `
      <div class="swatch-color" style="background:${hex};color:${tc}" data-copy="${hexU}">
        <span class="swatch-hex-display">${hexU}</span>
        <span class="swatch-role">${label}</span>
        <div class="copy-hint">클릭하여 복사</div>
      </div>
      <div class="swatch-details">
        <div class="detail-row">
          <span class="detail-label">HEX</span>
          <span class="detail-value">${hexU}</span>
          <button class="copy-btn" data-copy="${hexU}">복사</button>
        </div>
        <div class="detail-row">
          <span class="detail-label">RGB</span>
          <span class="detail-value">${rgbStr}</span>
          <button class="copy-btn" data-copy="${rgbStr}">복사</button>
        </div>
        <div class="detail-row">
          <span class="detail-label">HSL</span>
          <span class="detail-value">${hslStr}</span>
          <button class="copy-btn" data-copy="${hslStr}">복사</button>
        </div>
      </div>`;
    grid.appendChild(div);
  });

  grid.querySelectorAll('[data-copy]').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      copyText(el.dataset.copy);
    });
  });
}

function buildPalette(hex, type) {
  const hsl = hexToHsl(hex);
  if (!hsl) return;
  const colors = GENERATORS[type](hsl);
  document.getElementById('paletteTitle').textContent = TITLES[type];
  renderPalette(colors);
}

function copyText(text) {
  const finish = () => showToast('클립보드에 복사되었습니다!');
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(finish).catch(() => fallbackCopy(text, finish));
  } else {
    fallbackCopy(text, finish);
  }
}

function fallbackCopy(text, cb) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:-9999px';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); cb(); } catch (_) {}
  document.body.removeChild(ta);
}

let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function randomHex() {
  const h = Math.floor(Math.random() * 360);
  const s = 50 + Math.floor(Math.random() * 35);
  const l = 38 + Math.floor(Math.random() * 28);
  return hslToHex(h, s, l);
}

// ── Init ──────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const picker   = document.getElementById('colorPicker');
  const hexInput = document.getElementById('hexInput');

  picker.value   = currentHex;
  hexInput.value = currentHex.toUpperCase();

  picker.addEventListener('input', () => {
    currentHex     = picker.value;
    hexInput.value = currentHex.toUpperCase();
    buildPalette(currentHex, currentType);
  });

  hexInput.addEventListener('input', () => {
    let val = hexInput.value.trim();
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      currentHex   = val.toLowerCase();
      picker.value = currentHex;
      buildPalette(currentHex, currentType);
    }
  });

  hexInput.addEventListener('keydown', e => { if (e.key === 'Enter') hexInput.blur(); });

  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentType = btn.dataset.type;
      buildPalette(currentHex, currentType);
    });
  });

  document.getElementById('randomBtn').addEventListener('click', () => {
    currentHex     = randomHex();
    picker.value   = currentHex;
    hexInput.value = currentHex.toUpperCase();
    buildPalette(currentHex, currentType);
  });

  document.getElementById('exportBtn').addEventListener('click', () => {
    const swatches = document.querySelectorAll('.swatch-color');
    const vars = Array.from(swatches)
      .map((s, i) => `  --color-${i + 1}: ${s.dataset.copy};`)
      .join('\n');
    copyText(`:root {\n${vars}\n}`);
    showToast('CSS 변수가 복사되었습니다!');
  });

  buildPalette(currentHex, currentType);
});
