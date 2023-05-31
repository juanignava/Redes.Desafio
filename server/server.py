from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit



app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
socketio = SocketIO(app)
socketio = SocketIO(app, cors_allowed_origins='*')


# Matrix representation of the Tic Tac Toe game
matrix = [['-', '-', 'X'], ['X', 'O', 'X'], ['X', 'X', 'X']]

# Current player
current_player = 'X'

# Emit game state to connected clients
def emit_game_state():
    socketio.emit('game_state', {'matrix': matrix, 'current_player': current_player})


# Route for getting the current game state
@app.route('/game', methods=['GET'])
def get_game_state():
    return jsonify({
        'matrix': matrix,     
        'current_player': current_player
    })

# Route for making a move
@app.route('/move', methods=['POST'])
def make_move():
    global matrix, current_player

    data = request.get_json()
    row = data['row']
    col = data['col']

    # Update the matrix with the player's move
    matrix[row][col] = current_player

    # Toggle the current player for the next move
    current_player = 'O' if current_player == 'X' else 'X'

    # Emit updated game state to connected clients
    emit_game_state()

    return jsonify({'message': 'Move successful'})

@socketio.on('connect')
def handle_connect():
    emit_game_state()

if __name__ == '__main__':
    CORS(app)
    socketio.run(app)