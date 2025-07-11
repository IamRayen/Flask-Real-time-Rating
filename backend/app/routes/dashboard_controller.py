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
    
    print(f"Fetching dashboard data for eventID: {eventID}")

    try:
        # Try to fetch event by document ID first (most common case)
        event_ref = db.collection('events').document(eventID)
        event_doc = event_ref.get()
        event_data = None
        
        if event_doc.exists:
            event_data = event_doc.to_dict()
            event_data['id'] = event_doc.id
            print("Found event by document ID")
        else:
            # If not found by document ID, try querying by eventID field
            event_query = db.collection('events').where('eventID', '==', eventID).limit(1)
            event_docs = event_query.stream()
            for doc in event_docs:
                event_data = doc.to_dict()
                event_data['id'] = doc.id
                print("Found event by eventID field")
                break
        
        if event_data is None:
            print(f"Event not found for eventID: {eventID}")
            return jsonify({'error': 'Event not found for this eventID'}), 404
        
        print(f"Event data: {event_data}")

        # Normalize event data structure (handle different naming conventions)
        if 'itemList' not in event_data and 'posterList' in event_data:
            event_data['itemList'] = event_data['posterList']
        elif 'itemList' not in event_data:
            event_data['itemList'] = []

        # fetch specific questionnaire
        questionnaire_id = event_data.get('questionnaireID')
        if not questionnaire_id:
            print("No questionnaireID found in event data")
            return jsonify({'error': 'No questionnaire associated with this event'}), 400

        # Try to fetch questionnaire by document ID first
        questionnaire_ref = db.collection('questionnaires').document(questionnaire_id)
        questionnaire_doc = questionnaire_ref.get()
        questionnaire_data = None

        if questionnaire_doc.exists:
            questionnaire_data = questionnaire_doc.to_dict()
            print("Found questionnaire by document ID")
        else:
            # If not found by document ID, try querying by eventID
            questionnaire_query = db.collection('questionnaires').where('eventID', '==', eventID).limit(1)
            questionnaire_docs = questionnaire_query.stream()
            for doc in questionnaire_docs:
                questionnaire_data = doc.to_dict()
                print("Found questionnaire by eventID field")
                break

        if questionnaire_data is None:
            print(f"Questionnaire not found for questionnaireID: {questionnaire_id}")
            return jsonify({'error': 'Questionnaire not found for this event'}), 404

        print(f"Questionnaire data: {questionnaire_data}")

        # Ensure questionnaire has the required structure
        if 'criteriaList' not in questionnaire_data:
            questionnaire_data['criteriaList'] = []

        # fetch all votes for this specific event
        vote_ref = db.collection('votes').where('eventID', '==', eventID)
        votes = vote_ref.stream()
        vote_list = []
        for vote in votes:
            vote_data = vote.to_dict()
            
            # Ensure vote has required fields
            if 'ticketOptionsList' not in vote_data:
                vote_data['ticketOptionsList'] = []
            if 'role' not in vote_data:
                vote_data['role'] = 'anonymous'
            
            vote_list.append(vote_data)

        print(f"Found {len(vote_list)} votes")

        response_data = {
            'event': event_data,
            'questionnaire': questionnaire_data,
            'votes': vote_list,
        }

        return jsonify(response_data), 200

    except Exception as e:
        print(f"Error fetching dashboard data: {str(e)}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500


# API: /dashboard/getAllPendingOrRunningEvents
# Frontend calls this API in order to get
# all pending events (to start them) and running events (to end them)
# from an organizer
@dashboard_bp.route('/getAllPendingOrRunningEvents', methods=['GET'])
def get_all_pending_or_running_events():
    user_id = request.args.get('userID')
    if not user_id:
        return jsonify({'error': 'userID is required'}), 400

    try:
        events_ref = db.collection('events').where('organizerID', '==', user_id)
        docs = events_ref.stream()

        result = []

        for doc in docs:
            data = doc.to_dict()
            if data.get('status') in ['pending', 'running']:
                event = data.copy()
                # Ensure eventID is set (use document ID if not present)
                if 'eventID' not in event:
                    event['eventID'] = doc.id
                result.append(event)

        return jsonify(result), 200

    except Exception as e:
        print(f"Error fetching pending/running events: {str(e)}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500


# API: /dashboard/startEvent
# Frontend calls this API in order to start a specific event
@dashboard_bp.route('/startEvent', methods=['POST'])
def startEvent():
    eventID = request.args.get('eventID')
    if not eventID:
        return jsonify({'error': 'eventID is required'}), 400

    try:
        # Try to update by document ID first
        event_ref = db.collection('events').document(eventID)
        event_doc = event_ref.get()
        
        if event_doc.exists:
            event_ref.update({'status': 'running'})
            print(f"Event {eventID} status updated to running (by document ID)")
        else:
            # Try to find by eventID field and update
            events_query = db.collection('events').where('eventID', '==', eventID)
            events = events_query.stream()
            updated = False
            
            for event_doc in events:
                event_doc.reference.update({'status': 'running'})
                updated = True
                print(f"Event {eventID} status updated to running (by eventID field)")
                break
            
            if not updated:
                return jsonify({'error': f'Event {eventID} not found'}), 404

        return jsonify({'message': f'Event {eventID} marked as running'}), 200

    except Exception as e:
        print(f"Error starting event: {str(e)}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500


# API: /dashboard/endEvent
# Frontend calls this API in order to end a specific event
@dashboard_bp.route('/endEvent', methods=['POST'])
def endEvent():
    eventID = request.args.get('eventID')
    if not eventID:
        return jsonify({'error': 'eventID is required'}), 400

    try:
        # Try to update by document ID first
        event_ref = db.collection('events').document(eventID)
        event_doc = event_ref.get()
        
        if event_doc.exists:
            event_ref.update({'status': 'ended'})
            print(f"Event {eventID} status updated to ended (by document ID)")
        else:
            # Try to find by eventID field and update
            events_query = db.collection('events').where('eventID', '==', eventID)
            events = events_query.stream()
            updated = False
            
            for event_doc in events:
                event_doc.reference.update({'status': 'ended'})
                updated = True
                print(f"Event {eventID} status updated to ended (by eventID field)")
                break
            
            if not updated:
                return jsonify({'error': f'Event {eventID} not found'}), 404

        return jsonify({'message': f'Event {eventID} marked as ended'}), 200

    except Exception as e:
        print(f"Error ending event: {str(e)}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500


