import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');


function App() {
  const [gameState, setGameState] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('');
  const [isPlayerX, setIsPlayerX] = useState(true);
  const [winner, setWinner] = useState('');

  useEffect(() => {
    getGameState();

    // Listen for 'game_state' event from the server
    socket.on('game_state', (data) => {
      setGameState(data.matrix);
      setCurrentPlayer(data.current_player);
      setWinner(data.winner);
    });

    return () => {
      // Clean up the event listener when the component unmounts
      socket.off('game_state');
    };
  }, []);

  const getGameState = async () => {
    try {
      const response = await axios.get('http://localhost:5000/game');
      setGameState(response.data.matrix);
      setCurrentPlayer(response.data.current_player);
      setWinner(response.data.winner);
    } catch (error) {
      console.error(error);
    }
  };

  const makeMove = async (row, col) => {
    if (currentPlayer !== (isPlayerX ? 'X' : 'O') || winner !== '-') {
      return;
    }

    try {
      await axios.post('http://localhost:5000/move', { row, col });
      getGameState();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Tic Tac Toe</h1>
      <div>
        <label>
          X
          <input
            type="checkbox"
            checked={isPlayerX}
            onChange={() => setIsPlayerX(!isPlayerX)}
          />
        </label>
      </div>
      <table>
        <tbody>
          {gameState.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => (
                <td
                  key={colIndex}
                  onClick={() => makeMove(rowIndex, colIndex)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor:
                      currentPlayer === cell ? 'lightgreen' : 'transparent',
                  }}
                  disabled={cell !== '-' || currentPlayer !== (isPlayerX ? 'X' : 'O') || winner !== '-'}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {winner !== '-' && (
        <h2>The winner is: {winner}</h2>
      )}
      {winner === '-' && (
        <h2>Current Player: {currentPlayer}</h2>
      )}
    </div>
  );
}

export default App;
