#used to read environment varariables
import os
#used to pick random options for the wheel
import random
#used for timestamps of spins and createAt field
from datetime import datetime
from zoneinfo import ZoneInfo
#flask:creates the wsgi app, render_template:renders html templates, request:reads request daa used in api post enpoints to get json payload
from flask import Flask, render_template, request
#helper to connect flask with MongoDB
from flask_pymongo import PyMongo
#loads environment variables from a .env file into the application's environment
from dotenv import load_dotenv

#Load login information for MongoDB from .env file
load_dotenv()
db_user = os.getenv("MONGODB_USER")
db_pass = os.getenv("DATABASE_PASSWORD")
db_name = os.getenv("DATABASE_NAME")

#create Flask application
app = Flask(__name__)

#Connect to MongoDB Atlas using the information above
uri = f"mongodb+srv://{db_user}:{db_pass}@cluster0.gkbiu7l.mongodb.net/{db_name}?retryWrites=true&w=majority"
app.config["MONGO_URI"] = uri
mongo = PyMongo(app)

#simple print to confirm connection
print("Connected to MongoDB!")

#GLOBAL WHEEL SETTINGS
#constant id for the global wheel
# Every person modifies the same wheel.
GLOBAL_WHEEL_ID = "GLOBAL_WHEEL"

# Default starting options when database is empty
DEFAULT_OPTIONS = ["Ramen", "Takoyaki", "Apple", "Sushi"]


#Create global wheel in database if it doesn't exist
def ensureWheel():
    wheel = mongo.db.spinTheWheel.find_one({"_id": GLOBAL_WHEEL_ID})

    if not wheel:
        mongo.db.spinTheWheel.insert_one({
            "_id": GLOBAL_WHEEL_ID,
            "title": "Global Wheel",
            "options": DEFAULT_OPTIONS,
            "leaderboard": {opt: 0 for opt in DEFAULT_OPTIONS},
            "history": [],    # list of past spins
            "createdAt": datetime.now(ZoneInfo("America/Toronto")).isoformat()

        })

#Ensure global wheel exists on startup
ensureWheel()

#Route for home page
@app.route("/")
def home():
    return render_template("home.html")

#Route for the wheel game page
@app.route("/wheel/<wheel_id>")
def wheelPage(wheel_id):
    wheel = mongo.db.spinTheWheel.find_one({"_id": wheel_id})

    if not wheel:
        return "Wheel not found", 404

    return render_template(
        "wheel_game.html",
        decision_id=wheel_id,
        game={"userName": wheel.get("title", "Shared Wheel")}
    )


#API ROUTES FOR WHEEL OPERATIONS
#Get wheel's title and list of options
@app.route("/api/wheel/<wheel_id>")
def api_wheel(wheel_id):
    wheel = mongo.db.spinTheWheel.find_one({"_id": wheel_id})

    if not wheel:
        return {"error": "Wheel not found"}, 404

    return {
        "title": wheel["title"],
        "options": wheel["options"]
    }

# Update the wheel's title
@app.route("/api/wheel/<wheel_id>/title", methods=["POST"])
def api_update_title(wheel_id):
    data = request.get_json()
    new_title = data.get("title", "").strip()

    if new_title == "":
        return {"error": "Title cannot be empty"}, 400

    mongo.db.spinTheWheel.update_one(
        {"_id": wheel_id},
        {"$set": {"title": new_title}}
    )

    return {"status": "ok", "new_title": new_title}

# Add a new option to the wheel and add new entry in leaderboard
@app.route("/api/wheel/<wheel_id>/add", methods=["POST"])
def api_add_option(wheel_id):
    data = request.get_json()
    option = data.get("option", "").strip()

    if option == "":
        return {"error": "Empty option"}, 400

    # Add to options and initialize leaderboard count to 0
    mongo.db.spinTheWheel.update_one(
        {"_id": wheel_id},
        {
            # add if not already there
            "$addToSet": {"options": option}, 
            # new leaderboard entry
            "$set": {f"leaderboard.{option}": 0}    
        }
    )

    return {"status": "ok"}


# Delete an option and remove it from leaderboard and history section
@app.route("/api/wheel/<wheel_id>/delete", methods=["POST"])
def api_delete_option(wheel_id):
    data = request.get_json()
    option = data.get("option", "").strip()

    if option == "":
        return {"error": "Missing option"}, 400

    mongo.db.spinTheWheel.update_one(
        {"_id": wheel_id},
        {
            # remove option and remove history entries
            "$pull": {"options": option, "history": {"result": option}},
            # remove from leaderboard dictionary, key-value pair
            "$unset": {f"leaderboard.{option}": ""}
        }
    )

    return {"status": "ok"}


# Spin the wheel (random choice) and save into history
@app.route("/api/wheel/<wheel_id>/spin", methods=["POST"])
def api_spin(wheel_id):
    wheel = mongo.db.spinTheWheel.find_one({"_id": wheel_id})

    if not wheel:
        return {"error": "Wheel not found"}, 404

    options = wheel["options"]

    #checjs if options is empty
    if len(options) == 0:
        return {"error": "No options available"}, 400

    # Pick a random winner
    winner = random.choice(options)

    # Save the spin result
    mongo.db.spinTheWheel.update_one(
        {"_id": wheel_id},
        {
            "$push": {
                "history": {
                    "result": winner,
                    "timestamp": datetime.now(ZoneInfo("America/Toronto")).isoformat()

                }
            },
            "$inc": {f"leaderboard.{winner}": 1}
        }
    )

    return {"result": winner}


# Return spin history, newest to oldest
@app.route("/api/wheel/<wheel_id>/history")
def api_history(wheel_id):
    wheel = mongo.db.spinTheWheel.find_one({"_id": wheel_id})

    if not wheel:
        return {"history": []}

    history = wheel.get("history", [])

    # Sort by timestamp (newest → oldest)
    history.sort(key=lambda h: h["timestamp"], reverse=True)

    # Convert datetime into readable strings
    #do this because json can't contain python datetime objects
    cleaned = []
    for h in history:
        cleaned.append({
            "result": h["result"],
            "timestamp": h["timestamp"]
        })

    # Only return last 30 spins
    return {"history": cleaned[:30]}


# Leaderboard sorted by most wins to least wins
@app.route("/api/wheel/<wheel_id>/leaderboard")
def api_leaderboard(wheel_id):
    wheel = mongo.db.spinTheWheel.find_one({"_id": wheel_id})

    if not wheel:
        return {"leaderboard": []}

    board = wheel.get("leaderboard", {})

    # sort by wins
    #converts the dictionary into a list of dictionaries with option and wins keys
    #then sorts that list based on the wins in descending order
    sorted_board = sorted(
        [{"option": k, "wins": v} for k, v in board.items()],
        key=lambda x: x["wins"],
        reverse=True
    )

    return {"leaderboard": sorted_board}

# Start Flask server
app.run(debug=True)

