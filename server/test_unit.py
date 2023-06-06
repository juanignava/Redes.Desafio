import unittest
import requests
import json
import socket


class ServerTestCase(unittest.TestCase):

    def test_get_game(self):
        url = "http://localhost:5000/game"
        response = requests.get(url)


        # Parse the response content as JSON
        data = json.loads(response.text)
        # Access the values in the object
        current_player = data['current_player']
        matrix = data['matrix']

        # Compare the string value with the possible values
        self.assertIn(current_player, ('O', 'X', ' '))

        expected_dimension = 3
        # Compare the length of the list with the expected dimension
        self.assertEqual(len(matrix), expected_dimension)
        for row in matrix:
            self.assertEqual(len(row), expected_dimension)

        self.assertEqual(len(data), expected_dimension)
        self.assertEqual(response.status_code, 200)


    def test_get_turnInfo(self):
        url = "http://localhost:5000/turnInfo"
        response = requests.get(url)

        # Parse the response content as JSON
        data = json.loads(response.text)
        # Access the values in the object
        turn = data['turn']

        # Compare the string value with the possible values
        self.assertIn(turn, ('O', 'X'))
        self.assertEqual(response.status_code, 200)

    def test_post_move(self):
        url = "http://localhost:5000/move"
        data = {'row': 0, 'col': 0}

        # Set the Content-Type header to indicate JSON data
        headers = { 'Content-Type': 'application/json'}

        response = requests.post(url, headers=headers, data=json.dumps(data))

        # Parse the response content as JSON
        data = json.loads(response.text)
        message = data["message"]

        self.assertEqual(message, 'Move successful')
        self.assertEqual(response.status_code, 200)
        # Add additional assertions based on the expected response from the server


    def test_post_restart(self):
        url = "http://localhost:5000/restart"

        data = {}

        # Set the Content-Type header to indicate JSON data
        headers = { 'Content-Type': 'application/json'}

        response = requests.post(url, headers=headers, data=json.dumps(data))

        # Parse the response content as JSON
        data = json.loads(response.text)
        message = data["message"]

        self.assertEqual(message, 'Game restarted')
        self.assertEqual(response.status_code, 200)
        # Add additional assertions based on the expected response from the server        

    def test_validate_tcp_ports(self):
        host = "localhost"
        port = 5000
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex((host, port))
        self.assertEqual(result, 0)
        sock.close()


if __name__ == '__main__':
    unittest.main()
