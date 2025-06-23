from flask import Blueprint,jsonify,request
from app.firebase import db

event_bp = Blueprint('event_bp', __name__,url_prefix='/event')

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
