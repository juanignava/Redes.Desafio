from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit



app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
socketio = SocketIO(app)
socketio = SocketIO(app, cors_allowed_origins='*')


# Matrix representation of the Tic Tac Toe game
matrix = [['-', '-', '-'], ['-', '-', '-'], ['-', '-', '-']]

# Current player
current_player = 'X'

winner = '-'

# Emit game state to connected clients
def emit_game_state():
    socketio.emit('game_state', {'matrix': matrix, 'current_player': current_player, 'winner': winner})

# Function to check for a winner
def check_winner():
    # Check rows
    for row in matrix:
        if row[0] == row[1] == row[2] != '-':
            return row[0]

    # Check columns
    for col in range(3):
        if matrix[0][col] == matrix[1][col] == matrix[2][col] != '-':
            return matrix[0][col]

    # Check diagonals
    if matrix[0][0] == matrix[1][1] == matrix[2][2] != '-':
        return matrix[0][0]
    if matrix[0][2] == matrix[1][1] == matrix[2][0] != '-':
        return matrix[0][2]
    
    for row in matrix:
        for col in row:
            if col == '-':
                return '-'

    return 'tie'


# Route for getting the current game state
@app.route('/game', methods=['GET'])
def get_game_state():
    return jsonify({
        'matrix': matrix,     
        'current_player': current_player,
        'winner': winner
    })

# Route for making a move
@app.route('/move', methods=['POST'])
def make_move():
    global matrix, current_player, winner

    data = request.get_json()
    row = data['row']
    col = data['col']

    # Update the matrix with the player's move
    matrix[row][col] = current_player

    # Toggle the current player for the next move
    current_player = 'O' if current_player == 'X' else 'X'

    winner = check_winner()

    # Emit updated game state to connected clients
    emit_game_state()

    return jsonify({'message': 'Move successful'})

# Route for restarting the game
@app.route('/restart', methods=['POST'])
def restart_game():
    global matrix, current_player, winner

    # Reset the game state
    matrix = [['-', '-', '-'], ['-', '-', '-'], ['-', '-', '-']]
    current_player = 'X'
    winner = '-'

    # Emit updated game state to connected clients
    emit_game_state()

    return jsonify({'message': 'Game restarted'})

@socketio.on('connect')
def handle_connect():
    emit_game_state()

if __name__ == '__main__':
    CORS(app)
    socketio.run(app)