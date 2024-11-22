let globalAudioPlayer = null;

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
    { id: 'track1', title: 'Track 1', file: '../audio/Track1.mp3' },
    { id: 'track2', title: 'Track 2', file: '../audio/Track2.mp3' },
    { id: 'track3', title: 'Track 3', file: '../audio/Track3.mp3' },
    { id: 'track4', title: 'Track 4', file: '../audio/Track4.mp3' },
    { id: 'track5', title: 'Track 5', file: '../audio/Track5.mp3' },
    { id: 'track6', title: 'Track 6', file: '../audio/Track6.mp3' },
    { id: 'track7', title: 'Track 7', file: '../audio/Track7.mp3' },
    { id: 'track8', title: 'Track 8', file: '../audio/Track8.mp3' },
    { id: 'track9', title: 'Track 9', file: '../audio/Track9.mp3' },
    { id: 'track10', title: 'Track 10', file: '../audio/Track10.mp3' },
    { id: 'track11', title: 'Track 11', file: '../audio/Track11.mp3' },
    { id: 'track12', title: 'Track 12', file: '../audio/Track12.mp3' },
    { id: 'track13', title: 'Track 13', file: '../audio/Track13.mp3' },
    { id: 'track14', title: 'Track 14', file: '../audio/Track14.mp3' },
    { id: 'track15', title: 'Track 15', file: '../audio/Track15.mp3' },
    { id: 'track16', title: 'Track 16', file: '../audio/Track16.mp3' }
];

let currentlyPlaying = null;



class AudioPlayer {
    constructor(track, container, isSinglePlayer = false) {
        // Check if there's an existing player for this track
        if (globalAudioPlayer && globalAudioPlayer.track.id === track.id) {
            this.audio = globalAudioPlayer.audio;
            this.isPlaying = globalAudioPlayer.isPlaying;
        } else {
            this.audio = new Audio(track.file);
            this.isPlaying = false;
        }
        
        this.track = track;
        this.container = container;
        this.isSinglePlayer = isSinglePlayer;
        this.isDragging = false;
        this.createPlayer();
        this.setupEventListeners();
        
        // Update UI to match current state
        if (this.isPlaying) {
            this.updatePlayPauseButton(true);
            this.updateProgress();
        }
    }

    createPlayer() {
        const playIcon = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
            </svg>`;
        
        const pauseIcon = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>`;

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
                        <button class="play-pause-btn ${this.isPlaying ? 'pause' : 'play'}" aria-label="${this.isPlaying ? 'Pause' : 'Play'}">
                            ${this.isPlaying ? pauseIcon : playIcon}
                        </button>
                        <input type="range" class="volume-control" min="0" max="1" step="0.1" value="1">
                        <span class="time-display">0:00 / 0:00</span>
                    </div>
                </div>
            </div>
        `;

        this.playPauseBtn = this.container.querySelector('.play-pause-btn');
        this.progressBar = this.container.querySelector('.progress-bar');
        this.progressContainer = this.container.querySelector('.progress-container');
        this.volumeControl = this.container.querySelector('.volume-control');
        this.timeDisplay = this.container.querySelector('.time-display');
    }
    updatePlayPauseButton(isPlaying) {
        const playIcon = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
            </svg>`;
        
        const pauseIcon = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>`;

        this.playPauseBtn.innerHTML = isPlaying ? pauseIcon : playIcon;
        this.playPauseBtn.classList.toggle('play', !isPlaying);
        this.playPauseBtn.classList.toggle('pause', isPlaying);
        this.playPauseBtn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
    }
    handleAudioError() {
        this.errorMessage.textContent = "Error loading audio file. Please check the file path.";
        this.errorMessage.style.display = 'block';
        this.playPauseBtn.disabled = true;
    }

    setupEventListeners() {
        // Ensure audio is loaded before allowing play
        this.audio.addEventListener('loadeddata', () => {
            this.playPauseBtn.disabled = false;
            console.log('Audio loaded successfully:', this.track.file);
        });

        this.playPauseBtn.addEventListener('click', () => {
            console.log('Play button clicked');
            this.togglePlayPause();
        });

        this.volumeControl.addEventListener('input', (e) => this.setVolume(e));
        
        // Progress bar interactions
        this.progressContainer.addEventListener('mousedown', (e) => this.startDragging(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.stopDragging());
        
        this.audio.addEventListener('timeupdate', () => {
            if (!this.isDragging) {
                this.updateProgress();
            }
        });
        
        this.audio.addEventListener('ended', () => this.onTrackEnd());
        this.audio.addEventListener('loadedmetadata', () => this.updateTimeDisplay());

        // Debug logging
        this.audio.addEventListener('play', () => console.log('Audio play event fired'));
        this.audio.addEventListener('playing', () => console.log('Audio playing event fired'));
    }

    async togglePlayPause() {
        try {
            if (this.isPlaying) {
                await this.pause();
            } else {
                if (currentlyPlaying && currentlyPlaying !== this) {
                    await currentlyPlaying.pause();
                }
                await this.play();
            }
        } catch (error) {
            console.error('Error toggling play/pause:', error);
            this.handleAudioError();
        }
    }

    async play() {
        try {
            const playPromise = this.audio.play();
            
            if (playPromise !== undefined) {
                await playPromise;
                this.updatePlayPauseButton(true);
                this.isPlaying = true;
                currentlyPlaying = this;
                globalAudioPlayer = this;
            }
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    }

    pause() {
        this.audio.pause();
        this.updatePlayPauseButton(false);
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
        playerContainer.setAttribute('data-track-id', track.id);
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
    // Store the currently playing track before switching views
    const wasPlaying = currentlyPlaying ? currentlyPlaying.track.id : null;
    
    const flashcardManager = new FlashcardManager(trackId);
    flashcardManager.initialize();

    // If there was a track playing and it matches the current track, ensure it continues
    if (wasPlaying === trackId) {
        const audioPlayer = new AudioPlayer(tracks.find(t => t.id === trackId), 
            document.getElementById('singlePlayerContainer'), true);
        if (globalAudioPlayer && globalAudioPlayer.isPlaying) {
            audioPlayer.updatePlayPauseButton(true);
        }
    }
}

function returnToMain() {
    currentPage = 'audio';
    // Store the currently playing track before switching views
    const wasPlaying = globalAudioPlayer ? globalAudioPlayer.track.id : null;
    
    initializeAudioPlayers();

    // If there was a track playing, ensure its UI is updated in the grid view
    if (wasPlaying) {
        const playerContainer = document.querySelector(`[data-track-id="${wasPlaying}"]`);
        if (playerContainer) {
            const track = tracks.find(t => t.id === wasPlaying);
            const audioPlayer = new AudioPlayer(track, playerContainer);
            if (globalAudioPlayer.isPlaying) {
                audioPlayer.updatePlayPauseButton(true);
            }
        }
    }
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
