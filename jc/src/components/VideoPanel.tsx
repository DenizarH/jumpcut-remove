'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { getAudioCtx, fmt, tick, getSilenceRegions, getKeepRegions, drawWaveform } from '@/lib/audio';
import styles from './Panel.module.css';

// ─── FFmpeg singleton ──────────────────────────────────────────────────────
interface FFCtx { ff: any; fetchFile: (d: File | Blob) => Promise<Uint8Array>; }
let _ff: FFCtx | null = null;
let _ffP: Promise<FFCtx> | null = null;

async function loadFFmpeg(): Promise<FFCtx> {
  if (_ff) return _ff;
  if (_ffP) return _ffP;
  _ffP = (async () => {
    const { FFmpeg } = await import('@ffmpeg/ffmpeg');
    const { fetchFile, toBlobURL } = await import('@ffmpeg/util');
    const ff = new FFmpeg();
    const mt = typeof SharedArrayBuffer !== 'undefined';
    if (mt) {
      const b = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/umd';
      await ff.load({
        coreURL:   await toBlobURL(`${b}/ffmpeg-core.js`,        'text/javascript'),
        wasmURL:   await toBlobURL(`${b}/ffmpeg-core.wasm`,      'application/wasm'),
        workerURL: await toBlobURL(`${b}/ffmpeg-core.worker.js`, 'text/javascript'),
      });
    } else {
      const b = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      await ff.load({
        coreURL: await toBlobURL(`${b}/ffmpeg-core.js`,   'text/javascript'),
        wasmURL: await toBlobURL(`${b}/ffmpeg-core.wasm`, 'application/wasm'),
      });
    }
    _ff = { ff, fetchFile };
    return _ff;
  })();
  return _ffP;
}

function buildConcat(regions: [number,number][], input: string): string {
  return regions.map(([s,e]) => `file '${input}'\ninpoint ${s.toFixed(6)}\noutpoint ${e.toFixed(6)}`).join('\n');
}

function parseTime(line: string): number | null {
  const m = line.match(/time=(\d{2}):(\d{2}):(\d{2}[.,]\d+)/);
  if (!m) return null;
  return +m[1]*3600 + +m[2]*60 + parseFloat(m[3].replace(',','.'));
}

function resolveFormat(name: string) {
  if (name.toLowerCase().endsWith('.webm'))
    return { ext:'webm', vcodec:'libvpx-vp9', acodec:'libopus',
             speed:['-deadline','realtime','-cpu-used','8','-row-mt','1'] };
  return { ext:'mp4', vcodec:'libx264', acodec:'aac',
           speed:['-preset','ultrafast','-tune','fastdecode','-threads','0','-movflags','+faststart'] };
}

function crf(q: string) { return q==='high'?'20':q==='medium'?'26':'32'; }

interface Props { proUnlocked: boolean; onRequestDownload: () => void; downloadTrigger: number; }

export default function VideoPanel({ downloadTrigger }: Props) {
  const [file, setFile]               = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [blob, setBlob]               = useState<Blob | null>(null);
  const [fileMeta, setFileMeta]       = useState('');
  const [previewUrl, setPreviewUrl]   = useState('');
  const [dragging, setDragging]       = useState(false);
  const [threshold, setThreshold]     = useState(0.015);
  const [minSilence, setMinSilence]   = useState(400);
  const [padding, setPadding]         = useState(80);
  const [quality, setQuality]         = useState('high');
  const [progress, setProgress]       = useState<{label:string;pct:number}|null>(null);
  const [stats, setStats]             = useState<{orig:string;newDur:string;removed:string}|null>(null);
  const [error, setError]             = useState('');
  const [info, setInfo]               = useState('');
  const [showTimeline, setShowTimeline] = useState(false);
  const [showResult, setShowResult]   = useState(false);
  const [resultUrl, setResultUrl]     = useState('');
  const [ffStatus, setFfStatus]       = useState<'loading'|'ready'|'error'>('loading');
  const [multithread, setMultithread] = useState(false);

  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blobRef      = useRef<Blob|null>(null);
  const fileRef      = useRef<File|null>(null);
  const abufRef      = useRef<AudioBuffer|null>(null);
  const prevTrig     = useRef(0);

  useEffect(() => {
    loadFFmpeg()
      .then(() => { setFfStatus('ready'); setMultithread(typeof SharedArrayBuffer !== 'undefined'); })
      .catch(() => setFfStatus('error'));
  }, []);

  const redraw = useCallback((buf: AudioBuffer, thr: number, ms: number) => {
    if (canvasRef.current) drawWaveform(canvasRef.current, buf, thr, ms/1000);
  }, []);

  const loadVideo = async (f: File) => {
    setFile(f); fileRef.current = f;
    setBlob(null); blobRef.current = null;
    setShowResult(false); setStats(null); setShowTimeline(false); setInfo(''); setError('');
    setFileMeta((f.size/1024/1024).toFixed(1)+' MB');
    setPreviewUrl(URL.createObjectURL(f));
    setProgress({label:'Reading audio...',pct:15}); await tick();
    try {
      const buf = await getAudioCtx().decodeAudioData(await f.arrayBuffer());
      abufRef.current = buf; setAudioBuffer(buf);
      setFileMeta(`${(f.size/1024/1024).toFixed(1)} MB · ${fmt(buf.duration)} · ${buf.sampleRate} Hz`);
      setShowTimeline(true);
      setTimeout(() => redraw(buf, threshold, minSilence), 50);
    } catch { setInfo('Timeline preview unavailable — processing will still work.'); }
    setProgress(null);
  };

  const processVideo = async () => {
    const f = fileRef.current; if (!f) return;
    setBlob(null); blobRef.current = null; setShowResult(false); setStats(null); setError(''); setInfo('');

    setProgress({label:'Reading audio track...',pct:5}); await tick();
    let abuf = abufRef.current;
    if (!abuf) {
      try { abuf = await getAudioCtx().decodeAudioData(await f.arrayBuffer()); abufRef.current = abuf; setAudioBuffer(abuf); }
      catch { setProgress(null); setError('Could not read audio. Try MP4 or WEBM.'); return; }
    }

    setProgress({label:'Detecting silences...',pct:12}); await tick();
    const sil  = getSilenceRegions(abuf, threshold, minSilence/1000);
    const keep = getKeepRegions(sil, abuf.duration, padding/1000);
    if (!keep.length) { setProgress(null); setError('No speech found. Lower the cut sensitivity and try again.'); return; }

    const totalDur = abuf.duration;
    const newDur   = keep.reduce((a,[s,e]) => a+e-s, 0);

    setProgress({label:'Loading FFmpeg...',pct:20}); await tick();
    let ctx: FFCtx;
    try { ctx = await loadFFmpeg(); }
    catch { setProgress(null); setError('Failed to load FFmpeg. Check your connection.'); return; }

    const { ff, fetchFile } = ctx;
    const ext    = f.name.substring(f.name.lastIndexOf('.')) || '.mp4';
    const inName = `input${ext}`;
    const concat = 'segments.txt';
    const { ext:outExt, vcodec, acodec, speed } = resolveFormat(f.name);
    const outName = `output.${outExt}`;

    setProgress({label:'Preparing files...',pct:28}); await tick();
    try { ff.writeFile(inName, await fetchFile(f)); }
    catch { setProgress(null); setError('File too large for browser memory.'); return; }
    ff.writeFile(concat, new TextEncoder().encode(buildConcat(keep, inName)));

    setProgress({label:'Starting FFmpeg...',pct:40}); await tick();
    const handler = ({message}: {message:string}) => {
      const t = parseTime(message);
      if (t !== null && newDur > 0)
        setProgress({label:`Encoding... ${fmt(t)} / ${fmt(newDur)}`, pct:Math.min(95,55+(t/newDur)*38)});
    };
    ff.on('log', handler);

    try {
      await ff.exec(['-f','concat','-safe','0','-i',concat,'-c:v',vcodec,'-crf',crf(quality),...speed,'-c:a',acodec,'-y',outName]);
    } catch(e:any) {
      ff.off('log',handler);
      try{ff.deleteFile(inName);}catch{}
      try{ff.deleteFile(concat);}catch{}
      setProgress(null); setError(`FFmpeg failed: ${e?.message??'unknown error'}`); return;
    }
    ff.off('log', handler);

    setProgress({label:'Reading output...',pct:97}); await tick();
    let out: Uint8Array;
    try { out = await ff.readFile(outName); }
    catch { setProgress(null); setError('Could not read FFmpeg output.'); return; }

    try{ff.deleteFile(inName);}catch{}
    try{ff.deleteFile(concat);}catch{}
    try{ff.deleteFile(outName);}catch{}

    if (out.length < 2000) { setProgress(null); setError('Export failed — try a different quality or format.'); return; }

    setProgress({label:'Finalising...',pct:99}); await tick(150);
    const mime = outExt==='webm'?'video/webm':'video/mp4';
    const finalBlob = new Blob([out], {type:mime});
    blobRef.current = finalBlob; setBlob(finalBlob);
    setResultUrl(URL.createObjectURL(finalBlob)); setShowResult(true);
    setStats({orig:fmt(totalDur), newDur:fmt(newDur), removed:'-'+fmt(totalDur-newDur)});
    redraw(abuf, threshold, minSilence);
    setProgress(null);
    setInfo(`✓ Done! ${sil.length} silence(s) removed. Click <strong>Download</strong> to save your file.`);
  };

  const doDownload = useCallback(() => {
    const b = blobRef.current, f = fileRef.current; if (!b) return;
    const ext = b.type.includes('mp4')?'mp4':'webm';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = `${(f?.name||'video').replace(/\.[^.]+$/,'')}_no_silence.${ext}`;
    a.click();
  }, []);

  if (downloadTrigger !== prevTrig.current) { prevTrig.current = downloadTrigger; if (downloadTrigger > 0) doDownload(); }

  return (
    <div className={styles.card}>
      <div className={styles.engineBadge}>
        <span className={`${styles.engineDot} ${ffStatus==='ready'?styles.engineDotReady:ffStatus==='error'?styles.engineDotError:''}`}/>
        <span className={styles.engineLabel}>
          {ffStatus==='loading'&&'Loading FFmpeg WASM...'}
          {ffStatus==='ready'&&`FFmpeg WASM · ${multithread?'⚡ multithread':'single-thread'}`}
          {ffStatus==='error'&&'FFmpeg failed to load — check your connection'}
        </span>
      </div>

      <div className={`${styles.dropZone} ${dragging?styles.dragover:''}`}
        onDragOver={(e)=>{e.preventDefault();setDragging(true);}}
        onDragLeave={()=>setDragging(false)}
        onDrop={(e)=>{e.preventDefault();setDragging(false);if(e.dataTransfer.files[0])loadVideo(e.dataTransfer.files[0]);}}
        onClick={()=>fileInputRef.current?.click()}>
        <div className={styles.dzIcon}>🎬</div>
        <p className={styles.dzTitle}>Drop your video here or click to choose</p>
        <p className={styles.dzSub}>MP4 · MOV · WEBM · MKV — processed locally, never uploaded</p>
        <input ref={fileInputRef} type="file" accept="video/*" style={{display:'none'}}
          onChange={(e)=>e.target.files?.[0]&&loadVideo(e.target.files[0])}/>
      </div>

      {file&&<div className={styles.fileInfo}><span style={{fontSize:20}}>🎬</span><div><p className={styles.fiName}>{file.name}</p><p className={styles.fiMeta}>{fileMeta}</p></div></div>}
      {previewUrl&&<div className={styles.previewWrap}><video src={previewUrl} muted playsInline controls/></div>}

      <div className={styles.controls}>
        <div className={styles.ctrl}>
          <label>Cut sensitivity</label>
          <input type="range" min="0.001" max="0.08" step="0.001" value={threshold}
            onChange={(e)=>{const v=parseFloat(e.target.value);setThreshold(v);if(audioBuffer)redraw(audioBuffer,v,minSilence);}}/>
          <div className={styles.ctrlRow}><span className={styles.ctrlHint}>sensitive</span><span className={styles.ctrlVal}>{threshold.toFixed(3)}</span><span className={styles.ctrlHint}>tolerant</span></div>
        </div>
        <div className={styles.ctrl}>
          <label>Minimum silence</label>
          <input type="range" min="100" max="2000" step="50" value={minSilence}
            onChange={(e)=>{const v=parseInt(e.target.value);setMinSilence(v);if(audioBuffer)redraw(audioBuffer,threshold,v);}}/>
          <div className={styles.ctrlRow}><span className={styles.ctrlHint}>100ms</span><span className={styles.ctrlVal}>{minSilence}ms</span><span className={styles.ctrlHint}>2000ms</span></div>
        </div>
        <div className={styles.ctrl}>
          <label>Keep natural pauses</label>
          <input type="range" min="0" max="300" step="10" value={padding}
            onChange={(e)=>setPadding(parseInt(e.target.value))}/>
          <div className={styles.ctrlRow}><span className={styles.ctrlHint}>tighter</span><span className={styles.ctrlVal}>{padding}ms</span><span className={styles.ctrlHint}>looser</span></div>
        </div>
        <div className={styles.ctrl}>
          <label>Output quality</label>
          <select value={quality} onChange={(e)=>setQuality(e.target.value)}>
            <option value="high">High (recommended)</option>
            <option value="medium">Medium (smaller file)</option>
            <option value="low">Low (faster)</option>
          </select>
        </div>
      </div>

      {showTimeline&&<div className={styles.timelineWrap}>
        <p className={styles.secLabel}>Timeline — <span style={{color:'var(--danger)'}}>■</span> removed · <span style={{color:'var(--accent)'}}>■</span> kept</p>
        <canvas ref={canvasRef} className={styles.waveformCanvas}/>
      </div>}

      {stats&&<div className={styles.stats}>
        <div className={styles.stat}><p className={styles.statLabel}>Original</p><p className={styles.statVal}>{stats.orig}</p></div>
        <div className={styles.stat}><p className={styles.statLabel}>Result</p><p className={`${styles.statVal} ${styles.statOk}`}>{stats.newDur}</p></div>
        <div className={styles.stat}><p className={styles.statLabel}>Removed</p><p className={`${styles.statVal} ${styles.statCut}`}>{stats.removed}</p></div>
      </div>}

      {progress&&<div className={styles.progressWrap}>
        <div className={styles.progHead}><span className={styles.progLabel}>{progress.label}</span><span className={styles.progPct}>{Math.round(progress.pct)}%</span></div>
        <div className={styles.progTrack}><div className={styles.progBar} style={{width:`${progress.pct}%`}}/></div>
      </div>}

      <div className={styles.actions}>
        <button className={styles.btnProcess} disabled={!file||!!progress||ffStatus==='loading'} onClick={processVideo}>
          {progress?'⏳ Processing...':ffStatus==='loading'?'⏳ Loading FFmpeg...':'▶ Remove silences'}
        </button>
        {blob&&<button className={`${styles.btnDownload} ${styles.proUnlocked}`} onClick={doDownload}>↓ Download</button>}
      </div>

      {showResult&&<div className={styles.resultWrap}>
        <p className={styles.secLabel} style={{marginBottom:7}}>Preview result</p>
        <video controls playsInline src={resultUrl} style={{borderRadius:'var(--radius)',border:'1px solid var(--border)',background:'#000',display:'block'}}/>
      </div>}

      {error&&<div className={styles.msgError}>⚠ {error}</div>}
      {info&&<div className={styles.msgInfo} dangerouslySetInnerHTML={{__html:info}}/>}
    </div>
  );
}
