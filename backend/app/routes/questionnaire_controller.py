from flask import Blueprint, jsonify, request, json
from app.firebase import db

# blueprints allow the app to split routes into different files/modules
# they can be imported in app.py (__init__)
questionnaire_bp = Blueprint('questionnaire_bp', __name__,url_prefix='/questionnaire')

# adds a questionnaire to Firestore from Mockdata based on a specific event
@questionnaire_bp.route('/addFromMockData', methods=['POST', 'GET'])
def add_questionnaire():

    # reads the whole mockData.json-file
    with open('mockData.json', 'r') as file:
        data = json.load(file)

    # i choosed the first event here, but it can be any event that is given
    first_event = data['events'][0]

    # get the questionnaire of the specific event (1:1 relation)
    questionnaire_id = first_event['questionnaireID']
    allQuestionnaires = data['questionnaires']
    specific_questionnaire = next((q for q in allQuestionnaires if q['questionnaireID'] == questionnaire_id), None)

    # get all criteria from questionnaire
    if specific_questionnaire:
        criteria_ids = specific_questionnaire['criteriaList']
        allCriteria = data['criteria']
        allCriteriaFromQuestionnaire = [c for c in allCriteria if c['criteriaID'] in criteria_ids]

        # get all questions from criteria
        if allCriteriaFromQuestionnaire:
            allQuestion_ids = []
            for criteria in allCriteriaFromQuestionnaire:
                allQuestion_ids.extend(criteria['questionList'])
            if allQuestion_ids:
                allQuestions = data['questions']
                allQuestionsFromCriterias = [q for q in allQuestions if q['questionID'] in allQuestion_ids]

    # till here, based upon a specific event, we loaded the questionnaire,
    # the criteria of that specific questionnaire and all questions from that specific questionnaire.
    # now, we have to store this information in Firestore



    # returns the data as a http-response
    return jsonify(allQuestionsFromCriterias)