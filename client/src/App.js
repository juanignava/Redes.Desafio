import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

import './App.css'

const socket = io('http://localhost:5000');


function App() {
  const [gameState, setGameState] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('');
  const [isPlayerX, setIsPlayerX] = useState(true);
  const [winner, setWinner] = useState('');

  useEffect(() => {
    getGameState();
    getTurnInfo();

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
      console.log(response)
      setCurrentPlayer(response.data.current_player);
      setWinner(response.data.winner);
    } catch (error) {
      console.error(error);
    }
  };

  const getTurnInfo = async () => {
    try {
      const response = await axios.get('http://localhost:5000/turnInfo');
      if (response.data.turn == 'X') setIsPlayerX(true)
      else setIsPlayerX(false);
    } catch (error) {
      console.error(error);
    }
  };

  const makeMove = async (row, col) => {
    if (currentPlayer !== (isPlayerX ? 'X' : 'O') || winner !== ' ') {
      return;
    }

    try {
      await axios.post('http://localhost:5000/move', { row, col });
      getGameState();
    } catch (error) {
      console.error(error);
    }
  };

  const restartGame = async () => {
    try {
      await axios.post('http://localhost:5000/restart');
      getGameState();
    } catch (error) {
      console.error(error);
    }
  };

  return (


    <div style={{
      color: 'white',
    }}>

      <link href='https://fonts.googleapis.com/css?family=Righteous' rel='stylesheet'></link>
      <div>
        {isPlayerX && (<h1>You are playing as X</h1>)}
        {!isPlayerX && (<h1>You are playing as O</h1>)}
      </div>
      <div className="container">

        

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
                      color: 'white',


                      fontSize: "100px",

                      borderTop:
                        rowIndex === 0 ? 'none' : "solid 5px white",
                      borderLeft:
                        colIndex === 1 ? 'solid 5px white' : "none",
                      borderRight:
                        colIndex === 1 ? 'solid 5px white' : "none",
                      height: "150px",
                      width: "150px",
                      textAlign: "center"
                    }}
                    disabled={cell !== ' ' || currentPlayer !== (isPlayerX ? 'X' : 'O') || winner !== ' '}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

      </div>

      <div style={{marginLeft:"20px", marginTop:"50px", fontSize:"25px", letterSpacing:"3px"}}>

        {(winner === 'X' || winner === 'O') && (
          <h2>The winner is: {winner}</h2>
        )}
        {winner === ' ' && (
          <h2>Current Player: {currentPlayer}</h2>
        )}
        {winner === 'tie' && (
          <h2>Tied Match!</h2>
        )}
        {winner !== ' ' && (
          <button onClick={restartGame} style={{border:"none", backgroundColor:'white', width:"130px", height:"50px", fontSize:"30px", borderRadius:"15px", fontFamily:"Righteous", cursor:'pointer'}}>Restart</button>
        )}
      </div>

    </div>
  );
}

export default App;
