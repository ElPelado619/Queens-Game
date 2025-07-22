const sounds = {};
const trimTimes = {
    place: 0.4,
    remove: 0.38,
    win: 0
};
const pitchRates = {
    place: 1.2,
    remove: 0.45,
    win: 1
};
const speed = {
    place: 1.0,
    remove: 1.85,
    win: 1
};
const volume = {
    place: 0.5,
    remove: 0.5,
    win: 0.4
};

let muted = false;

const audioBasePath = (import.meta.env.BASE_URL || '/') + 'audio/'; // adapt to development or production
export function loadSounds() {
    sounds.place = new Audio(audioBasePath + 'place.mp3');
    sounds.remove = new Audio(audioBasePath + 'place.mp3');
    sounds.win = new Audio(audioBasePath + 'win.mp3');
    
    // Set initial volumes
    sounds.place.volume = volume.place;
    sounds.remove.volume = volume.remove;
    sounds.win.volume = volume.win;
}

export function playSound(soundName) {
    if(muted) return;

    if (!sounds[soundName]) {
        console.warn(`Sound "${soundName}" not loaded`);
        return;
    }
    
    try {
        const soundClone = new Audio(sounds[soundName].src);
        
        // Apply all effects
        soundClone.currentTime = trimTimes[soundName];
        soundClone.playbackRate = pitchRates[soundName] * speed[soundName];
        soundClone.volume = volume[soundName];
        
        soundClone.play()
            .catch(e => {
                console.warn("Audio play failed:", e);
                // Fallback with all effects
                try {
                    const fallback = new Audio(`/audio/${soundName === 'remove' ? 'place' : soundName}.mp3`);
                    fallback.currentTime = trimTimes[soundName];
                    fallback.playbackRate = pitchRates[soundName] * speed[soundName];
                    fallback.volume = volume[soundName];
                    fallback.play();
                } catch (fallbackError) {
                    console.warn("Fallback failed:", fallbackError);
                }
            });
    } catch (e) {
        console.warn("Sound playback error:", e);
    }
}

export function initAudio() {
    const unlock = () => {
        const silent = new Audio();
        silent.volume = 0;
        silent.play().then(() => silent.remove());
        document.removeEventListener('click', unlock);
        document.removeEventListener('touchstart', unlock);
    };
    document.addEventListener('click', unlock, { once: true });
    document.addEventListener('touchstart', unlock, { once: true });
}

// Initialize
loadSounds();
initAudio();

document.getElementById("volume").addEventListener("click", () => {
    const volume_icon = document.getElementById("volume");
    if (muted) {
        volume_icon.classList.remove("volume_off");
        volume_icon.classList.add("volume_on");
        muted = false;
    } else {
        volume_icon.classList.remove("volume_on");
        volume_icon.classList.add("volume_off");
        muted = true;
    }
});
