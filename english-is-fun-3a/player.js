// Theme management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

const tracks = [
    { id: 'track1', title: 'Track 1', file: '../audio/eif3a/Track1.mp3' },
    { id: 'track2', title: 'Track 2', file: '../audio/eif3a/Track2.mp3' },
    { id: 'track3', title: 'Track 3', file: '../audio/eif3a/Track3.mp3' },
    { id: 'track4', title: 'Track 4', file: '../audio/eif3a/Track4.mp3' },
    { id: 'track5', title: 'Track 5', file: '../audio/eif3a/Track5.mp3' },
    { id: 'track6', title: 'Track 6', file: '../audio/eif3a/Track6.mp3' },
    { id: 'track7', title: 'Track 7', file: '../audio/eif3a/Track7.mp3' },
    { id: 'track8', title: 'Track 8', file: '../audio/eif3a/Track8.mp3' },
    { id: 'track9', title: 'Track 9', file: '../audio/eif3a/Track9.mp3' },
    { id: 'track10', title: 'Track 10', file: '../audio/eif3a/Track10.mp3' },
    { id: 'track11', title: 'Track 11', file: '../audio/eif3a/Track11.mp3' },
    { id: 'track12', title: 'Track 12', file: '../audio/eif3a/Track12.mp3' },
    { id: 'track13', title: 'Track 13', file: '../audio/eif3a/Track13.mp3' },
    { id: 'track14', title: 'Track 14', file: '../audio/eif3a/Track14.mp3' },
    { id: 'track15', title: 'Track 13', file: '../audio/eif3a/Track15.mp3' },
    { id: 'track16', title: 'Track 14', file: '../audio/eif3a/Track16.mp3' }
    
];

let currentlyPlaying = null;

class AudioPlayer {
    constructor(track, container, isSinglePlayer = false) {
        this.track = track;
        this.container = container;
        this.audio = new Audio(track.file);
        this.isPlaying = false;
        this.isSinglePlayer = isSinglePlayer;
        this.createPlayer();
        this.setupEventListeners();
    }

    createPlayer() {
        this.container.innerHTML = `
            <div class="track-container ${this.isSinglePlayer ? 'single-player' : ''}">
                <div class="track-header">
                    <h2 class="track-title">${this.track.title}</h2>
                    ${this.isSinglePlayer ? 
                        `<button class="return-main-button" onclick="returnToMain()">Return to Main</button>` : 
                        `<button class="flashcard-link" onclick="showFlashcards('${this.track.id}')">View Flashcard</button>`
                    }
                </div>
                <div class="progress-container">
                    <div class="progress-bar"></div>
                </div>
                <div class="controls">
                    <div class="primary-controls">
                        <button class="play-pause">Play</button>
                        <input type="range" class="volume-control" min="0" max="1" step="0.1" value="1">
                        <span class="time-display">0:00 / 0:00</span>
                    </div>
                </div>
            </div>
        `;

        this.playPauseBtn = this.container.querySelector('.play-pause');
        this.progressBar = this.container.querySelector('.progress-bar');
        this.progressContainer = this.container.querySelector('.progress-container');
        this.volumeControl = this.container.querySelector('.volume-control');
        this.timeDisplay = this.container.querySelector('.time-display');
    }

    setupEventListeners() {
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.progressContainer.addEventListener('click', (e) => this.seek(e));
        this.volumeControl.addEventListener('input', (e) => this.setVolume(e));
        
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.onTrackEnd());
        this.audio.addEventListener('loadedmetadata', () => this.updateTimeDisplay());
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            if (currentlyPlaying && currentlyPlaying !== this) {
                currentlyPlaying.pause();
            }
            this.play();
        }
    }

    play() {
        this.audio.play();
        this.playPauseBtn.textContent = 'Pause';
        this.isPlaying = true;
        currentlyPlaying = this;
    }

    pause() {
        this.audio.pause();
        this.playPauseBtn.textContent = 'Play';
        this.isPlaying = false;
        if (currentlyPlaying === this) {
            currentlyPlaying = null;
        }
    }

    seek(e) {
        const rect = this.progressContainer.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        this.audio.currentTime = pos * this.audio.duration;
    }

    setVolume(e) {
        this.audio.volume = e.target.value;
    }

    updateProgress() {
        const progress = (this.audio.currentTime / this.audio.duration) * 100;
        this.progressBar.style.width = `${progress}%`;
        this.updateTimeDisplay();
    }

    updateTimeDisplay() {
        const current = this.formatTime(this.audio.currentTime);
        const duration = this.formatTime(this.audio.duration);
        this.timeDisplay.textContent = `${current} / ${duration}`;
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }

    onTrackEnd() {
        this.pause();
        this.progressBar.style.width = '0%';
    }
}

function togglePage() {
    const audioContent = document.getElementById('audioContent');
    const flashcardContent = document.getElementById('flashcardContent');
    const pageToggle = document.getElementById('pageToggle');

    if (audioContent.classList.contains('hidden')) {
        // Switch to Audio page
        audioContent.classList.remove('hidden');
        flashcardContent.classList.add('hidden');
        pageToggle.textContent = 'Flashcards';
    } else {
        // Switch to Flashcard page
        audioContent.classList.add('hidden');
        flashcardContent.classList.remove('hidden');
        pageToggle.textContent = 'Audio Player';
        
        // Load flashcards if they haven't been loaded yet
        if (!flashcardContent.hasChildNodes()) {
            loadFlashcards();
        }
    }
}

function initializeAudioPlayers() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = '<div class="player-grid" id="playerGrid"></div>';
    
    const playerGrid = document.getElementById('playerGrid');
    
    tracks.forEach(track => {
        const playerContainer = document.createElement('div');
        playerGrid.appendChild(playerContainer);
        new AudioPlayer(track, playerContainer);
    });
}

let currentPage = 'audio';

function togglePage() {
    const pageToggle = document.getElementById('pageToggle');
    
    if (currentPage === 'audio') {
        // Switch to Flashcards
        currentPage = 'flashcards';
        pageToggle.textContent = 'Audio Player';
        const flashcardManager = new FlashcardManager();
        flashcardManager.initialize();
    } else {
        // Switch to Audio
        currentPage = 'audio';
        pageToggle.textContent = 'Flashcards';
        initializeAudioPlayers();
    }
}

function showFlashcards(trackId) {
    currentPage = 'flashcards';
    const flashcardManager = new FlashcardManager(trackId);
    flashcardManager.initialize();
}

function returnToMain() {
    currentPage = 'audio';
    initializeAudioPlayers();
}

function loadFlashcards() {
    const flashcardContent = document.getElementById('flashcardContent');
    // Add your flashcard initialization code here
    flashcardContent.innerHTML = `
        <div class="flashcard-container">
            <!-- Your flashcard HTML will go here -->
        </div>
    `;
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    initializeTheme();
    
    // Set up theme toggle
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', toggleTheme);
    

    
    // Initialize audio players by default
    initializeAudioPlayers();
});
