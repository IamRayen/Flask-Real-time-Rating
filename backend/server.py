from flask import Flask, request, jsonify
import os

from firebase_admin import credentials, initialize_app, firestore

from dotenv import load_dotenv
load_dotenv()  #Loads .env file
cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH") 


#From firebase_admin
cred = credentials.Certificate(cred_path)
initialize_app(cred)
db=firestore.client()

app = Flask("Python-Server")

# API to add an event
@app.route('/events/add', methods=['POST'])
def add_event():
    try:
        event_data = request.json
        # Validate required fields (basic)
        required_fields = ['eventID', 'questionnaireID', 'organizerID', 'itemList', 'refereeList', 'status']
        if not all(field in event_data for field in required_fields):
            return jsonify({"error": "Missing one or more required fields"}), 400
        
        # Store event document with eventID as document ID
        event_id = event_data['eventID']
        db.collection('events').document(event_id).set(event_data)
        
        return jsonify({"message": "Event added successfully", "eventID": event_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run the server
if __name__ == "__main__":
    app.run(port=3000)