export const signals = {
  Orbit: 'orbit',
  Prism: 'prism',
  Spark: 'spark',
  Pulse: 'pulse',
  Stack: 'stack',
  Cross: 'cross',
  Wave: 'wave',
  Beacon: 'beacon',
};

export const totalPairs = Object.keys(signals).length;

export function createGame(random = Math.random) {
  const names = Object.keys(signals);
  const deck = [...names, ...names];

  for (let index = deck.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [deck[index], deck[swap]] = [deck[swap], deck[index]];
  }

  return { deck, open: [], matched: [], moves: 0 };
}

export function flipTile(game, index) {
  if (!game.deck[index] || game.open.length === 2 ||
      game.open.includes(index) || game.matched.includes(index)) {
    return game;
  }

  const [first] = game.open;
  if (first === undefined) {
    return { ...game, open: [index] };
  }
  if (game.deck[first] === game.deck[index]) {
    return { ...game, open: [], matched: [...game.matched, first, index], moves: game.moves + 1 };
  }
  return { ...game, open: [first, index], moves: game.moves + 1 };
}

export function hideMismatch(game) {
  return game.open.length === 2 ? { ...game, open: [] } : game;
}
