import VideoPanel from '../components/VideoPanel';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main} style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* Cabeçalho da Landing Page */}
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff', marginBottom: '10px' }}>
          Remove silences from videos
        </h1>
        <h2 style={{ fontSize: '1.5rem', color: '#cbfb45', marginBottom: '20px' }}>
          free, fast, in your browser.
        </h2>
        <p style={{ color: '#a0a0a0', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto' }}>
          Automatically cut dead air and awkward pauses from your videos and podcasts.
          Processed completely locally on your device. No uploads. No limits.
        </p>
      </header>

      {/* A Ferramenta Principal */}
      <VideoPanel />

      {/* Secção de Perguntas Frequentes (FAQ) - Essencial para o Google SEO/AdSense */}
      <section style={{ marginTop: '80px' }}>
        
        <div style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>What file formats are supported?</h3>
          <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.5' }}>Video: MP4, MOV, WEBM, MKV. Audio: MP3, WAV, OGG, M4A, FLAC. Output is MP4 for most video inputs and WAV for audio.</p>
        </div>

        <div style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>Is there a file size limit?</h3>
          <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.5' }}>No limits set by us. Practical limits depend on your device RAM — most modern computers handle files up to 1-2 GB without issues.</p>
        </div>

        <div style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>How is this different from Descript or Recut?</h3>
          <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.5' }}>JumpCut Remove is free, requires no account, and processes everything locally on your device. Descript and Recut are cloud-based subscription tools. We are the best choice for privacy-conscious creators or anyone who does not want to pay a monthly fee.</p>
        </div>

        <div style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>Does it work on mobile?</h3>
          <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.5' }}>It works on modern mobile browsers, but processing large video files on mobile is slow due to limited RAM and CPU. For best results, use a desktop or laptop.</p>
        </div>
      </section>

      {/* Rodapé (Footer) - Obrigatório para aprovação do AdSense */}
      <footer style={{ marginTop: '60px', textAlign: 'center', borderTop: '1px solid #222', paddingTop: '40px', paddingBottom: '40px' }}>
        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '16px' }}>
          🔒 100% free · no account · no upload · no watermark
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <a href="/privacy-policy" style={{ color: '#666', fontSize: '0.85rem', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="/terms-of-use" style={{ color: '#666', fontSize: '0.85rem', textDecoration: 'none' }}>Terms of Use</a>
          <span style={{ color: '#555', fontSize: '0.85rem' }}>© 2026 JumpCut Remove</span>
        </div>
      </footer>

    </main>
  );
}
