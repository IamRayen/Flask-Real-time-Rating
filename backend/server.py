from flask import Flask

app = Flask("Python-Server")

# End-points:
@app.route('/hello',methods=['GET']) 
def function_hello():
    return "Hello World"

@app.route('/bye',methods=['GET'])
def function_bye():
    return "Bye Bye"

# Run the server
app.run(port=3000)