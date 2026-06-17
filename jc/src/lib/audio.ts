let sharedAudioCtx: AudioContext | null = null;

export function getAudioCtx(): AudioContext {
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed')
    sharedAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return sharedAudioCtx;
}

export function fmt(s: number): string {
  s = Math.max(0, s);
  const m = Math.floor(s / 60);
  const sec = (s % 60).toFixed(1);
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

export function tick(ms = 20): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function getSilenceRegions(buf: AudioBuffer, threshold: number, minSilSec: number): [number, number][] {
  const data = buf.getChannelData(0), sr = buf.sampleRate;
  const blockSize = Math.floor(sr * 0.01), out: [number, number][] = [];
  let silStart = -1;
  for (let i = 0; i < data.length; i += blockSize) {
    const end = Math.min(i + blockSize, data.length);
    let rms = 0;
    for (let j = i; j < end; j++) rms += data[j] * data[j];
    rms = Math.sqrt(rms / (end - i));
    if (rms < threshold) { if (silStart < 0) silStart = i; }
    else { if (silStart >= 0) { if ((i - silStart) / sr >= minSilSec) out.push([silStart / sr, i / sr]); silStart = -1; } }
  }
  if (silStart >= 0 && (data.length - silStart) / sr >= minSilSec) out.push([silStart / sr, buf.duration]);
  return out;
}

export function getKeepRegions(silRegions: [number, number][], totalDur: number, paddingSec: number): [number, number][] {
  const keep: [number, number][] = []; let cursor = 0;
  for (const [silStart, silEnd] of silRegions) {
    const speechEnd = Math.max(cursor, silStart - paddingSec);
    if (speechEnd > cursor + 0.005) keep.push([cursor, speechEnd]);
    cursor = Math.min(totalDur, silEnd + paddingSec);
  }
  if (cursor < totalDur - 0.005) keep.push([cursor, totalDur]);
  return keep;
}

export function buildCleanAudioBuffer(audioBuffer: AudioBuffer, keepRegions: [number, number][]): AudioBuffer {
  const sr = audioBuffer.sampleRate, nc = audioBuffer.numberOfChannels;
  const regionSamples = keepRegions.map(([s, e]) => Math.max(0, Math.min(Math.floor(e * sr), audioBuffer.length) - Math.floor(s * sr)));
  const totalSamples = regionSamples.reduce((a, b) => a + b, 0);
  const out = getAudioCtx().createBuffer(nc, Math.max(1, totalSamples), sr);
  let wo = 0;
  for (let ri = 0; ri < keepRegions.length; ri++) {
    const [s, e] = keepRegions[ri];
    const ss = Math.floor(s * sr), se = Math.min(Math.floor(e * sr), audioBuffer.length), len = regionSamples[ri];
    if (len <= 0) continue;
    for (let ch = 0; ch < nc; ch++) out.getChannelData(ch).set(audioBuffer.getChannelData(ch).subarray(ss, se), wo);
    wo += len;
  }
  return out;
}

export function drawWaveform(canvas: HTMLCanvasElement, audioBuffer: AudioBuffer, threshold: number, minSilSec: number): void {
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.offsetWidth * dpr; canvas.height = 68 * dpr;
  ctx.scale(dpr, dpr);
  const W = canvas.offsetWidth, H = 68; ctx.clearRect(0, 0, W, H);
  const silRegions = getSilenceRegions(audioBuffer, threshold, minSilSec);
  const data = audioBuffer.getChannelData(0), step = Math.ceil(data.length / W);
  for (let x = 0; x < W; x++) {
    let maxAmp = 0;
    for (let i = 0; i < step; i++) { const idx = x * step + i; if (idx < data.length) maxAmp = Math.max(maxAmp, Math.abs(data[idx])); }
    const t = (x / W) * audioBuffer.duration, isSilent = silRegions.some(([s, e]) => t >= s && t <= e);
    const h = Math.max(2, maxAmp * H);
    ctx.fillStyle = isSilent ? 'rgba(255,94,94,0.55)' : 'rgba(200,240,74,0.65)';
    ctx.fillRect(x, (H - h) / 2, 1, h);
  }
}

export function bufferToWav(buffer: AudioBuffer): Blob {
  const nc = buffer.numberOfChannels, sr = buffer.sampleRate, len = buffer.length;
  const ab = new ArrayBuffer(44 + len * nc * 2), view = new DataView(ab);
  const ws = (o: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
  ws(0, 'RIFF'); view.setUint32(4, 36 + len * nc * 2, true); ws(8, 'WAVE');
  ws(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, nc, true); view.setUint32(24, sr, true);
  view.setUint32(28, sr * nc * 2, true); view.setUint16(32, nc * 2, true);
  view.setUint16(34, 16, true); ws(36, 'data'); view.setUint32(40, len * nc * 2, true);
  let offset = 44;
  for (let i = 0; i < len; i++) for (let ch = 0; ch < nc; ch++) {
    const s = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true); offset += 2;
  }
  return new Blob([ab], { type: 'audio/wav' });
}


export function isProUnlocked(): boolean {
  return false;
}

export function unlockPro(): void {
  return;
}
