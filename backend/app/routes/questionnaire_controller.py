from flask import Blueprint, jsonify, request, json
from app.firebase import db
import uuid

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


# blueprints allow the app to split routes into different files/modules
# they can be imported in app.py (__init__)
questionnaire_bp = Blueprint('questionnaire_bp', __name__,url_prefix='/questionnaire')

# /questionnaire/save API.
# Frontend calls this API in order to save the Questionnaire.
@questionnaire_bp.route('/save', methods=['POST'])
def save_questionnaireAsTemplate():

    # read all data from the frontend
    daten = request.get_json()

    # printing the data
    # print("empfangene daten:", daten)
    # print("AllQuestions: ", daten['allQuestions'])

    allQuestions = daten['allQuestions']
    questionnaireID = daten['questionnaireID']
    eventID = daten['eventID']

    # fills the Question-classes & Criteria-classes properly (data model)
    criteria_lookup = {}
    criteria_list = []
    questions = []
    for question in daten['allQuestions']:
        category = question.get('category')

        # add new criteria if its not already in the list
        if category not in criteria_lookup:
            new_criteria_id = str(uuid.uuid4())
            criteria_lookup[category] = new_criteria_id

            # add criteria to list
            criteria = Criteria(
                criteria_id = new_criteria_id,
                title = category,
                question_list = [],  # wird später gefüllt
                questionnaire_id = questionnaireID
            )
            criteria_list.append(criteria)

        # add question to list
        question = Question(
            question_id = str(uuid.uuid4()),
            title = question.get('text'),
            option_list = question.get('options'),
            criteria_id = criteria_lookup[category]
        )
        questions.append(question)

        # fill the question_list from the criteria
        for criteria in criteria_list:
            if criteria.criteria_id == question.criteria_id:
                criteria.question_list.append(question)
                break

    # create the questionnaire-object for saving to Firestore
    questionnaire = Questionnaire(
        questionnaireID = questionnaireID,
        criteria_list = criteria_list,
        visualization_type = None,
        is_template = False,
        event_id = eventID
    )

    # print questionnaire with their respective criteria and questions
    print(questionnaire)
    for criteria in questionnaire.criteria_list:
        print(f"  Criteria: {criteria.title} ({criteria.criteria_id})")
        for question in criteria.question_list:
            print(f"    ↳ Question: {question.title} ({question.question_id})")


    # till here, the questionnaire class, criteria classes and question classes are properly filled.
    # now, all this data have to be stored properly in Firestore as documents.

    # defining the collection (Questions are stored inside Criteria and Criteria are stored inside Questionnaire)
    questionnaires_ref = db.collection("questionnaires")
    questionnaire_doc = questionnaires_ref.document(questionnaireID)

    # save questionnaire document
    questionnaire_doc.set({
        "questionnaireID": questionnaire.questionnaireID,
        "visualization_type": questionnaire.visualization_type,
        "is_template": questionnaire.is_template,
        "event_id": questionnaire.event_id
    })

    # for each criteria add a subcollection
    for criteria in questionnaire.criteria_list:
        criteria_ref = questionnaire_doc.collection("criteria").document(criteria.criteria_id)

        # save criteria document
        criteria_ref.set({
            "criteria_id": criteria.criteria_id,
            "title": criteria.title,
            "questionnaire_id": criteria.questionnaire_id
        })

        # for each question in the criteria add a sub-subcollection
        for question in criteria.question_list:
            question_ref = criteria_ref.collection("questions").document(question.question_id)

            # save question document
            question_ref.set({
                "question_id": question.question_id,
                "title": question.title,
                "option_list": question.option_list,
                "criteria_id": question.criteria_id
            })

    print("Data is successfully stored in Firestore!")


    # send something back to the frontend
    return jsonify({"status": "ok", "empfangen": daten})


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
