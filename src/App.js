import { useState } from 'react';
import './App.css'

////////////////////////////////////
//// Stateless Helper Functions ////
////////////////////////////////////

function formsLine(squares, player) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] === player && squares[b] === player && squares[c] === player) {
      return true;
    }
  }
  return false;
}

function isValidMove(nextPlayer, squares, src, dst) { // Called on the 2nd click after selecting a box
  const adjacent = [
    new Set([1, 3, 4]),
    new Set([0, 2, 3, 4, 5]),
    new Set([1, 4, 5]),
    new Set([0, 1, 4, 6, 7]),
    new Set([0, 1, 2, 3, 5, 6, 7, 8]),
    new Set([1, 2, 4, 7, 8]),
    new Set([3, 4, 7]),
    new Set([3, 4, 5, 6, 8]),
    new Set([4, 5, 7])
  ];
  if (squares[src] !== nextPlayer) return false; // if src isn't belonging to player
  if (!adjacent[src].has(dst)) return false; // if isn't adjacent square
  if (squares[dst]) return false; // if adjacent square isn't empty
  if (squares[4] !== nextPlayer || src === 4) return true; // if player isn't occupying the center square or if the move is on the center square
  // move must win
  const nextSquares = squares.slice();
  nextSquares[dst] = nextSquares[src];
  nextSquares[src] = null;
  return formsLine(nextSquares, nextPlayer);
}

function hasPrevWon(nextPlayer, squares) { 
  const prevPlayer = nextPlayer === 'X' ? 'O' : 'X';
  if (formsLine(squares, prevPlayer)) { // If someone has already won
    return prevPlayer;
  }
  return null;
}

////////////////////
//// Components ////
////////////////////

function Square({ value, onSquareClick, style }) {
  return (
    <button className={style} onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ squares, srcSelection, status, handleClick }) {
  return (
    <>
      <div className="status">{status}</div>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} style={srcSelection === 0 ? 'src' : 'square'}/>
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} style={srcSelection === 1 ? 'src' : 'square'}/>
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} style={srcSelection === 2 ? 'src' : 'square'}/>
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} style={srcSelection === 3 ? 'src' : 'square'}/>
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} style={srcSelection === 4 ? 'src' : 'square'}/>
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} style={srcSelection === 5 ? 'src' : 'square'}/>
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} style={srcSelection === 6 ? 'src' : 'square'}/>
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} style={srcSelection === 7 ? 'src' : 'square'}/>
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} style={srcSelection === 8 ? 'src' : 'square'}/>
      </div>
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [srcSelection, setSrcSelection] = useState(null);

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
    setSrcSelection(null);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
    setSrcSelection(null);
  }

  function handleClick(i) {
    if (hasPrevWon(nextPlayer, currentSquares)) { // Nobody moves if someone has won
      return;
    }
    const nextSquares = currentSquares.slice();
    if (currentMove > 5) { // turn 6, start moving the pieces around
      if (srcSelection === null) { // If i have not selected a square
        if (currentSquares[i] === nextPlayer) {
          setSrcSelection(i);
        } else {
          setSrcSelection(null);
        }
      }
      else {
        if (isValidMove(nextPlayer, currentSquares, srcSelection, i)) { // If the next square is a valid move
          nextSquares[srcSelection] = null;
          nextSquares[i] = nextPlayer;
          handlePlay(nextSquares);
        }
        else if (currentSquares[i] === nextPlayer) {
          setSrcSelection(i);
        }
      }
    }
    else { // not yet turn 6, normal tic tac toe
      if (currentSquares[i]) { // if there is a square at the current position
        return;
      }
      nextSquares[i] = nextPlayer;
      handlePlay(nextSquares);
    }
  }

  // On render, code starts executing here
  const xIsNext = currentMove % 2 === 0;
  const nextPlayer = xIsNext ? 'X' : 'O';
  const currentSquares = history[currentMove];

  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = 'Go to move #' + move;
    } else {
      description = 'Go to game start';
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  const winner = hasPrevWon(nextPlayer, currentSquares);
  const status = winner ? 'Winner: ' + winner : 'Next player: ' + nextPlayer;

  return (
    <div className="game">
      <div className="game-board">
        <Board status={status} squares={currentSquares} handleClick={handleClick} srcSelection={srcSelection} />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}