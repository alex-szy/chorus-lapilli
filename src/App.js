import { useState } from 'react';
import './App.css'

////////////////////////////////////
//// Stateless Helper Functions ////
////////////////////////////////////

function formsLine(squares, char) {
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
    if (squares[a] === char && squares[b] === char && squares[c] === char) {
      return true;
    }
  }
  return false;
}

function isWinningMove(squares, src, dst) {
  const nextSquares = squares.slice();
  nextSquares[dst] = nextSquares[src];
  nextSquares[src] = null;
  return formsLine(nextSquares, nextSquares[dst]);
}

function validMoves(nextPlayer, squares, currMove) {
  const adjacent = [
    [1, 3, 4],
    [0, 2, 3, 4, 5],
    [1, 4, 5],
    [0, 1, 4, 6, 7],
    [0, 1, 2, 3, 5, 6, 7, 8],
    [1, 2, 4, 7, 8],
    [3, 4, 7],
    [3, 4, 5, 6, 8],
    [4, 5, 7]
  ];
  const validMoves = {};
  if (formsLine(squares, nextPlayer === 'X' ? 'O' : 'X')) { // If someone has already won according to the board, no valid moves to take
    return validMoves;
  }
  if (currMove <= 5) { // If someone hasn't already won and is it still before turn 6 there are always valid moves, just return null
    return null;
  }
  for (let i in squares) { // for each square on the board
    if (squares[i] === nextPlayer) { // if this is my square
      const moves = [];
      for (let j in adjacent[i]) { // for each adjacent square to this square
        if (squares[4] === nextPlayer) { // in center, only moves that will win or moves on the center square are valid
          if (!squares[adjacent[i][j]] && (i === '4' || isWinningMove(squares, i, adjacent[i][j]))) {
            moves.push(adjacent[i][j]);
          }
        } else { // not in center, all moves are valid
          if (!squares[adjacent[i][j]]) { // if the adjacent square is empty
            moves.push(adjacent[i][j]);
          }
        }
      }
      validMoves[i] = moves;
    }
  }
  return validMoves;
}

function calculateWinner(nextPlayer, validMoves) {
  if (validMoves === null) { // null return means nobody has won yet before the chorus phase
    return null;
  }
  // empty dictionary means lost
  for (let i in validMoves) {
    if (validMoves[i].length !== 0) { // if there are any valid moves the game is not over yet
      return null;
    }
  }
  return nextPlayer === 'X' ? 'O' : 'X'; // other person wins if no valid moves
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

function Board({ squares, styles, status, handleClick }) {
  return (
    <>
      <div className="status">{status}</div>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} style={styles[0]}/>
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} style={styles[1]}/>
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} style={styles[2]}/>
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} style={styles[3]}/>
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} style={styles[4]}/>
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} style={styles[5]}/>
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} style={styles[6]}/>
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} style={styles[7]}/>
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} style={styles[8]}/>
      </div>
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [srcSelection, setSrcSelection] = useState(null);
  const [moveHistory, setMoveHistory] = useState([null]);

  function handlePlay(nextSquares, nextMove) {
    const nextMoveHistory = [...moveHistory.slice(0, currentMove + 1), validMoves(nextMove % 2 === 0 ? 'X' : 'O', nextSquares, nextMove)];
    setMoveHistory(nextMoveHistory);
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
    setSrcSelection(null);
  }

  function handleClick(i) {
    if (calculateWinner(xIsNext ? 'X' : 'O', currMoves)) { // Nobody moves if someone has won
      return;
    }
    const nextSquares = currentSquares.slice();

    if (currentMove > 5) { // turn 6, start moving the pieces around
      // if i am occupying the center piece, i must either win or vacate. if i cannot vacate, i will lose
      if (!(srcSelection === null) && currMoves[srcSelection].includes(i)) { // selected a viable move
        nextSquares[srcSelection] = null;
        nextSquares[i] = xIsNext ? 'X' : 'O';
        setSrcSelection(null);
        handlePlay(nextSquares, currentMove + 1);
      } else { // either move isn't viable or not yet selected
        // am i in the center
        // if i am get list of valid moves, select the
        setSrcSelection(null);
        if (i in currMoves) {
          setSrcSelection(i);
        }
      }
    } else { // not yet turn 6, normal tic tac toe
      if (currentSquares[i]) { // if there is a square at the current position
        return;
      }
      nextSquares[i] = xIsNext ? 'X' : 'O';
      handlePlay(nextSquares, currentMove + 1);
    }
  }

  // On render, code starts executing here
  const xIsNext = currentMove % 2 === 0;
  const nextPlayer = xIsNext ? 'X' : 'O';
  const currentSquares = history[currentMove];
  const currMoves = moveHistory[currentMove];
  const styles = Array(9).fill("square");
  if (srcSelection !== null) {
    styles[srcSelection] = "src";
    currMoves[srcSelection].forEach((sq) => { styles[sq] = "dst" });
  }

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

  const winner = calculateWinner(nextPlayer, currMoves);
  const status = winner ? 'Winner: ' + winner : 'Next player: ' + nextPlayer;

  return (
    <div className="game">
      <div className="game-board">
        <Board status={status} squares={currentSquares} handleClick={handleClick} styles={styles} />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}