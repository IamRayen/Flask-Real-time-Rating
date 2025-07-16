import os
from firebase_admin import credentials, initialize_app, firestore
from dotenv import load_dotenv

load_dotenv()
#cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
cred = credentials.Certificate("/firebase-private-key.json")
initialize_app(cred)
db = firestore.client()
