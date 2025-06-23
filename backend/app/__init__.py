from flask import Flask

def create_app():
    app = Flask(__name__)
    
    from app.routes.event_controller import event_bp
    app.register_blueprint(event_bp)

    return app