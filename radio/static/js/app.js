const audio = document.getElementById('audio');
const startButton = document.getElementById('startButton');
const muteButton = document.getElementById('muteButton');
const volume = document.getElementById('volume');
const record = document.querySelector('.record');
const songTitle = document.getElementById('songTitle');
const songArtist = document.getElementById('songArtist');
const songYear = document.getElementById('songYear');
const status = document.getElementById('status');
const timeEl = document.getElementById('time');
const ampmEl = document.getElementById('ampm');
const dateEl = document.getElementById('date');
const hourIndicator = document.getElementById('hourIndicator');
const songProgress = document.getElementById('songProgress');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');

let playlist = [];
let currentIndex = -1;
let started = false;



const themes = [
    { accent: '#67e88b' }, // Green
    { accent: '#63d9ff' }, // Cyan
    { accent: '#5b8cff' }, // Blue
    { accent: '#9b7cff' }, // Purple
    { accent: '#ff718d' }, // Pink
    { accent: '#ffad5c' }  // Orange
];

function getTheme(hour) {
  return themes.find(t => hour >= t.start && hour < t.end) || themes[0];
}

function applyTheme() {
    const now = new Date();

    // Changes every minute
    const minute = now.getMinutes();

    // Six different colors, each lasting 10 seconds
    // This completes one full color cycle every minute.
    const index = Math.floor((minute * 60 + now.getSeconds()) / 10) % 6;

    const theme = themes[index];

    document.documentElement.style.setProperty('--accent', theme.accent);
}

function hexToRgba(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

const hourDigits = document.getElementById('hourDigits');
const minuteDigits = document.getElementById('minuteDigits');
const secondsDigits = document.getElementById('secondsDigits');

function createDigitReel(container, value) {
    container.innerHTML = '';

    for (const digit of value) {
        const window = document.createElement('span');
        window.className = 'digit-window';

        const reel = document.createElement('span');
        reel.className = 'digit-reel';

        // 0-9 plus one extra 0 for smooth looping
        for (let i = 0; i <= 10; i++) {
            const digitElement = document.createElement('span');
            digitElement.className = 'digit';
            digitElement.textContent = i % 10;
            reel.appendChild(digitElement);
        }

        window.appendChild(reel);
        container.appendChild(window);

        reel.style.transform = `translateY(-${Number(digit)}em)`;
    }
}


function rollDigit(container, newValue, animate = true) {
    const oldValue = container.dataset.value || '';

    if (oldValue === newValue) {
        return;
    }

    const oldDigits = oldValue.padStart(2, '0');
    const newDigits = newValue.padStart(2, '0');

    const windows = [...container.querySelectorAll('.digit-window')];

    // If this is the first render
    if (windows.length !== 2) {
        createDigitReel(container, newValue);
        container.dataset.value = newValue;
        return;
    }

    windows.forEach((window, index) => {
        const reel = window.querySelector('.digit-reel');

        const oldDigit = Number(oldDigits[index]);
        const newDigit = Number(newDigits[index]);

        if (oldDigit === newDigit) {
            return;
        }

        reel.style.transition = animate
            ? 'transform 900ms cubic-bezier(0.18, 0.72, 0.18, 1)'
            : 'none';

        /*
         * Normal transition:
         *
         * 4 -> 5
         * 5 -> 6
         * 8 -> 9
         */
        if (newDigit > oldDigit) {
            reel.style.transform = `translateY(-${newDigit}em)`;
        }

        /*
         * 09 -> 10
         *
         * The second digit rolls from 9 -> 0
         * while the first digit rolls 0 -> 1.
         */
        else if (oldDigit === 9 && newDigit === 0) {
            reel.style.transform = 'translateY(-10em)';

            setTimeout(() => {
                reel.style.transition = 'none';
                reel.style.transform = 'translateY(0em)';
            }, 920);
        }

        /*
         * Safety for any backwards transition.
         */
        else {
            reel.style.transition = 'none';
            reel.style.transform = `translateY(-${newDigit}em)`;
        }
    });

    container.dataset.value = newValue;
}


let lastHour = '';
let lastMinute = '';
let lastSecond = '';


function updateClock() {
    const now = new Date();

    let hours = now.getHours();

    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12;

    const hourString = String(hours).padStart(2, '0');


    // Initial clock render
    if (!lastHour) {
        createDigitReel(hourDigits, hourString);
        hourDigits.dataset.value = hourString;
        lastHour = hourString;
    }

    if (!lastMinute) {
        createDigitReel(minuteDigits, minutes);
        minuteDigits.dataset.value = minutes;
        lastMinute = minutes;
    }

    if (!lastSecond) {
        createDigitReel(secondsDigits, seconds);
        secondsDigits.dataset.value = seconds;
        lastSecond = seconds;
    }


    // Hours
    if (lastHour !== hourString) {
        rollDigit(hourDigits, hourString);
        lastHour = hourString;
    }


    // Minutes
    if (lastMinute !== minutes) {
        rollDigit(minuteDigits, minutes);
        lastMinute = minutes;
    }


    // Seconds
    if (lastSecond !== seconds) {
        rollDigit(secondsDigits, seconds);
        lastSecond = seconds;
    }


    ampmEl.textContent = ampm;

    dateEl.textContent = now.toLocaleDateString(undefined, {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    hourIndicator.textContent =
        `${String(now.getHours()).padStart(2, '0')}:00 · 24 / 7 RADIO`;

    applyTheme(now.getHours());
}
async function loadPlaylist() {
  try {
    const response = await fetch('/songs/', { cache: 'no-store' });
    if (!response.ok) throw new Error('Playlist unavailable');
    playlist = await response.json();

    if (playlist.length) {
      status.textContent = `${playlist.length} TRACK${playlist.length === 1 ? '' : 'S'} · READY`;
      songTitle.textContent = 'Press START RADIO';
      songArtist.textContent = 'Your playlist is loaded';
      songYear.textContent = '';
      muteButton.disabled = false;
    } else {
      status.textContent = 'ADD MP3 FILES TO THE MUSIC FOLDER';
    }
  } catch (error) {
    status.textContent = 'PLAYLIST ERROR';
    console.error(error);
  }
}

function showTrack(track) {
  songTitle.textContent = track.title || 'Unknown Song';
  songArtist.textContent = track.artist || 'Unknown Artist';
  songYear.textContent = track.year || '';
}

async function playTrack(index) {
  if (!playlist.length) return;

  currentIndex = ((index % playlist.length) + playlist.length) % playlist.length;
  const track = playlist[currentIndex];
  showTrack(track);
  audio.src = track.file;
  songProgress.style.width = '0%';
  audio.currentTime = 0;

  try {
    await audio.play();
    started = true;
    record.classList.add('playing');
    startButton.textContent = 'Ⅱ PLAYING';
    status.textContent = `ON AIR · ${currentIndex + 1} / ${playlist.length}`;
  } catch (error) {
    started = false;
    record.classList.remove('playing');
    startButton.textContent = '▶ START RADIO';
    status.textContent = 'CLICK START RADIO TO PLAY';
    console.error(error);
  }
}

// audio.addEventListener('ended', () => playTrack(currentIndex + 1));

audio.addEventListener('ended', () => {
    console.log('SONG ENDED');
    console.log('Current index:', currentIndex);
    console.log('Playlist length:', playlist.length);
    console.log('Next track:', currentIndex + 1, playlist[currentIndex + 1]);

    playTrack(currentIndex + 1);
});

audio.addEventListener('error', () => {
  status.textContent = 'TRACK ERROR · SKIPPING';
  setTimeout(() => playTrack(currentIndex + 1), 700);
});

audio.addEventListener('timeupdate', () => {
    if (!audio.duration || !isFinite(audio.duration)) {
        songProgress.style.width = '0%';
        return;
    }

    const percentage =
        (audio.currentTime / audio.duration) * 100;

    songProgress.style.width = `${percentage}%`;
});

startButton.addEventListener('click', async () => {
  if (!playlist.length) {
    status.textContent = 'ADD MP3s TO radio/static/music/ FIRST';
    return;
  }

  if (started && !audio.paused) {
    audio.pause();
    record.classList.remove('playing');
    startButton.textContent = '▶ RESUME RADIO';
    status.textContent = 'PAUSED';
    return;
  }

  if (audio.src && currentIndex >= 0) {
    await audio.play();
    started = true;
    record.classList.add('playing');
    startButton.textContent = 'Ⅱ PLAYING';
    status.textContent = `ON AIR · ${currentIndex + 1} / ${playlist.length}`;
  } else {
    await playTrack(0);
  }
});

muteButton.addEventListener('click', () => {
  audio.muted = !audio.muted;
  muteButton.textContent = audio.muted ? '🔇' : '🔊';
});

volume.addEventListener('input', () => {
  audio.volume = Number(volume.value);
  if (audio.volume > 0 && audio.muted) {
    audio.muted = false;
    muteButton.textContent = '🔊';
  }
});

audio.volume = Number(volume.value);
updateClock();
setInterval(updateClock, 1000);
loadPlaylist();

/* Lightweight moving dot field. Dots slowly drift, breathe and react to the
   current time-of-day accent. It uses canvas so hundreds of tiny points don't
   require hundreds of DOM elements. */
const canvas = document.getElementById('dotCanvas');
const ctx = canvas.getContext('2d');
let dots = [];
let dpr = Math.min(window.devicePixelRatio || 1, 2);

function resizeCanvas() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;

  const density = Math.min(520, Math.max(180, Math.floor((innerWidth * innerHeight) / 4300)));
  dots = Array.from({ length: density }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    vx: (Math.random() - .5) * .5,
    vy: (Math.random() - .5) * .5,
    phase: Math.random() * Math.PI * 2,
    size: Math.random() * 1.15 + .35
  }));
}

function accentRGB() {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  const n = parseInt(value.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function drawDots(time) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, innerWidth, innerHeight);

  const [r, g, b] = accentRGB();

  for (const dot of dots) {
    dot.x += dot.vx + Math.sin(time * .00025 + dot.phase) * .035;
    dot.y += dot.vy + Math.cos(time * .00020 + dot.phase) * .030;
    

    if (dot.x < -10) dot.x = innerWidth + 10;
    if (dot.x > innerWidth + 10) dot.x = -10;
    if (dot.y < -10) dot.y = innerHeight + 10;
    if (dot.y > innerHeight + 10) dot.y = -10;

    const pulse = .35 + (Math.sin(time * .005 + dot.phase) + 1) * .22;
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${pulse})`;
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(drawDots);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
requestAnimationFrame(drawDots);


// prev next button
prevButton.addEventListener('click', () => {
    if (!playlist.length) return;

    playTrack(currentIndex - 1);
});

nextButton.addEventListener('click', () => {
    if (!playlist.length) return;

    playTrack(currentIndex + 1);
});