from flask import Blueprint,jsonify,request
from app.firebase import db

# blueprints allow the app to split routes into different files/modules
# they can be imported in app.py (__init__)
dashboard_bp = Blueprint('dashboard_bp', __name__,url_prefix='/dashboard')


# --- APIs --- #


# API: /getDashboardData
# Frontend calls this API in order to get all votes of a specific event
@dashboard_bp.route('/getDashboardData', methods=['GET'])
def getDashboardData():
    eventID = request.args.get('eventID')
    if not eventID:
        return jsonify({'error': 'eventID is required'}), 400
    print(eventID)

    # fetch specific event
    event_query = db.collection('events').where('eventID', '==', eventID).limit(1)
    event_docs = event_query.stream()
    event_data = None
    for doc in event_docs:
        event_data = doc.to_dict()
        event_data['id'] = doc.id
        break
    if event_data is None:
        return jsonify({'error': 'Event not found for this eventID'}), 404
    print(event_data)

    # fetch specific questionnaire
    questionnaire_ref = db.collection('questionnaires').where('eventID', '==', eventID).limit(1)
    questionnaire_docs = questionnaire_ref.stream()
    questionnaire_data = None
    for doc in questionnaire_docs:
        questionnaire_data = doc.to_dict()
        break
    if questionnaire_data is None:
        return jsonify({'error': 'Questionnaire not found for this eventID'}), 404
    print(questionnaire_data)

    # fetch all votes for this specific event
    vote_ref = db.collection('votes').where('eventID', '==', eventID)
    votes = vote_ref.stream()
    vote_list = []
    for vote in votes:
        data = vote.to_dict()
        vote_list.append(data)
    print(vote_list)

    return jsonify({
        'event': event_data,
        'questionnaire': questionnaire_data,
        'votes': vote_list,
    }), 200


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


