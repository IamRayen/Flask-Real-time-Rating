from flask import Flask, request, jsonify
from app import create_app

app = create_app()

# Run the server
if __name__ == "__main__":
    app.run(port=3000)