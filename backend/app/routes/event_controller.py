from flask import Blueprint,jsonify,request
from app.firebase import db
import uuid

event_bp = Blueprint('event_bp', __name__,url_prefix='/event')


# --- Classes --- #


# questionnaire class (data model)
class Questionnaire:
    def __init__(self, questionnaireID=None, criteria_list=None, visualization_type=None, is_template=None, event_id=None):
        self.questionnaireID = questionnaireID
        self.criteria_list = criteria_list if criteria_list is not None else []
        self.visualization_type = visualization_type
        self.is_template = is_template
        self.event_id = event_id
    def __repr__(self):
        return (
            f"<Questionnaire id={self.questionnaireID}, "
            f"visualization={self.visualization_type}, template={self.is_template}>"
        )

# criteria class (data model)
class Criteria:
    def __init__(self, criteria_id=None, question_list=None, title=None, questionnaire_id=None):
        self.criteria_id = criteria_id
        self.question_list = question_list if question_list is not None else []
        self.title = title
        self.questionnaire_id = questionnaire_id
    def __repr__(self):
        return f"<Criteria id={self.criteria_id}, title={self.title}, questions={len(self.question_list)}>"

# question class (data model)
class Question:
    def __init__(self, question_id=None, title=None, option_list=None, criteria_id=None):
        self.question_id = question_id
        self.title = title
        self.option_list = option_list if option_list is not None else []
        self.criteria_id = criteria_id
    def __repr__(self):
        return f"<Question id={self.question_id}, title={self.title}>"



# --- APIs --- #


# API: /event/save
# Frontend calls this API in order to store the event in Firestore
@event_bp.route('/save', methods=['POST'])
def save_event():
    data = request.get_json()

    userID = data['userID']
    allQuestions = data['allQuestions']
    questionnaireID = data['questionnaireID']
    eventID = data['eventID']
    item_list = data.get("item_list", [])
    referee_list = data.get("referee_list", [])
    status = data.get("status")

    criteria_lookup = {}
    criteria_list = []
    questions = []


    for question in allQuestions:
        category = question.get('category')

        if category not in criteria_lookup:
            new_criteria_id = str(uuid.uuid4())
            criteria_lookup[category] = new_criteria_id

            criteria = Criteria(
                criteria_id = new_criteria_id,
                title = category,
                question_list = [],
                questionnaire_id = questionnaireID
            )
            criteria_list.append(criteria)

        question_obj = Question(
            question_id = str(uuid.uuid4()),
            title = question.get('text'),
            option_list = question.get('options'),
            criteria_id = criteria_lookup[category]
        )
        questions.append(question_obj)

        for criteria in criteria_list:
            if criteria.criteria_id == question_obj.criteria_id:
                criteria.question_list.append(question_obj)
                break

    # Create questionnaire object (event version)
    questionnaire = Questionnaire(
        questionnaireID = questionnaireID,
        criteria_list = criteria_list,
        visualization_type = None,
        is_template = False,
        event_id = eventID
    )

    # Store event metadata
    organizer_ref = db.collection("users").document(userID)
    event_ref = organizer_ref.collection("events").document(eventID)
    event_ref.set({
        "eventID": eventID,
        "questionnaireID": questionnaireID,
        "item_list": item_list,
        "referee_list": referee_list,
        "status": status
    })

    # Store questionnaire under event
    questionnaire_doc = event_ref.collection("questionnaire").document(questionnaireID)
    questionnaire_doc.set({
        "questionnaireID": questionnaireID,
        "visualization_type": questionnaire.visualization_type,
        "is_template": False,
        "event_id": eventID
    })

    for criteria in questionnaire.criteria_list:
        criteria_ref = questionnaire_doc.collection("criteria").document(criteria.criteria_id)
        criteria_ref.set({
            "criteria_id": criteria.criteria_id,
            "title": criteria.title,
            "questionnaire_id": criteria.questionnaire_id
        })

        for question in criteria.question_list:
            question_ref = criteria_ref.collection("questions").document(question.question_id)
            question_ref.set({
                "question_id": question.question_id,
                "title": question.title,
                "option_list": question.option_list,
                "criteria_id": question.criteria_id
            })

    return jsonify({"status": "ok", "message": "Event saved successfully"})

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
