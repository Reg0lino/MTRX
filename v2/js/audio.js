// =============================================================================
// js/audio.js - Audio Context and Sound Playback Logic
// Version: 1.47e (Refactored)
// =============================================================================

// --- Global Audio Context Reference ---
// Assumes 'audioCtx' is declared globally in main.js or initialized here safely
// let audioCtx = null; // Or declare here if this is the only place it's used/initialized

// =============================================================================
// Audio Initialization and Playback Functions
// =============================================================================

function initializeAudioContext() {
    // Requires global: audioCtx
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') {
                // Resume requires user interaction, often handled by the initial click
                // We might need to call resume again later if needed.
                console.log("AudioContext is suspended. Will attempt resume on user interaction.");
            }
            console.log("BJS [audio.js]: AudioContext initialized.");
        } catch (e) {
             console.error("Error initializing AudioContext:", e);
        }
    }
}

// Attempts to resume the AudioContext if suspended (call upon user interaction)
function resumeAudioContext() {
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
            console.log("BJS [audio.js]: AudioContext resumed successfully.");
        }).catch(e => {
            console.error("BJS [audio.js]: AudioContext resume failed:", e);
        });
    }
}


function playSound(type = 'shoot', volume = 0.3, duration = 0.05) {
    // Requires global: audioCtx
    if (!audioCtx) {
        // console.warn("AudioContext not ready to play sound:", type); // Avoid spamming
        return;
    }
    // If suspended, try resuming first (might fail if no recent interaction)
    if (audioCtx.state === 'suspended') {
        resumeAudioContext(); // Attempt resume
        // Don't play immediately after resume attempt, wait for state change if needed
        console.warn("AudioContext suspended, attempted resume. Sound may not play immediately:", type);
        return;
    }
    // If running, play the sound
    if (audioCtx.state === 'running') {
        playSoundInternal(type, volume, duration);
    }
}

function playSoundInternal(type, volume, duration) {
    // Requires global: audioCtx
     if (!audioCtx || audioCtx.state !== 'running') return; // Final check

     try {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
        let freq = 440, waveType = 'sine', endFreq = freq;

        switch(type) {
            case 'shoot': freq = 660; endFreq = 110; waveType = 'sawtooth'; duration = 0.08; break;
            case 'reload': freq = 220; endFreq = 180; waveType = 'square'; duration = 0.2; gainNode.gain.linearRampToValueAtTime(volume * 0.5, audioCtx.currentTime + duration * 0.8); break;
            case 'hit_wall': freq = 150; endFreq = 100; waveType = 'square'; duration = 0.1; volume = 0.2; break;
            case 'hit_agent': freq = 880; endFreq = 550; waveType = 'triangle'; duration = 0.15; volume = 0.4; break;
            case 'agent_death': freq = 330; endFreq = 50; waveType = 'sawtooth'; duration = 0.4; volume = 0.5; break;
            case 'player_hit': freq = 200; endFreq = 150; waveType = 'square'; duration = 0.15; volume = 0.6; break;
            case 'player_hit_feedback': freq = 1000; endFreq = 1000; waveType = 'sine'; duration = 0.05; volume = 0.15; gainNode.gain.setValueAtTime(volume * 0.5, audioCtx.currentTime + duration * 0.1); break;
            case 'game_over': freq = 440; endFreq = 110; waveType = 'sawtooth'; duration = 1.5; volume = 0.6; break;
            case 'game_win': freq = 523; endFreq = 1046; waveType = 'sine'; duration = 1.8; volume = 0.6; break;
            case 'agent_shoot': freq = 550; endFreq = 220; waveType = 'sawtooth'; duration = 0.1; volume = 0.25; break;
            case 'melee_hit': freq = 300; endFreq = 200; waveType = 'square'; duration = 0.12; volume = 0.5; break;
            case 'rabbit_pickup': freq = 880; endFreq = 1760; waveType = 'triangle'; duration = 0.3; volume = 0.45; gainNode.gain.exponentialRampToValueAtTime(volume * 1.5, audioCtx.currentTime + duration * 0.5); break;
            default: duration = 0.05; break;
        }
        oscillator.type = waveType;
        oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(Math.max(0.01, endFreq), audioCtx.currentTime + duration); // Avoid 0 freq
        gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) { console.error("Error playing sound:", e); }
}

/*
// =============================================================================
// == Three.js Reference (Audio) ==
// =============================================================================
// // Similar structure using Web Audio API directly.
// let audioCtx = null;
// function initializeAudioContext() { ... }
// function playSound(...) { ... if (!audioCtx) return; if (suspended) resume ... playSoundInternal(...) }
// function playSoundInternal(...) { ... createOscillator, GainNode, set params, connect, start/stop ... }
*/