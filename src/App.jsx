import React, { useState } from 'react';
import { Camera, Volume2, Globe, Cpu } from 'lucide-react';
import './index.css';

// Placeholder for the main feature component
import HandRecognizer from './components/HandRecognizer';

function App() {
    const [isStarted, setIsStarted] = useState(false);

    return (
        <div className="app-container">
            {/* Header */}
            <header className="glass-panel" style={{ padding: '1rem 2rem', margin: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Cpu className="text-gradient" size={32} />
                    <h1 className="text-gradient" style={{ margin: 0, fontSize: '1.5rem' }}>SIGNANTI</h1>
                </div>
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Camera size={18} /> Vision Active</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Volume2 size={18} /> Voice Ready</span>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                {!isStarted ? (
                    <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '600px' }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Bridge the Silence</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
                            Advanced AI-powered Sign Language Recognition system.
                            Translate gestures into speech in real-time.
                        </p>
                        <button className="btn-primary animate-pulse-ring" onClick={() => setIsStarted(true)} style={{ fontSize: '1.2rem', padding: '1rem 3rem' }}>
                            Initialize System
                        </button>
                    </div>
                ) : (
                    <HandRecognizer />
                )}
            </main>

            {/* Footer */}
            <footer style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <p>Powered by MediaPipe & Web Speech API • v0.1.0 Beta</p>
            </footer>
        </div>
    );
}

export default App;
