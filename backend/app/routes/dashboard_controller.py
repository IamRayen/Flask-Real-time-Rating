from flask import Blueprint,jsonify,request
from app.firebase import db

# blueprints allow the app to split routes into different files/modules
# they can be imported in app.py (__init__)
dashboard_bp = Blueprint('dashboard_bp', __name__,url_prefix='/dashboard')


# --- APIs --- #


# API: /dashboard/getAllPendingOrRunningEvents
# Frontend calls this API in order to get
# all pending events (to start them) and running events (to end them)
# from an organizer
@dashboard_bp.route('/getAllPendingOrRunningEvents', methods=['GET'])
def get_all_pending_or_running_events():
    user_id = request.args.get('userID')
    if not user_id:
        return jsonify({'error': 'userID is required'}), 400

    events_ref = db.collection('events').where('organizerID', '==', user_id)
    docs = events_ref.stream()

    result = []

    for doc in docs:
        data = doc.to_dict()
        if data.get('status') in ['pending', 'running']:
            event = data.copy()
            event['eventID'] = doc.id
            result.append(event)

    return jsonify(result), 200


# API: /dashboard/startEvent
# Frontend calls this API in order to start a specific event
@dashboard_bp.route('/startEvent', methods=['POST'])
def startEvent():
    eventID = request.args.get('eventID')
    if not eventID:
        return jsonify({'error': 'eventID is required'}), 400

    event_ref = db.collection('events').document(eventID)
    event_ref.update({'status': 'running'})
    return jsonify({'message': f'Event {eventID} marked as running'}), 200


# API: /dashboard/endEvent
# Frontend calls this API in order to start a specific event
@dashboard_bp.route('/endEvent', methods=['POST'])
def endEvent():
    eventID = request.args.get('eventID')
    if not eventID:
        return jsonify({'error': 'eventID is required'}), 400

    event_ref = db.collection('events').document(eventID)
    event_ref.update({'status': 'ended'})
    return jsonify({'message': f'Event {eventID} marked as ended'}), 200


