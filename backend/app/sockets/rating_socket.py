from flask_socketio import emit

def register_rating_handlers(socketio):
    @socketio.on("submit_rating")
    def handle_submit_rating(data):
        print("Received rating:", data)
        # Optional: Save to Firestore here
        emit("new_rating", data, broadcast=True)
