import React, { useEffect, useRef, useState } from 'react';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { HAND_CONNECTIONS } from '@mediapipe/hands';
import { ArrowLeft, Mic, MicOff } from 'lucide-react';

import { GestureClassifier } from '../services/GestureClassifier';
import { speak } from '../services/SpeechService';

const classifier = new GestureClassifier();

const HandRecognizer = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [activeGesture, setActiveGesture] = useState('No Gesture');
    const [history, setHistory] = useState([]);
    const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
    const [lastSpoken, setLastSpoken] = useState(null);

    useEffect(() => {
        const hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            },
        });

        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        hands.onResults(onResults);

        let camera = null;

        if (videoRef.current) {
            camera = new Camera(videoRef.current, {
                onFrame: async () => {
                    if (videoRef.current) {
                        await hands.send({ image: videoRef.current });
                    }
                },
                width: 1280,
                height: 720,
            });
            camera.start();
        }

        return () => {
            if (camera) camera.stop();
            hands.close();
        };
    }, []);

    const onResults = (results) => {
        if (!canvasRef.current || !videoRef.current) return;

        const ctx = canvasRef.current.getContext('2d');
        const { width, height } = canvasRef.current;

        // Clear and draw video frame
        ctx.save();
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(results.image, 0, 0, width, height);

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            for (const landmarks of results.multiHandLandmarks) {
                // Draw Skeleton
                drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { color: '#00f2ff', lineWidth: 4 });
                drawLandmarks(ctx, landmarks, { color: '#bd00ff', lineWidth: 2, radius: 4 });

                // Predict Gesture
                const gesture = classifier.predict(landmarks);

                if (gesture) {
                    handleGestureDetected(gesture);
                } else {
                    setActiveGesture('...');
                }
            }
        }
        ctx.restore();
    };

    const handleGestureDetected = (gesture) => {
        setActiveGesture(gesture);

        // Debounce speech: Only speak if gesture changed or enough time passed?
        // For now, simple logic: only speak if new gesture is stable (handled by UX visually) 
        // AND different from immediate last spoken.

        if (isSpeechEnabled && gesture !== lastSpoken) {
            // Update history
            setHistory(prev => {
                const newHistory = [...prev, gesture];
                if (newHistory.length > 5) newHistory.shift();
                return newHistory;
            });

            speak(gesture);
            setLastSpoken(gesture);

            // Reset lastSpoken after a delay to allow repeating?
            // setTimeout(() => setLastSpoken(null), 3000);
        }
    };

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>

            {/* HUD Overlay */}
            <div style={{
                position: 'absolute', top: '20px', left: '20px', zIndex: 10,
                background: 'rgba(0,0,0,0.6)', padding: '15px', borderRadius: '12px',
                border: '1px solid var(--primary)', backdropFilter: 'blur(4px)'
            }}>
                <h3 className="text-gradient" style={{ margin: 0 }}>Detected: {activeGesture}</h3>
            </div>

            <div style={{
                position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 10,
                display: 'flex', gap: '10px'
            }}>
                <button
                    className="btn-primary glass-panel"
                    onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    {isSpeechEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                    {isSpeechEnabled ? 'Speech ON' : 'Speech Muted'}
                </button>
            </div>

            {/* Video/Canvas Container */}
            <div className="glass-panel" style={{
                position: 'relative', overflow: 'hidden', borderRadius: '20px',
                width: '100%', maxWidth: '960px', margin: '0 auto', aspectRatio: '16/9',
                boxShadow: '0 0 50px rgba(0, 242, 255, 0.1)'
            }}>
                {/* Hidden Video Source */}
                <video
                    ref={videoRef}
                    style={{ display: 'none' }}
                    playsInline
                />

                {/* Visible Canvas */}
                <canvas
                    ref={canvasRef}
                    width={1280}
                    height={720}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </div>

            {/* History Log */}
            <div className="glass-panel" style={{ padding: '1rem', maxWidth: '960px', margin: '0 auto', width: '100%' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Recent: </span>
                {history.map((g, i) => (
                    <span key={i} style={{ marginLeft: '10px', color: '#fff', background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                        {g}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default HandRecognizer;
