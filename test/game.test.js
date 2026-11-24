import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createGame, flipTile, hideMismatch, signals, totalPairs } from '../src/game.js';

test('the deck contains exactly two of each signal', () => {
  const { deck } = createGame();
  assert.equal(deck.length, 16);
  for (const name of Object.keys(signals)) {
    assert.equal(deck.filter((tile) => tile === name).length, 2);
  }
});

test('a pair counts as one move and stays matched', () => {
  const game = createGame();
  const partner = game.deck.lastIndexOf(game.deck[0]);
  const opened = flipTile(game, 0);
  assert.equal(opened.moves, 0);
  assert.strictEqual(flipTile(opened, 0), opened);
  const matched = flipTile(opened, partner);
  assert.equal(matched.moves, 1);
  assert.deepEqual(matched.open, []);
  assert.deepEqual(matched.matched, [0, partner]);
  assert.strictEqual(flipTile(matched, partner), matched);
});

test('a mismatch blocks a third flip until the tiles are hidden', () => {
  const game = createGame();
  const other = game.deck.findIndex((tile) => tile !== game.deck[0]);
  const mismatch = flipTile(flipTile(game, 0), other);
  const third = game.deck.findIndex((_, index) => index !== 0 && index !== other);
  assert.equal(mismatch.moves, 1);
  assert.deepEqual(mismatch.open, [0, other]);
  assert.deepEqual(mismatch.matched, []);
  assert.strictEqual(flipTile(mismatch, third), mismatch);
  assert.deepEqual(flipTile(hideMismatch(mismatch), third).open, [third]);
});

test('matching all eight pairs completes the board in eight moves', () => {
  let game = createGame();
  for (const signal of Object.keys(signals)) {
    game = flipTile(game, game.deck.indexOf(signal));
    game = flipTile(game, game.deck.lastIndexOf(signal));
  }
  assert.equal(game.matched.length, 16);
  assert.equal(game.moves, totalPairs);
  assert.equal(createGame().moves, 0);
});
