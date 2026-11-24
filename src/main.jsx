import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/press-start-2p/latin-400.css';
import '@fontsource/vt323/latin-400.css';
import { createGame, flipTile, hideMismatch, signals, totalPairs } from './game.js';
import './styles.css';

const bestKey = 'signal-match-best';

function readBest() {
  try {
    const best = Number(window.localStorage.getItem(bestKey));
    return Number.isSafeInteger(best) && best >= totalPairs ? best : null;
  } catch {
    return null;
  }
}

function App() {
  const [game, setGame] = useState(() => createGame());
  const [best, setBest] = useState(readBest);
  const rules = useRef(null);
  const firstTile = useRef(null);
  const pairs = game.matched.length / 2;
  const won = pairs === totalPairs;

  useEffect(() => {
    if (game.open.length !== 2) return;

    const timeout = setTimeout(() => {
      setGame((current) => current === game ? hideMismatch(current) : current);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [game]);

  useEffect(() => {
    if (!won || (best !== null && best <= game.moves)) return;

    setBest(game.moves);
    try {
      window.localStorage.setItem(bestKey, String(game.moves));
    } catch {
      // The current game and score are still available in memory.
    }
  }, [won, best, game.moves]);

  function restart() {
    setGame(createGame());
    firstTile.current.focus();
  }

  let status = pairs > 0 ? `${pairs} of ${totalPairs} pairs found. Keep going.` : 'Flip a tile to begin.';
  if (game.open.length === 1) status = 'Find the matching signal.';
  if (game.open.length === 2) status = 'No match. Try again.';
  if (won) status = `All pairs found in ${game.moves} moves!`;

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark" aria-hidden="true" /> Sample Arcade</div>
        <button className="help" onClick={() => rules.current.showModal()}>
          <span className="help-mark" aria-hidden="true">?</span> How to play
        </button>
      </header>

      <main className="layout">
        <div className="intro">
          <h1 aria-label="Ghost Relay"><span>Ghost</span>{' '}<span>Relay</span></h1>
          <p>Flip the tiles and match all eight signals. Fewer moves earns a better score.</p>
        </div>

        <section className="scoreboard" aria-label="Score">
          <div className="stats">
            <div className="stat"><span>Moves</span><strong>{game.moves}</strong></div>
            <div className="stat">
              <span>Pairs found</span><strong>{pairs}<small> / {totalPairs}</small></strong>
            </div>
          </div>
          <div className="progress" aria-hidden="true">
            {Array.from({ length: totalPairs }, (_, index) =>
              <span key={index} className={index < pairs ? 'filled' : ''} />)}
          </div>
        </section>

        <section className="console" aria-label="Game board">
          <div className="console-header">
            <h2><span className="activity" aria-hidden="true" /> Signal grid</h2>
            <span>4 × 4</span>
          </div>
          <div className="board">
            {game.deck.map((name, index) => {
              const matched = game.matched.includes(index);
              const open = game.open.includes(index);
              const revealed = open || matched;
              const label = revealed ? `Tile ${index + 1}, ${name}${matched ? ', matched' : ''}` : `Tile ${index + 1}, hidden`;
              return (
                <button
                  className="tile"
                  key={index}
                  ref={index === 0 ? firstTile : null}
                  data-face={matched ? 'matched' : open ? 'open' : 'hidden'}
                  aria-label={label}
                  aria-disabled={revealed || game.open.length === 2}
                  onClick={() => setGame((current) => flipTile(current, index))}
                >
                  {revealed
                    ? <span className={`signal ${signals[name]}`} aria-hidden="true" />
                    : <span className="tile-mark" aria-hidden="true">?</span>}
                </button>
              );
            })}
          </div>
          <p className="board-status" role="status" aria-atomic="true">
            <span aria-hidden="true">{won ? '✓' : '↳'}</span> {status}
          </p>
        </section>

        <div className="controls">
          <button className="restart" onClick={restart}>
            <span aria-hidden="true">↻</span> New game
          </button>
          <p className="best"><span aria-hidden="true">◇</span> Personal best <strong>{best === null ? '—' : `${best} moves`}</strong></p>
        </div>
      </main>

      <dialog ref={rules} aria-labelledby="rules-title">
        <h2 id="rules-title">How to play</h2>
        <ol>
          <li>Flip any two tiles. Each pair of flips counts as one move.</li>
          <li>Matching signals stay visible. Other tiles turn back over.</li>
          <li>Find all eight pairs to finish. Your best score stays in this browser.</li>
        </ol>
        <form method="dialog"><button className="restart" autoFocus>Got it</button></form>
      </dialog>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
