# Claude-vs-Human-Chess-Game

A fully playable, browser-based chess game where you challenge **Claude AI** in a one-on-one match — no installs, no backend, runs entirely in your browser.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [How to Play](#how-to-play)
- [Game Setup Flow](#game-setup-flow)
- [Board Orientation](#board-orientation)
- [Pieces & Rules Implemented](#pieces--rules-implemented)
- [Check, Double Check & Checkmate](#check-double-check--checkmate)
- [Chess Clock](#chess-clock)
- [Move Highlighting](#move-highlighting)
- [Claude AI Engine](#claude-ai-engine)
- [PGN Export](#pgn-export)
- [Special Moves](#special-moves)
- [Tech Stack](#tech-stack)
- [Running Locally](#running-locally)
- [Known Limitations](#known-limitations)

---

## Overview

This is a single-file HTML chess game built with vanilla JavaScript. It includes:

- Full chess rule enforcement (all pieces, all special moves)
- A Claude-powered AI opponent using Minimax with Alpha-Beta pruning
- Dual chess timers (bullet, blitz, rapid)
- Move-from/to square highlighting
- PGN export with proper algebraic notation
- Strict check, double check, checkmate and stalemate detection
- Board flip depending on which color you choose

---

## Features

| Feature                   | Details                                                     |
| ------------------------- | ----------------------------------------------------------- |
| All 6 piece types         | Pawn, Knight, Bishop, Rook, Queen, King                     |
| Full legal move filtering | No move can leave your own king in check                    |
| Check detection           | Single check, double check, checkmate, stalemate            |
| Special moves             | Castling (K & Q side), En passant, Pawn promotion           |
| Chess clock               | 1 min / 3 min / 5 min / 10 min per player                   |
| Move highlight            | From-square and to-square glow after every move             |
| AI opponent               | Minimax depth-3 with Alpha-Beta pruning + positional tables |
| Board flip                | Board always shown from your perspective                    |
| PGN export                | Full PGN with headers, disambiguation, +/# symbols          |
| Promotion UI              | Visual piece-picker modal on pawn promotion                 |

---

## How to Play

1. Open the HTML file in any modern browser
2. A **time control modal** appears — pick your preferred time limit
3. A **side selection modal** appears — choose to play as White or Black
4. The board sets up with **Claude always at the top** and **you always at the bottom**
5. If you picked **White**, you move first. If you picked **Black**, Claude moves first automatically
6. Click any of your pieces to see its legal moves highlighted
7. Click a highlighted square to make the move
8. The clock for the active player starts ticking from your very first move
9. Play until checkmate, stalemate, or a player runs out of time
10. After the game ends, click **📄 PGN** to view and copy the full game notation

---

## Game Setup Flow

```
Open Game
    │
    ▼
┌─────────────────────┐
│  Choose Time Control │
│  1min / 3min /       │
│  5min / 10min        │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Choose Your Side    │
│  ♙ White (go first) │
│  ♟ Black (Claude    │
│         goes first) │
└────────┬────────────┘
         │
         ▼
     Game Starts
```

---

## Board Orientation

The board is **always shown from your perspective**:

- **You play White** → standard orientation, your pieces at the bottom (rank 1), files a→h left to right
- **You play Black** → board is flipped, your pieces still at the bottom (rank 8), files h→a left to right

Claude is always shown at the top of the screen regardless of color.

---

## Pieces & Rules Implemented

### Pawn

- Moves one square forward; two squares from starting rank
- Captures diagonally
- En passant capture
- Promotes on reaching the 8th rank (choose Queen, Rook, Bishop, or Knight)

### Knight

- L-shaped jump: two squares in one direction, one in another
- The only piece that leaps over other pieces
- 8 possible landing squares from any central position

### Bishop

- Slides diagonally any number of squares
- Blocked by pieces in its path

### Rook

- Slides horizontally or vertically any number of squares
- Blocked by pieces in its path
- Participates in castling

### Queen

- Combines Rook and Bishop movement
- Most powerful piece

### King

- Moves one square in any direction
- Cannot move into a square attacked by an opponent
- Castling (kingside and queenside) with strict conditions

---

## Check, Double Check & Checkmate

### Single Check

When one enemy piece threatens your king, you must resolve it by one of three methods:

1. **Move the king** to a safe square
2. **Capture** the attacking piece
3. **Block** the line of attack (only works for sliding pieces — rooks, bishops, queens; not knights)

> No piece may make a move that leaves your king in check — this is enforced on every candidate move via board simulation.

### Double Check

When two pieces simultaneously give check (only possible via a discovered check), **only the king can move**. Blocking or capturing is impossible because you cannot resolve two attacks in a single move.

### Checkmate

When the king is in check and there are zero legal moves for any piece — checkmate. The game ends immediately.

### Stalemate

When it is your turn, your king is **not** in check, but you have no legal moves at all — stalemate. The game is a draw.

---

## Chess Clock

Each player gets the same starting time. The clock works as follows:

| Event             | Behavior                                  |
| ----------------- | ----------------------------------------- |
| Game start        | Clock does NOT start yet                  |
| First move made   | Clock starts for the opponent             |
| After each move   | Active clock switches to the other player |
| ≤ 10 seconds left | Timer box flashes red                     |
| Time reaches 0    | That player loses on time                 |

### Time Controls

| Label  | Time per player |
| ------ | --------------- |
| Bullet | 1 minute        |
| Blitz  | 3 minutes       |
| Blitz  | 5 minutes       |
| Rapid  | 10 minutes      |

---

## Move Highlighting

After every move (by you or Claude), both the **origin square** and the **destination square** are highlighted with a semi-transparent golden colour. This lets both players instantly see what just moved and where.

Additionally:

- **Legal move dots** appear on empty squares a selected piece can move to
- **Capture rings** appear on enemy squares a selected piece can capture
- **Blue outline** shows the currently selected piece
- **Red square** highlights the king when it is in check

---

## Claude AI Engine

Claude uses the **Minimax algorithm with Alpha-Beta pruning** at depth 3.

### Evaluation

Each position is scored using:

- **Material value** — each piece type has a fixed point value
  - Pawn: 100 | Knight: 320 | Bishop: 330 | Rook: 500 | Queen: 900 | King: 20,000
- **Positional tables (PST)** — each piece has an 8×8 bonus table that rewards good square placement:
  - Pawns are rewarded for advancing toward promotion
  - Knights are rewarded for central squares
  - Bishops are rewarded for long diagonals
  - Rooks are rewarded for open files
  - Queens are rewarded for flexible central positions
  - Kings are penalised for exposed positions in the middlegame

### Search

- Minimax recursively evaluates all possible move sequences up to depth 3
- Alpha-Beta pruning eliminates branches that cannot affect the final result, allowing deeper search in the same time
- Claude automatically promotes pawns to Queens during AI calculations
- If no legal move exists, Claude resigns

### Thinking Indicator

A pulsing golden dot appears on Claude's king square while it is calculating its response move.

---

## PGN Export

After the game ends, click the **📄 PGN** button to open the PGN popup.

### PGN Includes

- Standard seven-tag roster: Event, Site, Date, White, Black, TimeControl, Result
- All moves in Standard Algebraic Notation (SAN)
- **Disambiguation** — when two identical pieces can reach the same square, the file or rank is added (e.g. `Nbd7`, `R1e2`)
- **Check symbol** `+` after moves that give check
- **Checkmate symbol** `#` on the final move
- **Castling** — `O-O` (kingside) and `O-O-O` (queenside)
- **En passant** — shown as a normal pawn capture
- **Promotion** — shown with `=` notation (e.g. `e8=Q`)
- Lines automatically wrapped at 76 characters per PGN standard
- Game result appended at the end (`1-0`, `0-1`, `1/2-1/2`)

### Example PGN Output

```
[Event "Casual Game vs Claude"]
[Site "Claude.ai"]
[Date "2025.04.13"]
[White "Human"]
[Black "Claude"]
[TimeControl "600"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6
8. c3 O-O 9. h3 Nb8 10. d4 Nbd7 1-0
```

### Copy to Clipboard

Use the **Copy PGN** button inside the popup to copy the full text. You can then paste it directly into:

- [Lichess.org](https://lichess.org) — Analysis board → Import game
- [Chess.com](https://chess.com) — Analysis → Load from PGN
- Any desktop chess GUI (Arena, Scid, ChessBase)

---

## Special Moves

### Castling

Kingside (`O-O`) and queenside (`O-O-O`) castling are available when:

1. The king and the relevant rook have not previously moved
2. No pieces stand between the king and rook
3. The king is not currently in check
4. The king does not pass through a square attacked by an opponent
5. The king does not land on a square attacked by an opponent

Castling rights are tracked and updated throughout the game — capturing a rook removes that side's castling right even if the king hasn't moved.

### En Passant

When a pawn advances two squares from its starting rank and lands beside an opponent's pawn, the opponent may capture it as if it had only moved one square — but only immediately on the very next move.

### Pawn Promotion

When a pawn reaches the opposite back rank (rank 8 for White, rank 1 for Black), a promotion modal appears. Choose from:

- ♛ Queen (recommended in most cases)
- ♜ Rook
- ♝ Bishop
- ♞ Knight

Claude automatically promotes to Queen during its AI calculations.

---

## Tech Stack

| Component    | Technology                                         |
| ------------ | -------------------------------------------------- |
| Language     | Vanilla JavaScript (ES6+)                          |
| Styling      | CSS3 with Google Fonts (Playfair Display, DM Sans) |
| Chess logic  | Custom implementation, zero dependencies           |
| AI engine    | Minimax + Alpha-Beta pruning, depth 3              |
| Piece images | Chess.com Neo piece set (CDN)                      |
| Fonts        | Google Fonts CDN                                   |
| Build tools  | None — single HTML file                            |

---

## Running Locally

No build step is required. The entire game is a single `.html` file.

```bash
# Clone or download the file
git clone https://github.com/your-username/Claude-vs-Human-Chess-Game.git

# Open directly in your browser
open index.html

# Or serve it with any static server
npx serve .
python -m http.server 8080
```

Works in all modern browsers: Chrome, Firefox, Safari, Edge.

> **Note:** Piece images are loaded from the Chess.com CDN. An internet connection is required for images to appear. All chess logic runs fully offline.

---

## Known Limitations

| Limitation                | Detail                                                          |
| ------------------------- | --------------------------------------------------------------- |
| No 50-move rule           | Draw by 50 moves without a pawn move or capture is not enforced |
| No threefold repetition   | Draws by repetition are not detected                            |
| No insufficient material  | Bishop vs King type draws are not auto-detected                 |
| AI promotes to Queen only | Claude always picks Queen; underpromotion is not used by the AI |
| AI depth is fixed at 3    | Deeper search would improve strength but increase response time |
| Single file               | No move history panel or captured pieces display                |

---

## License

MIT License — free to use, modify, and distribute.

---

_Built with Claude AI — [claude.ai](https://claude.ai)_
