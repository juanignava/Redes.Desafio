import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [gameState, setGameState] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('');

  useEffect(() => {
    getGameState();
  }, []);

  const getGameState = async () => {
    try {
      const response = await axios.get('http://localhost:5000/game');
      setGameState(response.data.matrix);
      setCurrentPlayer(response.data.current_player);
    } catch (error) {
      console.error(error);
    }
  };

  const makeMove = async (row, col) => {
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
      <table>
        <tbody>
          {gameState.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => (
                <td
                  key={colIndex}
                  onClick={() => makeMove(rowIndex, colIndex)}
                  style={{ cursor: 'pointer' }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <h1>Current Player: {currentPlayer}</h1>
    </div>
  );
}

export default App;
