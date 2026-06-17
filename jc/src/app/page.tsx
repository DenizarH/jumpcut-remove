'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styles from './page.module.css';

const AudioPanel = dynamic(() => import('@/components/AudioPanel'), { ssr: false, loading: () => null });
const VideoPanel = dynamic(() => import('@/components/VideoPanel'), { ssr: false, loading: () => null });

type Mode = 'audio' | 'video' | null;

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<Mode>(null);
  const [audioTrigger, setAudioTrigger] = useState(0);
  const [videoTrigger, setVideoTrigger] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const selectMode = (m: Mode) => {
    setMode(m);
    setTimeout(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  return (
    <main className={styles.main}>

      <section className={styles.hero}>
        <div className={styles.logo}><span className={styles.logoDot} />JumpCut Remove</div>
        <h1 className={styles.h1}>Remove silences from videos<br /><em className={styles.em}>free, fast, in your browser.</em></h1>
        <p className={styles.heroSub}>
          Automatically cut dead air and awkward pauses from your videos and podcasts.
          No account, no upload, no waiting — everything runs locally on your device.
        </p>
        <p className={styles.heroPrivacy}>🔒 100% private — your files never leave your computer</p>
        <div className={styles.heroBadges}>
          {['✓ free','✓ no upload','✓ no account','✓ works offline','✓ audio & video'].map(b => (
            <span key={b} className={styles.hbadge}>{b}</span>
          ))}
        </div>
      </section>

      <section className={styles.howSection}>
        <div className={styles.howSteps}>
          {[
            { num:'01', title:'Drop your file', desc:'Audio or video, any format. Stays on your device — nothing is uploaded.' },
            { num:'02', title:'Adjust settings', desc:'See exactly what gets cut in red. Fine-tune sensitivity until it\'s perfect.' },
            { num:'03', title:'Download free', desc:'Get a clean, tight file ready to publish. No watermark, no limits.' },
          ].map(s => (
            <div key={s.num} className={styles.howStep}>
              <p className={styles.howNum}>{s.num}</p>
              <p className={styles.howTitle}>{s.title}</p>
              <p className={styles.howDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.privacyBanner}>
        <span className={styles.pbIcon}>🔒</span>
        <div>
          <p className={styles.pbTitle}>Your files stay on your computer</p>
          <p className={styles.pbDesc}>
            All processing happens inside your browser using WebAssembly. No server ever receives your files —
            not even for a second. Most tools upload your video, wait in a queue, then send it back.
            JumpCut Remove does everything locally, instantly, for free.
          </p>
        </div>
      </div>

      <section className={styles.modeSection}>
        <p className={styles.modeLabel}>What are you working with?</p>
        <div className={styles.modeCards}>
          <button className={`${styles.modeCard} ${mode==='audio'?styles.modeActive:''}`} onClick={() => selectMode('audio')}>
            <span className={styles.modeIcon}>🎙️</span>
            <p className={styles.modeTitle}>Audio only</p>
            <p className={styles.modeDesc}>Podcasts, voiceovers,<br />voice recordings</p>
            <p className={styles.modeFormats}>MP3 · WAV · OGG · M4A · FLAC</p>
            <span className={styles.modeArrow}>→</span>
          </button>
          <button className={`${styles.modeCard} ${mode==='video'?styles.modeActive:''}`} onClick={() => selectMode('video')}>
            <span className={styles.modeIcon}>🎬</span>
            <p className={styles.modeTitle}>Video with audio</p>
            <p className={styles.modeDesc}>Shorts, tutorials,<br />vlogs, online courses</p>
            <p className={styles.modeFormats}>MP4 · MOV · WEBM · MKV</p>
            <span className={styles.modeArrow}>→</span>
          </button>
        </div>
      </section>

      <div ref={panelRef} className={styles.panelWrapper}>
        {mode === 'audio' && <AudioPanel proUnlocked={true} onRequestDownload={() => setAudioTrigger(n=>n+1)} downloadTrigger={audioTrigger} />}
        {mode === 'video' && <VideoPanel proUnlocked={true} onRequestDownload={() => setVideoTrigger(n=>n+1)} downloadTrigger={videoTrigger} />}
      </div>

      <section className={styles.featSection}>
        <p className={styles.featTitle}>Why creators use JumpCut Remove</p>
        <div className={styles.featGrid}>
          {[
            { icon:'⚡', title:'Instant processing', desc:'No queue, no waiting. Your file is processed the moment you click. Most videos finish in under a minute.' },
            { icon:'🎯', title:'Smart silence detection', desc:'Adjustable threshold and minimum silence length. Keeps natural breathing, removes dead air.' },
            { icon:'🔒', title:'100% private', desc:'Your files never leave your browser. No server, no storage, no risk. Works completely offline too.' },
            { icon:'🎬', title:'Video & audio', desc:'Works with MP4, MOV, WEBM, MKV for video and MP3, WAV, OGG, M4A, FLAC for audio.' },
            { icon:'📊', title:'Visual waveform', desc:'See exactly which parts get cut in red and which stay in green before processing.' },
            { icon:'💸', title:'Completely free', desc:'No account, no subscription, no watermark. Download your processed file immediately.' },
          ].map(f => (
            <div key={f.title} className={styles.featCard}>
              <span className={styles.featIcon}>{f.icon}</span>
              <p className={styles.featCardTitle}>{f.title}</p>
              <p className={styles.featCardDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.faqSection} aria-label="Frequently asked questions">
        <p className={styles.faqTitle}>Frequently Asked Questions</p>
        {[
          { q:'What is JumpCut Remove?', a:'JumpCut Remove is a free browser-based tool that automatically removes silences, pauses, and dead air from video and audio files. It uses WebAssembly (FFmpeg WASM) to process your files directly in your browser — no upload required.' },
          { q:'Is JumpCut Remove really free?', a:'Yes, completely free. No account, no subscription, no hidden limits. You can process and download as many files as you want at no cost.' },
          { q:'How does it detect silences?', a:'The tool analyses the audio waveform and calculates the RMS (root mean square) volume of each audio block. Sections that fall below your chosen threshold for longer than the minimum silence duration are marked for removal.' },
          { q:'Will my video lose quality?', a:'The video is re-encoded using FFmpeg with your chosen quality setting. High uses CRF 20 with libx264 (excellent quality). The only change is that silence sections are removed — everything else stays identical.' },
          { q:'What file formats are supported?', a:'Video: MP4, MOV, WEBM, MKV. Audio: MP3, WAV, OGG, M4A, FLAC. Output is MP4 for most video inputs and WAV for audio.' },
          { q:'Is there a file size limit?', a:'No limits set by us. Practical limits depend on your device RAM — most modern computers handle files up to 1–2 GB without issues.' },
          { q:'How is this different from Descript or Recut?', a:'JumpCut Remove is free, requires no account, and processes everything locally on your device. Descript and Recut are cloud-based subscription tools. We are the best choice for privacy-conscious creators or anyone who does not want to pay a monthly fee.' },
          { q:'Does it work on mobile?', a:'It works on modern mobile browsers, but processing large video files on mobile is slow due to limited RAM and CPU. For best results, use a desktop or laptop.' },
        ].map(item => (
          <div key={item.q} className={styles.faqItem}>
            <p className={styles.faqQ}>{item.q}</p>
            <p className={styles.faqA}>{item.a}</p>
          </div>
        ))}
      </section>

      <footer className={styles.footer}>
        <p>🔒 100% free · no account · no upload · no watermark</p>
        <p>
          <a href="/privacy">Privacy Policy</a>
          <span className={styles.footerDivider}>·</span>
          <a href="/privacy">Terms of Use</a>
          <span className={styles.footerDivider}>·</span>
          <span>© 2026 JumpCut Remove</span>
        </p>
      </footer>
    </main>
  );
}
