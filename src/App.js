import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "https://tic-tac-toe-backend-ocb9.onrender.com";

function App() {
  const [board, setBoard] = useState(Array(9).fill(" "));
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [winner, setWinner] = useState(null);
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [tossWinner, setTossWinner] = useState(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [coinTossed, setCoinTossed] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    fetchGameState();
  }, []);

  const fetchGameState = async () => {
    try {
      const response = await axios.get(`${API_URL}/game-state`);
      setBoard(response.data.board);
      setCurrentPlayer(response.data.current_player);
      setWinner(response.data.winner);
      setScores(response.data.scores);
    } catch (error) {
      console.error("Error fetching game state:", error);
    }
  };

  const makeMove = async (index) => {
    if (!gameStarted || board[index] !== " " || winner) return;

    try {
      const response = await axios.post(`${API_URL}/make-move`, { index });
      setBoard(response.data.state.board);
      setCurrentPlayer(response.data.state.current_player);
      setWinner(response.data.winner);
      setScores(response.data.state.scores);
    } catch (error) {
      console.error("Error making move:", error);
    }
  };

  const startNewRound = async () => {
    document.querySelector(".board").classList.add("resetting");

    setTimeout(async () => {
      try {
        await axios.post(`${API_URL}/reset`);
        fetchGameState();
        document.querySelector(".board").classList.remove("resetting");
      } catch (error) {
        console.error("Error starting new round:", error);
      }
    }, 500);
  };

  const handleCoinToss = async () => {
    if (isFlipping || coinTossed) return;
    setIsFlipping(true);
    setTossWinner(null);
    setCoinTossed(true);

    setTimeout(async () => {
      try {
        const response = await axios.get(`${API_URL}/coin-toss`);
        setTossWinner(response.data.winner);
      } catch (error) {
        console.error("Error performing coinc toss:", error);
      } finally {
        setIsFlipping(false);
      }
    }, 1500);
    };

  const chooseMarker = async (marker) => {
    try {
      await axios.post(`${API_URL}/set-starting-player`, { marker });
      setCurrentPlayer(marker);
      setGameStarted(true);
    } catch (error) {
      console.error("Error setting starting player:", error);
    }
  };

  const resetScores = async () => {
    try {
      await axios.post(`${API_URL}/reset-scores`);
      fetchGameState();
    } catch (error) {
      console.error("Error resetting scores:", error);
    }
  };

  return (
    <div className="container">
      <h1>Tic Tac Toe</h1>

      {!gameStarted ? (
        <div className="instructions">
          <h2>Welcome to Tic Tac Toe!</h2>
          <p>First, flip a coin to decide who chooses X or O.</p>
          
          <div className="coin-container">
            {isFlipping ? (
              <div className="coin flip"></div>
            ) : tossWinner ? (
              <h3>{tossWinner} won the toss! Choose your marker:</h3>
            ) : (
              <button onClick={handleCoinToss} className="toss-btn">Flip Coin</button>
            )}
          </div>

          {tossWinner && (
            <div>
              <h3>{tossWinner} won the toss! Choose your marker:</h3>
              <button onClick={() => chooseMarker("X")} className="marker-btn">Be X</button>
              <button onClick={() => chooseMarker("O")} className="marker-btn">Be O</button>
            </div>
          )}
        </div>
      ) : (
        <>
          <h2>{winner ? `Winner: ${winner}` : `Current Player: ${currentPlayer}`}</h2>
          <h3>Scores - X: {scores.X} | O: {scores.O}</h3>

          <div className="board">
            {board.map((cell, index) => (
              <button
                key={index}
                className={`cell ${cell === "X" ? "x-marker" : cell === "O" ? "o-marker" : ""}`}
                onClick={() => makeMove(index)}
                disabled={winner !== null}
              >
                {cell}
              </button>
            ))}
          </div>

          <button onClick={startNewRound} className="new-round-btn">New Round</button>
          <button onClick={resetScores} className="reset-scores-btn">Reset Scores</button>

        </>
      )}
    </div>
  );
}

export default App;
