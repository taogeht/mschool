class FlashcardManager {
    constructor(trackId) {
        this.currentIndex = 0;
        this.trackId = trackId;
        // Each track has its own set of flashcards
        this.cards = this.getCardsForTrack(trackId);
    }

    getCardsForTrack(trackId) {
        // Map track IDs to their corresponding flashcard sets
        const flashcardSets = {
            'track1': [
                '../img/flashcards/eif3a/track1/card1.jpg',
                '../img/flashcards/eif3a/track1/card2.jpg',
                'img/flashcards/eif3a/track1/card3.jpg',
                'img/flashcards/eif3a/track1/card4.jpg',
                'img/flashcards/eif3a/track1/card5.jpg',
                'img/flashcards/eif3a/track1/card6.jpg',
                'img/flashcards/eif3a/track1/card7.jpg'
            ],
            'track2': [
                '/img/flashcards/track2/card1.jpg',
                '/img/flashcards/track2/card2.jpg',
                '/img/flashcards/track2/card3.jpg'
            ],
            // Add more track-specific flashcard sets
        };
        return flashcardSets[trackId] || [];
    }

    createFlashcardHTML() {
        return `
            <div class="flashcard-view">
                <div class="single-player-container" id="singlePlayerContainer"></div>
                <div class="flashcard-container">
                    <div class="flashcard">
                        <img src="${this.cards[this.currentIndex]}" alt="Flashcard ${this.currentIndex + 1}">
                    </div>
                    <div class="flashcard-controls">
                        <button class="flashcard-button" id="prevCard">Previous</button>
                        <button class="flashcard-button return-main" onclick="returnToMain()">Return to main</button>
                        <button class="flashcard-button" id="nextCard">Next</button>
                    </div>
                </div>
            </div>
        `;
    }

    initialize() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = this.createFlashcardHTML();
        
        // Initialize the single audio player for this track
        const singlePlayerContainer = document.getElementById('singlePlayerContainer');
        const track = tracks.find(t => t.id === this.trackId);
        new AudioPlayer(track, singlePlayerContainer, true); // true indicates single player mode
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        const nextBtn = document.getElementById('nextCard');
        const prevBtn = document.getElementById('prevCard');

        nextBtn.addEventListener('click', () => this.nextCard());
        prevBtn.addEventListener('click', () => this.prevCard());

        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') {
                this.nextCard();
            } else if (e.key === 'ArrowLeft') {
                this.prevCard();
            }
        });
    }

    nextCard() {
        this.currentIndex = (this.currentIndex + 1) % this.cards.length;
        this.updateCard();
    }

    prevCard() {
        this.currentIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
        this.updateCard();
    }

    updateCard() {
        const img = document.querySelector('.flashcard img');
        // Add fade out effect
        img.style.opacity = '0';
        
        setTimeout(() => {
            img.src = this.cards[this.currentIndex];
            img.alt = `Flashcard ${this.currentIndex + 1}`;
            // Fade in new image
            img.style.opacity = '1';
        }, 150);
    }
}