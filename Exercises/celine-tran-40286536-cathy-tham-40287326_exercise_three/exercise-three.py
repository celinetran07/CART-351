from flask import Flask,render_template,request
import os
app = Flask(__name__)
UPLOAD_FOLDER = 'static/uploads' # Or os.path.join(app.instance_path, 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024 # 16 MB limit

# the default route
@app.route("/")
def index():
      return render_template("index.html")

#*************************************************
#Task: CAPTURE & POST & FETCH & SAVE
@app.route("/t2")
def t2():
    return render_template("t2.html")

@app.route("/postDataFetch",methods = ['POST'])
def postDataFetch():
    #get JSON data from client via Fetch POST
    data = request.get_json()
    user_input = data.get("user_input", "")

    #Save the data from the user to an existing TEXT file on the server: specifically: files/data.txt.
    with open("files/data.txt","a") as f:
        f.write(user_input + "\n")

    #Send some JSON formatted message back to the user once the data has been written to the file.
    return {"message": f"Data saved successfully: '{user_input}'"}

#*************************************************
#run
app.run(debug=True)