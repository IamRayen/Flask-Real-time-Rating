from flask import Flask
import os

import firebase_admin 
from firebase_admin import credentials, initialize_app, firestore

from dotenv import load_dotenv
load_dotenv()  #Loads .env file
cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH") 


#From firebase_admin
cred = credentials.Certificate(cred_path)
initialize_app(cred)
db=firestore.client()

app = Flask("Python-Server")

# End-points:
@app.route('/hello',methods=['GET']) 
def function_hello():
    db.collection('persons').add({"name":"John", "age": 40})
    return "Hello World"

@app.route('/bye',methods=['GET'])
def function_bye():
    return "Bye Bye"

# Run the server
app.run(port=3000)