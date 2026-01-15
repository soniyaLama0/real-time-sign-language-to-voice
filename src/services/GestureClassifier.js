/**
 * Gesture Classifier Service
 *
 * Analyzes MediaPipe hand landmarks to recognize static gestures.
 * Landmarks are indexed 0-20.
 *
 * 0: Wrist
 * 4: Thumb Tip
 * 8: Index Tip
 * 12: Middle Tip
 * 16: Ring Tip
 * 20: Pinky Tip
 */

export class GestureClassifier {
    constructor() {
        this.lastGesture = null;
        this.consecutiveFrames = 0;
        this.confidenceThreshold = 10; // Frames to confirm gesture
    }

    predict(landmarks) {
        if (!landmarks || landmarks.length === 0) return null;

        const fingers = this.getFingerStates(landmarks);
        const gesture = this.classify(fingers, landmarks);

        return gesture;
    }

    // Returns array of booleans: true if finger is extended, false if curled
    getFingerStates(landmarks) {
        const states = [];

        // Thumb: Compare tip x/y with ip x/y depending on hand orientation
        // Simplification: Check if tip is "far" from wrist compared to MCP
        // For now, let's use a simpler check: Angle or distance from palm center (approx Landmark 9)
        // Actually, simple y-check works for upright hand.
        // Let's use the standard "tip above pip" check for fingers 2-5

        // Index (8 vs 6)
        states.push(landmarks[8].y < landmarks[6].y);
        // Middle (12 vs 10)
        states.push(landmarks[12].y < landmarks[10].y);
        // Ring (16 vs 14)
        states.push(landmarks[16].y < landmarks[14].y);
        // Pinky (20 vs 18)
        states.push(landmarks[20].y < landmarks[18].y);

        // Thumb (4 vs 3 or 2): Thumb is trickier. 
        // Check if thumb tip is to the side of the MCP (joint 2)
        // Assuming right hand for now or general 'outward' extension
        // We can check distance between tip and pinky base (17)
        // Or just check x-coordinates if hand is vertical.
        // Let's rely on auxiliary function for thumb if needed, or simple x-check.
        // For general "openness", checking distance from wrist(0) is good.

        // Let's add a pseudo-state for thumb based on extension
        const thumbExtended = this.isThumbExtended(landmarks);
        states.unshift(thumbExtended); // [Thumb, Index, Middle, Ring, Pinky]

        return states;
    }

    isThumbExtended(landmarks) {
        // Distance from wrist to thumb tip vs wrist to index MCP
        // Or simply check if thumb tip is far from index MCP
        const thumbTip = landmarks[4];
        const indexMCP = landmarks[5];
        const pinkyMCP = landmarks[17];

        // Check distance logic
        const distance = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

        // If thumb tip is further from pinky base than the index base is...
        // Simplistic: Open hand usually has thumb far from palm.
        return distance(thumbTip, pinkyMCP) > distance(indexMCP, pinkyMCP);
    }

    classify(fingers, landmarks) {
        const [thumb, index, middle, ring, pinky] = fingers;
        const numExtended = fingers.filter(f => f).length;

        // 1. Open Palm (Hello / Stop)
        // All fingers extended
        if (thumb && index && middle && ring && pinky) {
            return "Hello";
        }

        // 2. Closed Fist (Rock / No)
        // No fingers extended (Thumb might be tricky, let's say 0 or 1 finger)
        if (!index && !middle && !ring && !pinky) {
            // Check thumbs up specialized
            if (thumb) {
                // Confirm it's pointing UP 
                if (landmarks[4].y < landmarks[3].y && landmarks[4].y < landmarks[2].y) {
                    return "Yes / Thumbs Up";
                }
            }
            return "No / Fist";
        }

        // 3. Victory / Peace
        if (!thumb && index && middle && !ring && !pinky) {
            return "Peace";
        }

        // 4. Pointing
        if (index && !middle && !ring && !pinky) {
            return "Look There";
        }

        // 5. I Love You (ASL)
        // Thumb, Index, Pinky extended. Middle, Ring curled.
        if (thumb && index && !middle && !ring && pinky) {
            return "I Love You";
        }

        // 6. OK Sign (Rough approx)
        // Thumb and index touching (curled/close), others extended
        // Use distance between thumb tip (4) and index tip (8)
        const dThumbIndex = Math.hypot(landmarks[4].x - landmarks[8].x, landmarks[4].y - landmarks[8].y);
        if (dThumbIndex < 0.05 && middle && ring && pinky) {
            return "OK";
        }

        return null; // Unknown gesture
    }
}
