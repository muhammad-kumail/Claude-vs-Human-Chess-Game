export const clone = (b) => b.map((row) => [...row]);

export const isWhite = (p) => !!p && p === p.toUpperCase();
export const isBlack = (p) => !!p && p === p.toLowerCase();
export const sameColor = (a, b) =>
  (isWhite(a) && isWhite(b)) || (isBlack(a) && isBlack(b));

export const inBounds = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;

export const formatTime = (s) => {
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return String(m).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
};

export const findKing = (b, white) => {
  const k = white ? 'K' : 'k';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (b[r][c] === k) return { r, c };
    }
  }
  return null;
};
