// Solitaire Game Class
class SolitaireGame {
    constructor() {
        this.deck = [];
        this.stock = [];
        this.waste = [];
        this.foundations = {
            hearts: [],
            diamonds: [],
            clubs: [],
            spades: []
        };
        this.tableau = [[], [], [], [], [], [], []];
        this.moveHistory = [];
        this.score = 0;
        this.moves = 0;
        this.startTime = Date.now();
        this.gameTimer = null;
        this.draggedCards = null;
        this.dragSource = null;
        this.layoutMode = 'compact'; // normal, compact, ultra-compact

        this.botActive = false;
        this.botInterval = null;
        this.isDealing = false;

        // Bot stock cycle tracking
        this.stockCycles = 0;
        this.cardsUsedThisCycle = false;
        this.lastStockSize = 0;

        this.initializeGame();
        this.setupEventListeners();
        // Apply initial layout mode (compact = largest cards)
        this.applyLayoutMode();
        // Timer will be started after dealing
    }

    // Initialize the game
    initializeGame() {
        this.createDeck();
        this.shuffleDeck();

        // Initialize empty tableau and stock
        this.tableau = [[], [], [], [], [], [], []];
        this.stock = [];
        this.waste = [];
        this.foundations = { hearts: [], diamonds: [], clubs: [], spades: [] };

        this.updateDisplay();
        this.animateDeal();
    }

    // Create a standard 52-card deck
    createDeck() {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

        this.deck = [];
        for (let suit of suits) {
            for (let value of values) {
                this.deck.push({
                    suit: suit,
                    value: value,
                    numericValue: this.getNumericValue(value),
                    id: `${value}-${suit}-${Math.random().toString(36).substr(2, 9)}`
                });
            }
        }
    }

    // Get numeric value for card comparison
    getNumericValue(value) {
        const valueMap = {
            'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
            'J': 11, 'Q': 12, 'K': 13
        };
        return valueMap[value];
    }

    // Shuffle the deck using Fisher-Yates algorithm
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    // Animate dealing cards
    async animateDeal() {
        this.isDealing = true;
        const dealSpeed = 50; // ms per card

        // Show the full deck initially
        this.updateStockDisplay();

        // We need to deal 28 cards to tableau (1+2+3+4+5+6+7)
        // The structure is:
        // Pile 0: 1 card (1 face up)
        // Pile 1: 2 cards (1 down, 1 up)
        // ...

        // Helper to wait
        const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // Put all cards in a temporary deck to deal from
        // In the original code, deck was popped.
        // We'll simulate dealing from the "hand" or "deck" pile which is invisible or just the source.
        // Visually, we can show them coming from the stock pile location.

        // Create a visual deck at stock position if needed, but for now we just animate appearing.

        for (let i = 0; i < 7; i++) {
            for (let j = i; j < 7; j++) {
                if (this.deck.length === 0) break;

                const card = this.deck.pop();
                card.faceUp = j === i; // Only top card is face up

                this.tableau[j].push(card);

                // Update specific tableau pile
                this.updateTableauPile(j);

                // Play sound or just wait
                await wait(dealSpeed);
            }
        }

        // Remaining cards go to stock
        this.stock = [...this.deck];
        this.deck = [];
        this.updateStockDisplay();

        this.isDealing = false;
        this.startTimer();

        // If bot was active, restart it? Or wait for user.
        if (this.botActive) {
            this.startBot();
        }
    }

    // Update single tableau pile (optimization)
    updateTableauPile(index) {
        const tableauPile = document.getElementById(`tableau-${index}`);
        tableauPile.innerHTML = '';

        this.tableau[index].forEach((card, cardIndex) => {
            const cardElement = this.createCardElement(card);
            if (card.faceUp) {
                this.setupCardDrag(cardElement, index, cardIndex);
            }
            // Add dealing animation class if it's the last added card
            if (cardIndex === this.tableau[index].length - 1) {
                cardElement.classList.add('dealing');
            }
            tableauPile.appendChild(cardElement);
        });
    }

    // Update the visual display
    updateDisplay() {
        this.updateStockDisplay();
        this.updateWasteDisplay();
        this.updateFoundationDisplay();
        this.updateTableauDisplay();
        this.updateStats();
    }

    // Update stock pile display
    updateStockDisplay() {
        const stockPile = document.getElementById('stock-pile');
        stockPile.innerHTML = '';

        // Show card back if there are cards in stock OR in the deck (during dealing)
        if (this.stock.length > 0 || this.deck.length > 0) {
            const cardBack = document.createElement('div');
            cardBack.className = 'card-back';
            stockPile.appendChild(cardBack);
        }
    }

    // Update waste pile display
    updateWasteDisplay() {
        const wastePile = document.getElementById('waste-pile');
        wastePile.innerHTML = '';

        if (this.waste.length > 0) {
            const topCard = this.waste[this.waste.length - 1];
            const cardElement = this.createCardElement(topCard);
            cardElement.addEventListener('click', () => this.handleWasteCardClick());
            wastePile.appendChild(cardElement);
        }
    }

    // Update foundation piles display
    updateFoundationDisplay() {
        for (let suit in this.foundations) {
            const foundationPile = document.getElementById(`foundation-${suit}`);
            foundationPile.innerHTML = '';

            if (this.foundations[suit].length > 0) {
                const topCard = this.foundations[suit][this.foundations[suit].length - 1];
                const cardElement = this.createCardElement(topCard);
                foundationPile.appendChild(cardElement);
            }
        }
    }

    // Update tableau piles display
    updateTableauDisplay() {
        for (let i = 0; i < 7; i++) {
            const tableauPile = document.getElementById(`tableau-${i}`);
            tableauPile.innerHTML = '';

            this.tableau[i].forEach((card, index) => {
                const cardElement = this.createCardElement(card);

                if (card.faceUp) {
                    this.setupCardDrag(cardElement, i, index);
                }

                tableauPile.appendChild(cardElement);
            });
        }
    }

    // Create a card element
    createCardElement(card) {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${card.faceUp ? 'face-up' : 'face-down'} ${card.suit}`;
        cardElement.dataset.cardId = card.id;

        if (card.faceUp) {
            cardElement.innerHTML = this.generateCardHTML(card);
        }

        return cardElement;
    }

    // Generate HTML for card with proper suit patterns
    generateCardHTML(card) {
        const suitSymbol = this.getSuitSymbol(card.suit);
        const value = card.value;

        // For face cards (J, Q, K), show simple layout with Unicode faces
        if (['J', 'Q', 'K'].includes(value)) {
            const faceSymbol = this.getFaceSymbol(value);
            return `
                <div class="card-corner top-left">
                    <div class="corner-value">${value}</div>
                    <div class="corner-suit">${suitSymbol}</div>
                </div>
                <div class="card-center-large card-face">
                    <div class="face-symbol">${faceSymbol}</div>
                    <div class="face-suit">${suitSymbol}</div>
                </div>
                <div class="card-corner bottom-right">
                    <div class="corner-value">${value}</div>
                    <div class="corner-suit">${suitSymbol}</div>
                </div>
            `;
        }

        // For Ace
        if (value === 'A') {
            return `
                <div class="card-corner top-left">
                    <div class="corner-value">${value}</div>
                    <div class="corner-suit">${suitSymbol}</div>
                </div>
                <div class="card-center-large">${suitSymbol}</div>
                <div class="card-corner bottom-right">
                    <div class="corner-value">${value}</div>
                    <div class="corner-suit">${suitSymbol}</div>
                </div>
            `;
        }

        // For number cards, show pattern
        return `
            <div class="card-corner top-left">
                <div class="corner-value">${value}</div>
                <div class="corner-suit">${suitSymbol}</div>
            </div>
            <div class="card-pips">${this.generatePipPattern(card.numericValue, suitSymbol)}</div>
            <div class="card-corner bottom-right">
                <div class="corner-value">${value}</div>
                <div class="corner-suit">${suitSymbol}</div>
            </div>
        `;
    }

    // Get suit symbol
    getSuitSymbol(suit) {
        const symbols = {
            'hearts': '♥',
            'diamonds': '♦',
            'clubs': '♣',
            'spades': '♠'
        };
        return symbols[suit];
    }

    // Get Unicode face symbol for face cards
    // Using more traditional playing card representations
    getFaceSymbol(value) {
        const faceSymbols = {
            'J': '⚔',   // Crossed swords (traditional Jack/Knave symbol)
            'Q': '♛',   // Black chess queen
            'K': '♚'    // Black chess king
        };
        return faceSymbols[value] || '';
    }

    // Generate pip pattern for number cards
    generatePipPattern(num, symbol) {
        const patterns = {
            2: '<div class="pip" style="top:15%;left:50%">' + symbol + '</div><div class="pip" style="top:85%;left:50%">' + symbol + '</div>',
            3: '<div class="pip" style="top:15%;left:50%">' + symbol + '</div><div class="pip" style="top:50%;left:50%">' + symbol + '</div><div class="pip" style="top:85%;left:50%">' + symbol + '</div>',
            4: '<div class="pip" style="top:20%;left:30%">' + symbol + '</div><div class="pip" style="top:20%;left:70%">' + symbol + '</div><div class="pip" style="top:80%;left:30%">' + symbol + '</div><div class="pip" style="top:80%;left:70%">' + symbol + '</div>',
            5: '<div class="pip" style="top:20%;left:30%">' + symbol + '</div><div class="pip" style="top:20%;left:70%">' + symbol + '</div><div class="pip" style="top:50%;left:50%">' + symbol + '</div><div class="pip" style="top:80%;left:30%">' + symbol + '</div><div class="pip" style="top:80%;left:70%">' + symbol + '</div>',
            6: '<div class="pip" style="top:20%;left:30%">' + symbol + '</div><div class="pip" style="top:20%;left:70%">' + symbol + '</div><div class="pip" style="top:50%;left:30%">' + symbol + '</div><div class="pip" style="top:50%;left:70%">' + symbol + '</div><div class="pip" style="top:80%;left:30%">' + symbol + '</div><div class="pip" style="top:80%;left:70%">' + symbol + '</div>',
            7: '<div class="pip" style="top:20%;left:30%">' + symbol + '</div><div class="pip" style="top:20%;left:70%">' + symbol + '</div><div class="pip" style="top:35%;left:50%">' + symbol + '</div><div class="pip" style="top:50%;left:30%">' + symbol + '</div><div class="pip" style="top:50%;left:70%">' + symbol + '</div><div class="pip" style="top:80%;left:30%">' + symbol + '</div><div class="pip" style="top:80%;left:70%">' + symbol + '</div>',
            8: '<div class="pip" style="top:20%;left:30%">' + symbol + '</div><div class="pip" style="top:20%;left:70%">' + symbol + '</div><div class="pip" style="top:35%;left:50%">' + symbol + '</div><div class="pip" style="top:50%;left:30%">' + symbol + '</div><div class="pip" style="top:50%;left:70%">' + symbol + '</div><div class="pip" style="top:65%;left:50%">' + symbol + '</div><div class="pip" style="top:80%;left:30%">' + symbol + '</div><div class="pip" style="top:80%;left:70%">' + symbol + '</div>',
            9: '<div class="pip" style="top:20%;left:30%">' + symbol + '</div><div class="pip" style="top:20%;left:70%">' + symbol + '</div><div class="pip" style="top:35%;left:30%">' + symbol + '</div><div class="pip" style="top:35%;left:70%">' + symbol + '</div><div class="pip" style="top:50%;left:50%">' + symbol + '</div><div class="pip" style="top:65%;left:30%">' + symbol + '</div><div class="pip" style="top:65%;left:70%">' + symbol + '</div><div class="pip" style="top:80%;left:30%">' + symbol + '</div><div class="pip" style="top:80%;left:70%">' + symbol + '</div>',
            10: '<div class="pip" style="top:15%;left:30%">' + symbol + '</div><div class="pip" style="top:15%;left:70%">' + symbol + '</div><div class="pip" style="top:30%;left:50%">' + symbol + '</div><div class="pip" style="top:40%;left:30%">' + symbol + '</div><div class="pip" style="top:40%;left:70%">' + symbol + '</div><div class="pip" style="top:60%;left:30%">' + symbol + '</div><div class="pip" style="top:60%;left:70%">' + symbol + '</div><div class="pip" style="top:70%;left:50%">' + symbol + '</div><div class="pip" style="top:85%;left:30%">' + symbol + '</div><div class="pip" style="top:85%;left:70%">' + symbol + '</div>'
        };
        return patterns[num] || '';
    }

    // Setup drag and drop for cards
    setupCardDrag(cardElement, pileIndex, cardIndex) {
        cardElement.draggable = true;

        cardElement.addEventListener('dragstart', (e) => {
            this.draggedCards = this.tableau[pileIndex].slice(cardIndex);
            this.dragSource = { type: 'tableau', pileIndex, cardIndex };
            cardElement.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        cardElement.addEventListener('dragend', () => {
            cardElement.classList.remove('dragging');
            this.draggedCards = null;
            this.dragSource = null;
        });
    }

    // Draw card from stock (3 cards at a time)
    drawFromStock() {
        if (this.stock.length === 0) {
            // Reset stock from waste
            if (this.waste.length > 0) {
                // Track stock cycle for bot - stock is being reset
                if (this.botActive) {
                    // Stock was reset - check if cards were used this cycle
                    if (!this.cardsUsedThisCycle) {
                        this.stockCycles++;
                    } else {
                        // Cards were used, reset cycle counter
                        this.stockCycles = 0;
                    }
                    
                    // If 3 cycles without using cards, redeal
                    if (this.stockCycles >= 3) {
                        this.stockCycles = 0;
                        this.cardsUsedThisCycle = false;
                        this.newGame();
                        return;
                    }
                    
                    // Reset for new cycle
                    this.cardsUsedThisCycle = false;
                }
                
                this.stock = [...this.waste.reverse()];
                this.waste = [];
                this.addMove('Reset stock from waste');
            }
        } else {
            // Draw 3 cards at a time (or however many are left)
            const cardsToDraw = Math.min(3, this.stock.length);
            for (let i = 0; i < cardsToDraw; i++) {
                const card = this.stock.pop();
                card.faceUp = true;
                this.waste.push(card);
            }
            this.addMove(`Draw ${cardsToDraw} card${cardsToDraw > 1 ? 's' : ''} from stock`);
        }

        this.updateDisplay();
    }

    // Handle waste card click
    handleWasteCardClick() {
        if (this.waste.length > 0) {
            const card = this.waste[this.waste.length - 1];

            // Try to move to foundation first
            if (this.canMoveToFoundation(card)) {
                this.moveToFoundation(card, 'waste');
                return;
            }

            // Try to move to tableau
            for (let i = 0; i < 7; i++) {
                if (this.canMoveToTableau(card, i)) {
                    this.moveToTableau(card, i, 'waste');
                    return;
                }
            }
        }
    }

    // Check if card can move to foundation
    canMoveToFoundation(card) {
        const foundation = this.foundations[card.suit];
        if (card.value === 'A') {
            return foundation.length === 0;
        }
        if (foundation.length > 0) {
            const topCard = foundation[foundation.length - 1];
            return card.numericValue === topCard.numericValue + 1;
        }
        return false;
    }

    // Check if card can move to tableau
    canMoveToTableau(card, pileIndex) {
        const pile = this.tableau[pileIndex];
        if (pile.length === 0) {
            return card.value === 'K';
        }

        const topCard = pile[pile.length - 1];
        if (!topCard.faceUp) return false;

        const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
        const isTopRed = topCard.suit === 'hearts' || topCard.suit === 'diamonds';

        return isRed !== isTopRed && card.numericValue === topCard.numericValue - 1;
    }

    // Move card to foundation
    moveToFoundation(card, source) {
        this.foundations[card.suit].push(card);

        if (source === 'waste') {
            this.waste.pop();
        } else if (source.type === 'tableau') {
            this.tableau[source.pileIndex].pop();
            this.flipTopCard(source.pileIndex);
        }

        // Mark that cards were used this cycle
        if (this.botActive) {
            this.cardsUsedThisCycle = true;
        }

        this.addMove(`Move ${card.value}${card.suit} to foundation`);
        this.updateDisplay();
        this.checkWinCondition();
    }

    // Move card(s) to tableau
    moveToTableau(card, pileIndex, source) {
        if (source === 'waste') {
            this.tableau[pileIndex].push(card);
            this.waste.pop();
        } else if (source.type === 'tableau') {
            // Move entire sequence of cards
            const cards = this.tableau[source.pileIndex].splice(source.cardIndex);
            this.tableau[pileIndex].push(...cards);
            this.flipTopCard(source.pileIndex);
        }

        // Mark that cards were used this cycle
        if (this.botActive) {
            this.cardsUsedThisCycle = true;
        }

        this.addMove(`Move ${card.value}${card.suit} to tableau`);
        this.updateDisplay();
    }

    // Flip top card of tableau pile
    flipTopCard(pileIndex) {
        const pile = this.tableau[pileIndex];
        if (pile.length > 0 && !pile[pile.length - 1].faceUp) {
            pile[pile.length - 1].faceUp = true;
        }
    }

    // Add move to history
    addMove(description) {
        this.moves++;
        this.score += 10;
        this.moveHistory.push({
            description,
            timestamp: Date.now()
        });
    }

    // Update game statistics
    updateStats() {
        document.getElementById('move-count').textContent = this.moves;
        document.getElementById('score').textContent = this.score;
    }

    // Start game timer
    startTimer() {
        this.gameTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            document.getElementById('timer').textContent =
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    // Check win condition
    checkWinCondition() {
        for (let suit in this.foundations) {
            if (this.foundations[suit].length !== 13) {
                return;
            }
        }

        this.gameWon();
    }

    // Handle game win
    gameWon() {
        clearInterval(this.gameTimer);

        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-moves').textContent = this.moves;
        document.getElementById('final-time').textContent = timeString;

        // Store bot state before celebration
        const wasBotActive = this.botActive;
        if (wasBotActive) {
            this.stopBot();
        }

        // Show celebration
        this.celebrateWin(() => {
            // After celebration, show modal and restart if bot was playing
            document.getElementById('game-over-modal').classList.remove('hidden');
            
            if (wasBotActive) {
                setTimeout(() => {
                    this.newGame();
                    // Restart bot after dealing animation completes (wait for isDealing to be false)
                    const checkAndStartBot = () => {
                        if (!this.isDealing) {
                            this.startBot();
                        } else {
                            setTimeout(checkAndStartBot, 100);
                        }
                    };
                    setTimeout(checkAndStartBot, 100);
                }, 2000);
            }
        });
    }

    // Celebration animation
    celebrateWin(callback) {
        const gameBoard = document.querySelector('.game-board');
        gameBoard.classList.add('celebrating');
        
        // Create confetti/celebration effect
        this.createCelebrationEffect();
        
        // Remove celebration class after animation
        setTimeout(() => {
            gameBoard.classList.remove('celebrating');
            if (callback) callback();
        }, 5000);
    }

    // Create celebration visual effect
    createCelebrationEffect() {
        const container = document.querySelector('.game-container');
        
        // Create lots of gold particles for a big celebration
        const particleCount = 200;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'celebration-particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 2 + 's';
            particle.style.animationDuration = (2 + Math.random() * 3) + 's';
            const randomX = (Math.random() - 0.5) * 3; // Wider spread
            particle.style.setProperty('--random-x', randomX);
            
            // Vary particle sizes for more visual interest
            const size = 6 + Math.random() * 6;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            container.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                particle.remove();
            }, 8000);
        }
    }

    // Bot Logic
    toggleBot() {
        if (this.botActive) {
            this.stopBot();
        } else {
            this.startBot();
        }
    }

    startBot() {
        if (this.isDealing) return;

        this.botActive = true;
        document.getElementById('bot-btn').textContent = 'Stop Bot';
        document.getElementById('bot-btn').classList.replace('btn-primary', 'btn-secondary'); // Visual feedback

        if (this.botInterval) clearInterval(this.botInterval);

        this.botInterval = setInterval(() => {
            this.playBotMove();
        }, 1200); // Play a move every 1200ms (slower pace)
    }

    stopBot() {
        this.botActive = false;
        document.getElementById('bot-btn').textContent = 'Start Bot';
        document.getElementById('bot-btn').classList.replace('btn-secondary', 'btn-primary');

        if (this.botInterval) {
            clearInterval(this.botInterval);
            this.botInterval = null;
        }
    }

    playBotMove() {
        if (!this.botActive || this.isDealing) return;

        // 1. Check for moves to Foundation
        // Check Waste
        if (this.waste.length > 0) {
            const wasteCard = this.waste[this.waste.length - 1];
            if (this.canMoveToFoundation(wasteCard)) {
                this.moveToFoundation(wasteCard, 'waste');
                return;
            }
        }

        // Check Tableau
        for (let i = 0; i < 7; i++) {
            const pile = this.tableau[i];
            if (pile.length > 0) {
                const topCard = pile[pile.length - 1];
                if (topCard.faceUp && this.canMoveToFoundation(topCard)) {
                    this.moveToFoundation(topCard, { type: 'tableau', pileIndex: i, cardIndex: pile.length - 1 });
                    return;
                }
            }
        }

        // 2. Check for moves to Tableau (reveal hidden cards or move sequences)
        // Prioritize revealing hidden cards by moving sequences
        for (let i = 0; i < 7; i++) { // Source pile
            const sourcePile = this.tableau[i];
            // Find the first face-up card (this will be the start of a sequence)
            let firstFaceUpIndex = -1;
            for (let k = 0; k < sourcePile.length; k++) {
                if (sourcePile[k].faceUp) {
                    firstFaceUpIndex = k;
                    break;
                }
            }

            if (firstFaceUpIndex !== -1) {
                const cardToMove = sourcePile[firstFaceUpIndex];

                // Don't move if it's a King on an empty spot (useless move)
                if (cardToMove.value === 'K' && firstFaceUpIndex === 0) continue;

                // Try to find a target for this sequence
                for (let j = 0; j < 7; j++) { // Target pile
                    if (i === j) continue;

                    if (this.canMoveToTableau(cardToMove, j)) {
                        // Move the entire sequence starting from firstFaceUpIndex
                        this.moveToTableau(cardToMove, j, { type: 'tableau', pileIndex: i, cardIndex: firstFaceUpIndex });
                        return;
                    }
                }
            }
        }

        // 3. Move from Waste to Tableau
        if (this.waste.length > 0) {
            const wasteCard = this.waste[this.waste.length - 1];
            for (let i = 0; i < 7; i++) {
                if (this.canMoveToTableau(wasteCard, i)) {
                    this.moveToTableau(wasteCard, i, 'waste');
                    return;
                }
            }
        }

        // 4. Draw from Stock
        // If stock is empty and waste is not, this will reset stock
        // If both empty, we might be stuck
        if (this.stock.length > 0 || this.waste.length > 0) {
            this.drawFromStock();

            // Check if we are just cycling endlessly without moves
            // (Simple check: if we cycle through the whole deck with no other moves, we are stuck)
            // For now, just draw.
            return;
        }

        // 5. If no moves and no stock, we are stuck or done.
        // Auto-restart if stuck
        this.stopBot();
        setTimeout(() => this.newGame(), 2000);
    }

    // Setup event listeners
    setupEventListeners() {
        // New game button
        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.newGame();
        });

        // Bot button
        document.getElementById('bot-btn').addEventListener('click', () => {
            this.toggleBot();
        });

        // Stock pile click handler
        document.getElementById('stock-pile').addEventListener('click', () => {
            if (!this.isDealing && (this.stock.length > 0 || this.waste.length > 0)) {
                this.drawFromStock();
            }
        });

        // Undo button
        document.getElementById('undo-btn').addEventListener('click', () => {
            this.undoMove();
        });

        // Hint button
        document.getElementById('hint-btn').addEventListener('click', () => {
            this.showHint();
        });

        // Play again button
        document.getElementById('play-again-btn').addEventListener('click', () => {
            document.getElementById('game-over-modal').classList.add('hidden');
            this.newGame();
        });

        // Close hint button
        document.getElementById('close-hint-btn').addEventListener('click', () => {
            document.getElementById('hint-modal').classList.add('hidden');
        });

        // Layout toggle button
        document.getElementById('layout-btn').addEventListener('click', () => {
            this.toggleLayout();
        });

        // Setup drop zones
        this.setupDropZones();
    }

    // Setup drop zones for drag and drop
    setupDropZones() {
        // Foundation drop zones
        for (let suit in this.foundations) {
            const foundationPile = document.getElementById(`foundation-${suit}`);
            this.setupDropZone(foundationPile, 'foundation', suit);
        }

        // Tableau drop zones
        for (let i = 0; i < 7; i++) {
            const tableauPile = document.getElementById(`tableau-${i}`);
            this.setupDropZone(tableauPile, 'tableau', i);
        }

        // Waste drop zone
        const wastePile = document.getElementById('waste-pile');
        this.setupDropZone(wastePile, 'waste');
    }

    // Setup individual drop zone
    setupDropZone(element, type, index) {
        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';

            if (this.draggedCards && this.canDropCards(this.draggedCards, type, index)) {
                element.classList.add('valid-move');
            } else {
                element.classList.add('invalid-move');
            }
        });

        element.addEventListener('dragleave', () => {
            element.classList.remove('valid-move', 'invalid-move');
        });

        element.addEventListener('drop', (e) => {
            e.preventDefault();
            element.classList.remove('valid-move', 'invalid-move');

            if (this.draggedCards && this.canDropCards(this.draggedCards, type, index)) {
                this.handleCardDrop(type, index);
            }
        });
    }

    // Check if cards can be dropped
    canDropCards(cards, targetType, targetIndex) {
        if (!cards || cards.length === 0) return false;

        const topCard = cards[0];

        if (targetType === 'foundation') {
            return this.canMoveToFoundation(topCard);
        } else if (targetType === 'tableau') {
            return this.canMoveToTableau(topCard, targetIndex);
        }

        return false;
    }

    // Handle card drop
    handleCardDrop(targetType, targetIndex) {
        if (!this.draggedCards || this.draggedCards.length === 0) return;

        const topCard = this.draggedCards[0];

        if (targetType === 'foundation') {
            // Foundation only accepts single cards
            this.moveToFoundation(topCard, this.dragSource);
        } else if (targetType === 'tableau') {
            // Tableau can accept sequences - move the first card (the rest will be moved in moveToTableau)
            this.moveToTableau(topCard, targetIndex, this.dragSource);
        }
    }

    // Undo last move
    undoMove() {
        if (this.moveHistory.length === 0) return;

        // Simple undo - just reset the game for now
        // In a full implementation, you'd store the game state for each move
        this.showHint('Undo functionality is not implemented in this version.');
    }

    // Show hint
    showHint(message = null) {
        const hintText = message || this.generateHint();
        document.getElementById('hint-text').textContent = hintText;
        document.getElementById('hint-modal').classList.remove('hidden');
    }

    // Generate hint
    generateHint() {
        // Check for obvious moves
        if (this.waste.length > 0) {
            const wasteCard = this.waste[this.waste.length - 1];
            if (this.canMoveToFoundation(wasteCard)) {
                return `Move ${wasteCard.value}${wasteCard.suit} from waste to foundation`;
            }
        }

        // Check tableau for moves to foundation
        for (let i = 0; i < 7; i++) {
            const pile = this.tableau[i];
            if (pile.length > 0) {
                const topCard = pile[pile.length - 1];
                if (topCard.faceUp && this.canMoveToFoundation(topCard)) {
                    return `Move ${topCard.value}${topCard.suit} from tableau to foundation`;
                }
            }
        }

        // Check for tableau moves
        for (let i = 0; i < 7; i++) {
            const pile = this.tableau[i];
            if (pile.length > 0) {
                const topCard = pile[pile.length - 1];
                if (topCard.faceUp) {
                    for (let j = 0; j < 7; j++) {
                        if (i !== j && this.canMoveToTableau(topCard, j)) {
                            return `Move ${topCard.value}${topCard.suit} from tableau ${i + 1} to tableau ${j + 1}`;
                        }
                    }
                }
            }
        }

        return 'Try drawing from the stock pile or look for tableau moves';
    }

    // Apply current layout mode
    applyLayoutMode() {
        const gameContainer = document.querySelector('.game-container');
        const layoutBtn = document.getElementById('layout-btn');

        // Remove all layout classes first
        gameContainer.classList.remove('compact-mode', 'ultra-compact-mode');

        switch (this.layoutMode) {
            case 'normal':
                layoutBtn.textContent = 'Compact';
                break;
            case 'compact':
                gameContainer.classList.add('compact-mode');
                layoutBtn.textContent = 'Ultra Compact';
                break;
            case 'ultra-compact':
                gameContainer.classList.add('ultra-compact-mode');
                layoutBtn.textContent = 'Normal';
                break;
        }
    }

    // Toggle layout compactness
    toggleLayout() {
        switch (this.layoutMode) {
            case 'normal':
                this.layoutMode = 'compact';
                break;
            case 'compact':
                this.layoutMode = 'ultra-compact';
                break;
            case 'ultra-compact':
                this.layoutMode = 'normal';
                break;
        }
        this.applyLayoutMode();
    }

    // Start new game
    newGame() {
        clearInterval(this.gameTimer);

        // Reset game state
        this.deck = [];
        this.stock = [];
        this.waste = [];
        this.foundations = { hearts: [], diamonds: [], clubs: [], spades: [] };
        this.tableau = [[], [], [], [], [], [], []];
        this.moveHistory = [];
        this.score = 0;
        this.moves = 0;
        this.startTime = Date.now();
        this.draggedCards = null;
        this.dragSource = null;
        
        // Reset bot cycle tracking
        this.stockCycles = 0;
        this.cardsUsedThisCycle = false;
        this.lastStockSize = 0;
        
        // Keep layout mode when starting new game

        // Hide modals
        document.getElementById('game-over-modal').classList.add('hidden');
        document.getElementById('hint-modal').classList.add('hidden');

        // Initialize new game
        this.initializeGame();
        this.startTimer();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SolitaireGame();
    
    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then((registration) => {
                    console.log('ServiceWorker registration successful:', registration.scope);
                })
                .catch((error) => {
                    console.log('ServiceWorker registration failed:', error);
                });
        });
    }
}); 