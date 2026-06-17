'use client';

import { useState, useEffect, useRef } from 'react';

import styles from './ProModal.module.css';

interface ProModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlocked: () => void;
}

export default function ProModal({
  isOpen,
  onClose,
  onUnlocked
}: ProModalProps) {

  const [code, setCode] = useState('');

  const [error, setError] = useState(false);

  const [shaking, setShaking] = useState(false);

  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {

    if (isOpen) {

      setCode('');
      setError(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 120);
    }

  }, [isOpen]);

  useEffect(() => {

    const handleKey = (e: KeyboardEvent) => {

      if (e.key === 'Escape' && isOpen) {
        onClose();
      }

    };

    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('keydown', handleKey);
    };

  }, [isOpen, onClose]);

  const validate = async () => {

    const typed = code.trim();

    if (!typed) {
      setError(true);
      return;
    }

    setLoading(true);

    try {

      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: typed
        })
      });

      const data = await res.json();

      console.log('VALIDATE RESPONSE:', data);

      if (data.valid === true) {

        sessionStorage.setItem('jc_pro', '1');

        onUnlocked();

        onClose();

        return;
      }

      setError(true);

      setShaking(true);

      setTimeout(() => {
        setShaking(false);
      }, 400);

    } catch (err) {

      console.error(err);

      setError(true);

    } finally {

      setLoading(false);

    }
  };

  if (!isOpen) return null;

  return (

    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >

      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pro-title"
      >

        <button
          className={styles.close}
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <div className={styles.badge}>
          ★ PRO
        </div>

        <h2
          id="pro-title"
          className={styles.title}
        >
          Download locked
        </h2>

        <p className={styles.desc}>
          Processing and preview are always free.
          <br />
          Enter your PRO access code to download the file.
        </p>

        <input
          ref={inputRef}
          className={`${styles.input} ${
            shaking ? styles.shake : ''
          } ${
            error ? styles.inputError : ''
          }`}
          type="text"
          placeholder="YOUR-PRO-CODE"
          maxLength={40}
          autoComplete="off"
          spellCheck={false}
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              validate();
            }
          }}
        />

        {error && (
          <div className={styles.error}>
            ⚠ Invalid code. Please check and try again.
          </div>
        )}

        <button
          className={styles.btn}
          onClick={validate}
          disabled={loading}
        >
          {loading
            ? 'Checking...'
            : 'Unlock download ↓'}
        </button>

        <div className={styles.divider}>
          don't have a code?
        </div>

        <a
          className={styles.upgrade}
          href="mailto:YOUR-EMAIL@gmail.com?subject=I%20want%20PRO%20access%20JumpCut"
          target="_blank"
          rel="noopener noreferrer"
        >
          Get PRO access →
        </a>

      </div>

    </div>
  );
}