export const speak = (text) => {
    if (!text) return;

    // Cancel current speech if any to avoid queue buildup? 
    // Maybe not, we want to finish the current phrase.
    // window.speechSynthesis.cancel(); 

    const utterance = new SpeechSynthesisUtterance(text);

    // Select a voice if possible (prefer female/natural)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Natural')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.rate = 1;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
};
