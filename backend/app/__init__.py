from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)

    CORS(app)
    
    # handles events
    from app.routes.event_controller import event_bp
    app.register_blueprint(event_bp)

    # handles questionnaires
    from app.routes.questionnaire_controller import questionnaire_bp
    app.register_blueprint(questionnaire_bp)

    return app