# Chess vs Claude (React + Vite)

A fully playable, browser-based chess game where you challenge **Claude** (the built-in minimax engine) in a one-on-one match. The app runs entirely in the browser—no backend.

---

##Screenshot

<img width="1196" height="711" alt="Screenshot 2026-04-20 at 1 48 18 PM" src="https://github.com/user-attachments/assets/110756e8-9832-4128-953d-7cfbf290cc2e" />

---

## Table of Contents

- [Overview](#overview)
- [Project structure](#project-structure)
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

- Full chess rule enforcement (all pieces, castling, en passant, promotion)
- AI opponent using **Minimax with Alpha-Beta pruning** (depth 3)
- Dual chess timers (bullet, blitz, rapid)
- Move-from/to square highlighting and legal-move hints
- PGN export with algebraic notation
- Check, checkmate, and stalemate detection
- Board flip when you play Black

---

## Project structure

```
src/
├── App.jsx
├── main.jsx
├── index.css
├── engine/           # Pure chess logic (no React)
│   ├── constants.js
│   ├── utils.js
│   ├── moves.js
│   ├── rules.js
│   ├── ai.js
│   └── san.js
├── hooks/
│   └── useChessGame.js
└── components/
    ├── Board/
    ├── PlayerBar/
    ├── StatusBar/
    └── Modals/
```

---

## Features

| Feature                   | Details                                                      |
| ------------------------- | ------------------------------------------------------------ |
| All 6 piece types         | Pawn, Knight, Bishop, Rook, Queen, King                      |
| Full legal move filtering | No move can leave your own king in check                     |
| Check detection           | Check, checkmate, stalemate                                  |
| Special moves             | Castling (K & Q side), En passant, Pawn promotion            |
| Chess clock               | 1 min / 3 min / 5 min / 10 min per player                    |
| Move highlight            | From-square and to-square glow after every move              |
| AI opponent               | Minimax depth-3 with Alpha-Beta pruning + positional tables  |
| Board flip                | Board always shown from your perspective                     |
| PGN export                | Headers, SAN, disambiguation, `+` / `#`, castling, promotion |
| Promotion UI              | Modal to choose Queen, Rook, Bishop, or Knight               |

---

## How to Play

1. Install dependencies and start the dev server (see [Running Locally](#running-locally))
2. A **time control** modal appears — pick your preferred time limit
3. A **side selection** modal appears — choose White or Black
4. The board shows **Claude at the top** and **you at the bottom**
5. If you picked **White**, you move first. If **Black**, Claude moves first
6. Click one of your pieces to see legal moves highlighted
7. Click a highlighted square to move
8. The active player’s clock starts after the **first move** of the game
9. Play until checkmate, stalemate, or time runs out
10. After the game ends, use **PGN** to view and copy the game notation

---

## Game Setup Flow

```
Start app
    │
    ▼
┌─────────────────────┐
│  Choose Time Control│
│  1min / 3min /      │
│  5min / 10min       │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Choose Your Side   │
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

- **You play White** → standard orientation: your pieces at the bottom (rank 1), files a→h left to right
- **You play Black** → board is flipped: your pieces at the bottom (rank 8), files h→a left to right

Claude stays at the top of the screen regardless of color.

---

## Pieces & Rules Implemented

### Pawn

- One square forward; two from the starting rank
- Diagonal captures
- En passant
- Promotion on the last rank (Queen, Rook, Bishop, or Knight)

### Knight

- L-shaped jump; can leap over pieces

### Bishop

- Diagonal slides; blocked by pieces in the path

### Rook

- Horizontal/vertical slides; blocked; used in castling

### Queen

- Combines rook and bishop movement

### King

- One square in any direction
- Cannot move into check
- Castling (kingside and queenside) with standard conditions

---

## Check, Double Check & Checkmate

### Single check

Resolve check by moving the king, capturing the attacker, or (for sliding attackers) blocking the line.

> Every legal move is filtered so your king never ends in check.

### Double check

When two pieces give check (typically discovered check), **only the king can move**.

### Checkmate

King is in check and there are no legal moves.

### Stalemate

King is not in check but there are no legal moves — draw.

---

## Chess Clock

| Event             | Behavior                                  |
| ----------------- | ----------------------------------------- |
| Game start        | Clock does not run until the first move   |
| After each move   | Active clock switches to the other player |
| ≤ 10 seconds left | Player bar shows a low-time style         |
| Time reaches 0    | That player loses on time                 |

### Time controls

| Label  | Time per player |
| ------ | --------------- |
| Bullet | 1 minute        |
| Blitz  | 3 minutes       |
| Blitz  | 5 minutes       |
| Rapid  | 10 minutes      |

---

## Move Highlighting

- **From / to** squares highlighted after each move
- **Dots** on empty squares for quiet moves
- **Rings** on squares where a capture (including en passant) is possible
- **Outline** on the selected piece
- **Red** highlight on the king when in check

---

## Claude AI Engine

**Minimax + Alpha-Beta pruning**, search depth **3**.

### Evaluation

- **Material**: Pawn 100, Knight 320, Bishop 330, Rook 500, Queen 900, King 20,000
- **Piece-square tables** for positional bonuses (e.g. central knights, advanced pawns)

### Search

- AI promotes to **Queen** automatically in its search and play
- If no legal move exists, the game ends in a draw by the no-move path in the UI

### Thinking indicator

A pulsing dot appears on **Claude’s king** while the engine is calculating.

---

## PGN Export

After the game ends, open **PGN** to view the text and copy it.

### Included tags

The exporter writes these headers (no `TimeControl` tag is emitted today):

- `Event` — `"Claude vs Human"`
- `Site` — `"claude.ai"`
- `Date` — game date (`YYYY.MM.DD`)
- `White` / `Black` — `"Human"` or `"Claude"` depending on your side
- `Result` — `1-0`, `0-1`, `1/2-1/2`, or `*` while in progress

Move text includes SAN with disambiguation, `+` / `#`, castling (`O-O` / `O-O-O`), captures, and promotion (`=Q`, etc.). Long lines wrap at roughly **78** characters.

### Example PGN output

```
[Event "Claude vs Human"]
[Site "claude.ai"]
[Date "2026.04.18"]
[White "Human"]
[Black "Claude"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6
8. c3 O-O 9. h3 Nb8 10. d4 Nbd7 1-0
```

You can paste PGN into [Lichess](https://lichess.org) or [Chess.com](https://www.chess.com) analysis tools.

---

## Special Moves

### Castling

Available when king and rook have not moved, squares between are empty, the king is not in check, and the king does not cross or land on attacked squares. Castling rights update when rooks move or are captured.

### En passant

Allowed only on the move immediately after the opposing pawn’s double push.

### Pawn promotion

Human chooses piece in a modal; the AI promotes to Queen.

---

## Tech Stack

| Area        | Technology                                               |
| ----------- | -------------------------------------------------------- |
| UI          | React 19                                                 |
| Build       | Vite 8, `@vitejs/plugin-react`                           |
| Linting     | ESLint 9 + `eslint-plugin-react-hooks`                   |
| Chess logic | Custom engine modules (no chess library)                 |
| AI          | Minimax + Alpha-Beta, depth 3                            |
| Assets      | Chess.com Neo piece images (CDN)                         |
| Fonts       | Google Fonts (Playfair Display, DM Sans) via `index.css` |

---

## Running Locally

```bash
cd claude-chess-react
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173/`).

```bash
npm run build    # production build → dist/
npm run preview  # serve dist/
npm run lint     # ESLint
```

Works in current Chrome, Firefox, Safari, and Edge.

> **Note:** Piece images load from the Chess.com CDN; you need a network connection for them to appear. All move generation and AI run in the browser.

---

## Known Limitations

| Limitation               | Detail                                                    |
| ------------------------ | --------------------------------------------------------- |
| No 50-move rule          | Not enforced                                              |
| No threefold repetition  | Not detected                                              |
| No insufficient material | Not auto-detected                                         |
| AI underpromotion        | AI always promotes to Queen                               |
| Fixed AI depth           | Depth is 3; stronger play would need more depth or tuning |
| UI                       | No move list or captured-pieces panel                     |

---

## License

MIT License — free to use, modify, and distribute.

---

_Built with Claude — [claude.ai](https://claude.ai)_
