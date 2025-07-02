from flask import Blueprint,jsonify,request
from app.firebase import db
import uuid

event_bp = Blueprint('event_bp', __name__,url_prefix='/event')


# --- APIs --- #


# API: /event/save
# Frontend calls this API on order to save the given event-data into Firestore
@event_bp.route('/save', methods=['POST'])
def save_event():
    data = request.get_json()

    print("EVENT: ", data.get('event'))
    print("QUESTIONNAIRE: ", data.get('questionnaire'))

    event_data = data.get('event')
    questionnaire_data = data.get('questionnaire')

    if not event_data or not questionnaire_data:
        return jsonify({"status": "error", "message": "Missing event or questionnaire data"}), 400

    event_id = event_data.get('eventID')
    if not event_id:
        event_id = str(uuid.uuid4())
        event_data['eventID'] = event_id

    db.collection('events').document(event_id).set(event_data)

    questionnaire_id = questionnaire_data.get('questionnaireID')
    if not questionnaire_id:
        return jsonify({"status": "error", "message": "Missing questionnaireID"}), 400

    db.collection('questionnaires').document(questionnaire_id).set(questionnaire_data)

    return jsonify({
        "status": "success",
        "message": "Event and questionnaire saved successfully",
        "eventID": event_id,
        "questionnaireID": questionnaire_id
    }), 200


# API: /event/addRefereeToList
# Frontend calls this API in order to check if the provided
# referee is a real referee in Firestore
@event_bp.route('/addRefereeToList', methods=['GET'])
def addRefereeToList():
    email = request.args.get('email')

    if not email:
        return jsonify({"error": "Missing email parameter"}), 400

    try:
        users_ref = db.collection('users')
        query = users_ref.where('email', '==', email).limit(1).stream()

        user_doc = next(query, None)

        if not user_doc:
            return jsonify({"status": "not_found", "message": "User not found"}), 404

        user_data = user_doc.to_dict()

        if user_data.get('role') != 'referee':
            return jsonify({"status": "invalid_role", "message": "User is not a referee"}), 403

        return jsonify({
            "status": "success",
            "referee": {
                "userID": user_doc.id,
                "email": user_data['email'],
                "name": user_data.get('name', ''),
            }
        }), 200

    except Exception as e:
        print(f"Error validating referee: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@event_bp.route('/add', methods=['POST'])
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

@event_bp.route('/get/<string:event_id>', methods=['GET'])
def get_event(event_id):
    try:
        doc = db.collection('events').document(event_id).get()
        if doc.exists:
            return jsonify(doc.to_dict()), 200
        else:
            return jsonify({"error": "Event not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
        
@event_bp.route('/update/<string:event_id>', methods=['PATCH'])
def update_event(event_id):
    try:
        updates = request.json  # Dict of fields to update/delete
        
        doc_ref = db.collection('events').document(event_id)
        doc = doc_ref.get()

        if not doc.exists:
            return jsonify({"error": "Event not found"}), 404

        # Handle field deletion if value is null or "_delete"
        fields_to_delete = [k for k, v in updates.items() if v in [None, "_delete"]]
        for field in fields_to_delete:
            doc_ref.update({field: firestore.DELETE_FIELD})
        
        # Filter out deleted fields before updating
        updates = {k: v for k, v in updates.items() if v not in [None, "_delete"]}
        if updates:
            doc_ref.update(updates)

        return jsonify({"message": "Event updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@event_bp.route('/QRCodeSaveUrl', methods=['POST'])
def save_qr_code_url():
    
    data = request.get_json()
    event_id = data.get('eventID')
    posters = data.get('posters', [])

    if not event_id or not posters:
        return jsonify({"status": "error", "message": "eventID and posters are required."}), 400

    try:
        
        event_ref = db.collection('events').document(event_id)
        for poster in posters:
            poster_id = str(uuid.uuid4())
            poster_data = {
                "name": poster.get("name", ""),
                "qrCodeUrl": poster.get("qrCodeUrl", "")
            }
            event_ref.collection('posters').document(poster_id).set(poster_data)
        return jsonify({"status": "ok", "message": "Posters saved successfully"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
