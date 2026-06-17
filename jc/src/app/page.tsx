import VideoPanel from '../components/VideoPanel';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main} style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Cabeçalho Principal */}
        <header style={{ textAlign: 'center', marginBottom: '50px', marginTop: '20px' }}>
          <div style={{ display: 'inline-block', backgroundColor: 'rgba(203, 251, 69, 0.1)', color: '#cbfb45', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
            ⚡ Local Browser Processing
          </div>
          <h1 style={{ fontSize: '3.2rem', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '5px', color: '#fff', lineHeight: '1.1' }}>
            Remove silences from videos
          </h1>
          <h2 style={{ fontSize: '2.6rem', fontWeight: '900', color: '#cbfb45', marginBottom: '20px', letterSpacing: '-0.02em' }}>
            free, fast, in your browser.
          </h2>
          <p style={{ color: '#888', fontSize: '1.05rem', lineHeight: '1.6', maxWidth: '620px', margin: '0 auto' }}>
            Automatically cut dead air and awkward pauses from your videos and podcasts.
            Processed completely locally on your device. No uploads. No limits.
          </p>
        </header>

        {/* Os 3 Cards de Passos (Recuperados da sua imagem original) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '50px' }}>
          <div style={{ backgroundColor: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '24px' }}>
            <div style={{ color: '#cbfb45', fontSize: '1.4rem', fontWeight: '900', marginBottom: '6px' }}>01</div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', marginBottom: '6px', color: '#fff' }}>Choose a file</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.5' }}>Select or drag your video or audio file. It loads instantly since nothing is uploaded to any server.</p>
          </div>
          
          <div style={{ backgroundColor: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '24px' }}>
            <div style={{ color: '#cbfb45', fontSize: '1.4rem', fontWeight: '900', marginBottom: '6px' }}>02</div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', marginBottom: '6px', color: '#fff' }}>Adjust settings</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.5' }}>Fine-tune the cut sensitivity, minimum silence duration, and padding parameters to keep it natural.</p>
          </div>
          
          <div style={{ backgroundColor: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '24px' }}>
            <div style={{ color: '#cbfb45', fontSize: '1.4rem', fontWeight: '900', marginBottom: '6px' }}>03</div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', marginBottom: '6px', color: '#fff' }}>Download or Export</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.5' }}>Render your cut video instantly in high quality, or export a lightweight XML timeline file for editors.</p>
          </div>
        </div>

        {/* Ferramenta Principal (O Painel de Vídeo com o motor ultra rápido) */}
        <div style={{ marginBottom: '60px' }}>
          <VideoPanel />
        </div>

        {/* Secção de Perguntas Frequentes (FAQ) */}
        <section style={{ marginTop: '80px', borderTop: '1px solid #1a1a1a', paddingTop: '50px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '35px', color: '#fff', letterSpacing: '-0.02em' }}>
            Frequently Asked Questions
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            <div style={{ backgroundColor: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>What file formats are supported?</h3>
              <p style={{ color: '#777', fontSize: '0.95rem', lineHeight: '1.5' }}>Video: MP4, MOV, WEBM, MKV. Audio: MP3, WAV, OGG, M4A, FLAC. Output is MP4 for most video inputs and WAV for audio.</p>
            </div>

            <div style={{ backgroundColor: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>Is there a file size limit?</h3>
              <p style={{ color: '#777', fontSize: '0.95rem', lineHeight: '1.5' }}>No limits set by us. Practical limits depend on your device RAM — most modern computers handle files up to 1-2 GB without issues.</p>
            </div>

            <div style={{ backgroundColor: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>How is this different from Descript or Recut?</h3>
              <p style={{ color: '#777', fontSize: '0.95rem', lineHeight: '1.5' }}>JumpCut Remove is free, requires no account, and processes everything locally on your device. Descript and Recut are cloud-based subscription tools. We are the best choice for privacy-conscious creators or anyone who does not want to pay a monthly fee.</p>
            </div>

            <div style={{ backgroundColor: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>Does it work on mobile?</h3>
              <p style={{ color: '#777', fontSize: '0.95rem', lineHeight: '1.5' }}>It works on modern mobile browsers, but processing large video files on mobile is slow due to limited RAM and CPU. For best results, use a desktop or laptop.</p>
            </div>
          </div>
        </section>

        {/* Rodapé Legal e Limpo */}
        <footer style={{ marginTop: '80px', textAlign: 'center', borderTop: '1px solid #1a1a1a', paddingTop: '40px', paddingBottom: '30px' }}>
          <p style={{ color: '#555', fontSize: '#0.85rem', marginBottom: '16px', fontWeight: '500' }}>
            🔒 100% free · no account · no upload · no watermark
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <a href="/privacy-policy" style={{ color: '#444', fontSize: '0.85rem', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="/terms-of-use" style={{ color: '#444', fontSize: '0.85rem', textDecoration: 'none' }}>Terms of Use</a>
            <span style={{ color: '#333', fontSize: '0.85rem' }}>© 2026 JumpCut Remove</span>
          </div>
        </footer>

      </div>
    </main>
  );
}
