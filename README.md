# Solitaire Card Game - Billionaire Mindset Edition

A modern, luxurious implementation of the classic Klondike Solitaire card game with a "Billionaire Mindset" theme featuring money green tones, gold accents, and premium styling. Built with HTML, CSS, and JavaScript.

## 🎮 How to Play

### Objective
Build up the four foundation piles (one for each suit) from Ace to King in ascending order.

### Game Rules

1. **Tableau Piles**: The main playing area consists of 7 piles where you can build descending sequences of alternating colors (red/black). You can move entire sequences of cards together.

2. **Foundation Piles**: The four piles at the top where you build ascending sequences from Ace to King, all of the same suit.

3. **Stock Pile**: Click the card back to draw **3 cards at a time** to the waste pile. When the stock is empty, click again to reset from the waste pile.

4. **Waste Pile**: The top card can be moved to the tableau or foundation piles.

### How to Move Cards

- **Drag and Drop**: Click and drag cards to move them between piles. Drag any card in a sequence to move the entire sequence from that card down.
- **Click to Move**: Click on cards in the waste pile to automatically move them to valid destinations
- **Sequence Moving**: Move multiple cards at once by dragging any card in a valid sequence

### Scoring
- Each move: +10 points
- The goal is to complete the game with the highest score possible

## ✨ Features

### Core Gameplay
- **Draw 3 Cards**: Classic "draw 3" variant - draw 3 cards at a time from stock
- **Sequence Moving**: Move entire sequences of cards between tableau piles
- **Full Undo Support**: Undo any move to restore the previous game state
- **Auto Bot**: Watch an AI bot play automatically with intelligent move selection
- **Smart Bot Logic**: Bot automatically redeals if it cycles through stock 3 times without progress

### Visual Design
- **Billionaire Mindset Theme**: Luxurious money green and gold color scheme
- **Unicode Face Cards**: Jack (⚔), Queen (♛), and King (♚) with traditional symbols
- **Smooth Animations**: Card movements, dealing, and hover effects
- **Celebration Effects**: Spectacular gold particle celebration (200+ particles) on game win
- **Multiple Layout Modes**: Toggle between Normal, Compact (largest cards), and Ultra-Compact layouts
- **Compact Header**: Streamlined game header for better space utilization

### Game Controls
- **New Game**: Start a fresh game
- **Start/Stop Bot**: Toggle AI bot to play automatically
- **Undo**: Undo your last move (works for all move types)
- **Hint**: Get a suggestion for your next move
- **Layout Toggle**: Switch between card sizes (Normal → Compact → Ultra-Compact)
- **Stock Pile**: Click to draw 3 cards
- **Waste Pile**: Click top card to move it

### Game Statistics
- **Moves Counter**: Track total moves made
- **Timer**: Real-time game timer
- **Score**: Points earned during gameplay
- **Final Stats**: View final score, moves, and time on game completion

### Bot Features
- **Intelligent Play**: Bot prioritizes foundation moves, then tableau moves
- **Auto-Redeal**: Automatically starts new game if stuck (3 stock cycles without progress)
- **Auto-Continue**: Bot continues playing after winning games
- **Adjustable Speed**: Bot moves at a comfortable pace (1.2 seconds per move)

## 🚀 How to Run

1. **Download/Clone** the project files
2. **Open** `index.html` in your web browser
3. **Start Playing** immediately - no installation required!

### File Structure
```
solitaire/
├── index.html          # Main HTML structure
├── styles.css          # Billionaire Mindset theme styling and animations
├── script.js           # Complete game logic, bot AI, and functionality
├── manifest.json       # PWA manifest for app installation
├── service-worker.js   # Service worker for offline functionality
├── ace-cards.png       # Favicon and app icon
└── README.md           # This file
```

### PWA (Progressive Web App)
This game is a Progressive Web App that can be installed on your device:
- **Installable**: Add to home screen on mobile or desktop
- **Offline Play**: Works offline after first visit
- **App-like Experience**: Runs as a standalone app
- **Favicon**: Uses ace-cards.png as the app icon

## 🎯 Game Controls

- **New Game**: Start a fresh game
- **Start Bot / Stop Bot**: Toggle AI bot to play automatically
- **Undo**: Undo your last move - restores cards to previous positions, score, and move count
- **Hint**: Get a suggestion for your next move
- **Layout**: Toggle between Normal, Compact (largest), and Ultra-Compact card sizes
- **Stock Pile**: Click to draw 3 cards at a time
- **Waste Pile**: Click top card to automatically move it

### Undo Feature
The undo button allows you to:
- Undo any move (foundation, tableau, stock draws)
- Restore the exact game state before the last move
- Undo multiple moves in sequence
- Automatically prevents undo during card dealing or while bot is active

## 🎨 Design Features

### Billionaire Mindset Theme
- **Money Green Background**: Deep money green tones (#1a3d1a, #2d5016) with black accents
- **Gold Accents**: Luxurious gold (#FFD700, #FFA500) highlights throughout
- **Premium Styling**: Rich gradients, elegant borders, and sophisticated shadows
- **Glass Morphism**: Semi-transparent UI elements with blur effects
- **Gold Particles**: Spectacular 200+ particle celebration on win

### Card Design
- **Unicode Face Cards**: Traditional symbols for Jack (⚔), Queen (♛), and King (♚)
- **Beautiful Suits**: Heart (♥), Diamond (♦), Club (♣), and Spade (♠) symbols
- **Multiple Sizes**: Three layout modes for different preferences
- **Smooth Animations**: Card dealing, flipping, and movement animations

### Responsive Design
- **Adaptive Layout**: Works on desktop, tablet, and mobile devices
- **Flexible Card Sizes**: Choose the card size that works best for your screen
- **Touch Optimized**: Drag and drop works on touch devices

## 🏆 Winning the Game

To win, you must build all four foundation piles from Ace to King:
- ♥ Hearts: A → 2 → 3 → ... → K
- ♦ Diamonds: A → 2 → 3 → ... → K  
- ♣ Clubs: A → 2 → 3 → ... → K
- ♠ Spades: A → 2 → 3 → ... → K

When you win:
- **5-second celebration** with 200+ gold particles
- **Win modal** showing final statistics
- **Auto-continue** if bot was playing

## 🤖 Bot AI Features

The bot uses intelligent move prioritization:

1. **Foundation Moves**: Always moves cards to foundation when possible
2. **Tableau Moves**: Moves sequences to reveal hidden cards
3. **Waste to Tableau**: Plays waste cards when possible
4. **Stock Drawing**: Draws from stock when no other moves available
5. **Auto-Redeal**: Starts new game if stuck (3 stock cycles without progress)
6. **Auto-Continue**: Continues playing after winning

## 🔧 Technical Details

- **Pure JavaScript**: No external dependencies
- **ES6 Classes**: Modern JavaScript architecture with SolitaireGame class
- **CSS Grid/Flexbox**: Responsive layout system
- **HTML5 Drag & Drop**: Native browser drag functionality
- **CSS Animations**: Smooth transitions and celebration effects
- **Bot AI**: Intelligent move selection algorithm
- **Stock Cycle Tracking**: Prevents infinite loops

## 🎮 Game Modes

### Layout Modes
- **Normal**: Standard card size (90px × 126px)
- **Compact**: Largest cards (120px × 170px) - **Default on fresh start**
- **Ultra-Compact**: Smaller cards (100px × 140px)

### Play Modes
- **Manual Play**: Play yourself with full control
- **Bot Play**: Watch the AI play automatically
- **Hybrid**: Start bot, stop anytime, continue manually

## 📱 Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🐛 Known Limitations

- Game state persistence between sessions coming soon
- Mobile drag and drop may require touch optimization

## 🎯 Future Enhancements

Potential features for future updates:
- Game state saving (localStorage)
- Different solitaire variants
- Sound effects
- More celebration animations
- Statistics tracking across games
- Difficulty levels

## 📄 License

This project is open source and available under the MIT License.

---

**Enjoy playing Solitaire with Billionaire Mindset!** 🃏💰✨
