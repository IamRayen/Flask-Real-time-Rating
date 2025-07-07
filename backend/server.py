from flask import Flask, request, jsonify
from app import create_app
from extensions import socketio


app = create_app()

# Run the server
if __name__ == "__main__":
    socketio.run(app, port=3000)
