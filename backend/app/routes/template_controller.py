from flask import Blueprint, jsonify, request, json
from app.firebase import db
import uuid

# blueprints allow the app to split routes into different files/modules
# they can be imported in app.py (__init__)
template_bp = Blueprint('template_bp', __name__,url_prefix='/template')


# --- APIs --- #


# API: /template/getAllTemplates
# Frontend calls this API in order to retrieve all templates from Firestore (TODO - make it organizer-specific)
@template_bp.route('/getAllTemplates', methods=['GET'])
def getAllTemplates():
    user_id = request.args.get('userID')

    if not user_id:
        return jsonify({"error": "Missing userID parameter"}), 400

    try:
        templates_ref = db.collection('templates')
        query = templates_ref.where('userID', '==', user_id)
        results = query.stream()

        templates = []
        for doc in results:
            template_data = doc.to_dict()
            template_data['templateID'] = doc.id
            templates.append(template_data)

        return jsonify({
            "status": "success",
            "templates": templates
        }), 200

    except Exception as e:
        print(f"Error retrieving templates: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# API: /template/save
# Frontend calls this API in order to save the Questionnaire as template for an organizer in Firestore
@template_bp.route('/save', methods=['POST'])
def save_questionnaireAsTemplate():
    data = request.get_json()
    userID = data['userID']
    questionnaire = data['Questionnaire']
    print(data)

    if not userID or not questionnaire:
        return jsonify({"error": "Missing userID or Questionnaire"}), 400

    try:
        doc_ref = db.collection('templates').document()

        questionnaire['questionnaireID'] = doc_ref.id
        questionnaire['userID'] = userID

        # Save to Firestore
        doc_ref.set(questionnaire)

        return jsonify({
            "status": "success",
            "message": "Template saved",
            "questionnaireID": doc_ref.id
        }), 200

    except Exception as e:
        print(f"Error saving questionnaire: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
