'use client';

import { useState, useRef, useCallback } from 'react';

import {
  getAudioCtx,
  fmt,
  tick,
  getSilenceRegions,
  getKeepRegions,
  buildCleanAudioBuffer,
  drawWaveform,
  bufferToWav
} from '@/lib/audio';

import styles from './Panel.module.css';

interface AudioPanelProps {
  proUnlocked: boolean;
  onRequestDownload: () => void;
  downloadTrigger: number;
}

export default function AudioPanel({
  proUnlocked,
  onRequestDownload,
  downloadTrigger
}: AudioPanelProps) {

  const [file, setFile] = useState<File | null>(null);

  const [audioBuffer, setAudioBuffer] =
    useState<AudioBuffer | null>(null);

  const [blob, setBlob] = useState<Blob | null>(null);

  const [fileMeta, setFileMeta] = useState('');

  const [dragging, setDragging] = useState(false);

  const [threshold, setThreshold] = useState(0.01);

  const [minSilence, setMinSilence] = useState(300);

  const [padding, setPadding] = useState(50);

  const [format, setFormat] = useState('wav');

  const [progress, setProgress] = useState<{
    label: string;
    pct: number;
  } | null>(null);

  const [stats, setStats] = useState<{
    orig: string;
    newDur: string;
    removed: string;
  } | null>(null);

  const [error, setError] = useState('');

  const [info, setInfo] = useState('');

  const [showTimeline, setShowTimeline] =
    useState(false);

  const [showResult, setShowResult] =
    useState(false);

  const [resultUrl, setResultUrl] = useState('');

  const canvasRef =
    useRef<HTMLCanvasElement>(null);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const blobRef =
    useRef<Blob | null>(null);

  const fileRef =
    useRef<File | null>(null);

  const redrawWaveform = useCallback(
    (
      buf: AudioBuffer,
      thr: number,
      minSil: number
    ) => {

      if (canvasRef.current) {

        drawWaveform(
          canvasRef.current,
          buf,
          thr,
          minSil / 1000
        );
      }

    },
    []
  );

  const loadAudio = async (f: File) => {

    setFile(f);

    fileRef.current = f;

    setBlob(null);

    blobRef.current = null;

    setShowResult(false);

    setStats(null);

    setShowTimeline(false);

    setInfo('');

    setError('');

    setFileMeta(
      (f.size / 1024 / 1024).toFixed(1) + ' MB'
    );

    setProgress({
      label: 'Reading audio...',
      pct: 15
    });

    try {

      const buf =
        await getAudioCtx().decodeAudioData(
          await f.arrayBuffer()
        );

      setAudioBuffer(buf);

      setFileMeta(
        `${(f.size / 1024 / 1024).toFixed(1)} MB · ${fmt(buf.duration)} · ${buf.sampleRate} Hz`
      );

      setShowTimeline(true);

      setTimeout(() => {

        redrawWaveform(
          buf,
          threshold,
          minSilence
        );

      }, 50);

    } catch {

      setError(
        'Could not read this file. Try MP3, WAV or OGG.'
      );
    }

    setProgress(null);
  };

  const processAudio = async () => {

    if (!audioBuffer) return;

    setInfo('');

    setError('');

    const thr = threshold;

    const minSilSec = minSilence / 1000;

    const padSec = padding / 1000;

    const totalDur = audioBuffer.duration;

    setProgress({
      label: 'Finding silences...',
      pct: 20
    });

    await tick();

    const silRegions =
      getSilenceRegions(
        audioBuffer,
        thr,
        minSilSec
      );

    const keepRegions =
      getKeepRegions(
        silRegions,
        totalDur,
        padSec
      );

    if (keepRegions.length === 0) {

      setProgress(null);

      setError(
        'No speech found. Lower the cut sensitivity and try again.'
      );

      return;
    }

    setProgress({
      label: 'Cutting silences...',
      pct: 50
    });

    await tick();

    const newBuf =
      buildCleanAudioBuffer(
        audioBuffer,
        keepRegions
      );

    setProgress({
      label: 'Encoding audio...',
      pct: 80
    });

    await tick();

    const newBlob = bufferToWav(newBuf);

    blobRef.current = newBlob;

    setBlob(newBlob);

    setStats({
      orig: fmt(totalDur),
      newDur: fmt(newBuf.duration),
      removed:
        '-' + fmt(totalDur - newBuf.duration)
    });

    setResultUrl(
      URL.createObjectURL(newBlob)
    );

    setShowResult(true);

    redrawWaveform(
      audioBuffer,
      thr,
      minSilSec
    );

    setProgress(null);

    const proMsg = 'Click <strong>Download</strong> to save your file.';

    setInfo(
      `✓ Done! ${silRegions.length} silence(s) removed. ${proMsg}`
    );
  };

  const doDownload = useCallback(() => {


    const b = blobRef.current;

    const f = fileRef.current;

    if (!b) return;

    const a = document.createElement('a');

    a.href = URL.createObjectURL(b);

    a.download =
      (f?.name || 'audio').replace(
        /\.[^.]+$/,
        ''
      ) + '_no_silence.wav';

    a.click();

  }, []);

  const prevTrigger = useRef(0);

  if (downloadTrigger !== prevTrigger.current) {

    prevTrigger.current =
      downloadTrigger;

    if (
      downloadTrigger > 0 &&
      proUnlocked
    ) {

      doDownload();
    }
  }

  return (

    <div className={styles.card}>

      <div
        className={`${styles.dropZone} ${
          dragging ? styles.dragover : ''
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() =>
          setDragging(false)
        }
        onDrop={(e) => {

          e.preventDefault();

          setDragging(false);

          if (e.dataTransfer.files[0]) {

            loadAudio(
              e.dataTransfer.files[0]
            );
          }

        }}
        onClick={() =>
          fileInputRef.current?.click()
        }
      >

        <div className={styles.dzIcon}>
          🎵
        </div>

        <p className={styles.dzTitle}>
          Drop your audio file here or click to choose
        </p>

        <p className={styles.dzSub}>
          MP3 · WAV · OGG · M4A · FLAC — processed locally, never uploaded
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          style={{ display: 'none' }}
          onChange={(e) => {

            if (e.target.files?.[0]) {

              loadAudio(
                e.target.files[0]
              );
            }

          }}
        />

      </div>

      {file && (

        <div className={styles.fileInfo}>

          <span style={{ fontSize: 20 }}>
            🎵
          </span>

          <div>

            <p className={styles.fiName}>
              {file.name}
            </p>

            <p className={styles.fiMeta}>
              {fileMeta}
            </p>

          </div>

        </div>

      )}

      <div className={styles.controls}>

        <div className={styles.ctrl}>

          <label>
            Cut sensitivity
          </label>

          <input
            type="range"
            min="0.001"
            max="0.05"
            step="0.001"
            value={threshold}
            onChange={(e) => {

              const v =
                parseFloat(e.target.value);

              setThreshold(v);

              if (audioBuffer) {

                redrawWaveform(
                  audioBuffer,
                  v,
                  minSilence
                );
              }

            }}
          />

        </div>

        <div className={styles.ctrl}>

          <label>
            Minimum silence
          </label>

          <input
            type="range"
            min="50"
            max="1000"
            step="10"
            value={minSilence}
            onChange={(e) => {

              const v =
                parseInt(e.target.value);

              setMinSilence(v);

              if (audioBuffer) {

                redrawWaveform(
                  audioBuffer,
                  threshold,
                  v
                );
              }

            }}
          />

          <div className={styles.rangeLabels}>
            <span>50ms</span>
            <span>{minSilence}ms</span>
            <span>1000ms</span>
          </div>

        </div>

        <div className={styles.ctrl}>

          <label>
            Natural pause padding
          </label>

          <input
            type="range"
            min="0"
            max="500"
            step="10"
            value={padding}
            onChange={(e) => {
              setPadding(
                parseInt(e.target.value)
              );
            }}
          />

          <div className={styles.rangeLabels}>
            <span>Tighter</span>
            <span>{padding}ms</span>
            <span>Looser</span>
          </div>

        </div>

        <div className={styles.ctrl}>

          <label>
            Output format
          </label>

          <select
            value={format}
            onChange={(e) => {
              setFormat(e.target.value);
            }}
            className={styles.select}
          >

            <option value="wav">
              WAV (lossless)
            </option>

            <option value="mp3">
              MP3
            </option>

          </select>

        </div>

      </div>

      {showTimeline && (

        <div className={styles.timelineWrap}>

          <canvas
            ref={canvasRef}
            className={styles.waveformCanvas}
          />

        </div>

      )}

      {progress && (

        <div className={styles.progressWrap}>

          <div className={styles.progHead}>

            <span className={styles.progLabel}>
              {progress.label}
            </span>

            <span className={styles.progPct}>
              {Math.round(progress.pct)}%
            </span>

          </div>

          <div className={styles.progTrack}>

            <div
              className={styles.progBar}
              style={{
                width: `${progress.pct}%`
              }}
            />

          </div>

        </div>

      )}

      <div className={styles.actions}>

        <button
          className={styles.btnProcess}
          disabled={!audioBuffer || !!progress}
          onClick={processAudio}
        >
          ▶ Remove silences
        </button>

        {blob && (

          <button
            className={`${styles.btnDownload} ${styles.proUnlocked}`}
            onClick={doDownload}
          >
            ↓ {
              'Download'
            }
          </button>

        )}

      </div>

      {showResult && (

        <div className={styles.resultWrap}>

          <p
            className={styles.secLabel}
            style={{ marginBottom: 6 }}
          >
            Preview result (15s)
          </p>

          <audio
            controls
            controlsList="nodownload noplaybackrate"
            src={resultUrl}
            onContextMenu={(e) => e.preventDefault()}
            onLoadedMetadata={(e) => {
              e.currentTarget.currentTime = 0;
            }}
            onTimeUpdate={(e) => {

              if (e.currentTarget.currentTime >= 15) {

                e.currentTarget.pause();

                e.currentTarget.currentTime = 0;
              }

            }}
          />

        </div>

      )}

      {stats && (

        <div className={styles.stats}>

          <div>
            Original: {stats.orig}
          </div>

          <div>
            Final: {stats.newDur}
          </div>

          <div>
            Removed: {stats.removed}
          </div>

        </div>

      )}

      {error && (

        <div className={styles.msgError}>
          ⚠ {error}
        </div>

      )}

      {info && (

        <div
          className={styles.msgInfo}
          dangerouslySetInnerHTML={{
            __html: info
          }}
        />

      )}

    </div>
  );
}