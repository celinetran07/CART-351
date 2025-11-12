from flask import Flask, render_template, request, jsonify, url_for
import json, os, time, random

app = Flask(__name__)
app.secret_key = "dev"

# File paths
DATA_DIR = "data"
EVENTS_FILE = f"{DATA_DIR}/events.json"
AVAIL_FILE = f"{DATA_DIR}/availabilities.json"

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

# Functions to read/write JSON
def read_json(path, default):
    try:
        if os.path.exists(path) and os.path.getsize(path) > 0:
            return json.load(open(path))
    except:
        pass
    write_json(path, default)
    return default

# Function to write JSON
def write_json(path, data):
    json.dump(data, open(path, "w"), indent=2)

# Function to generate new unique ID
def new_id():
    return str(int(time.time())) + str(random.randint(100,999))

# Routes for main home page
@app.route("/")
def home():
    events = read_json(EVENTS_FILE, [])
    return render_template("home.html", events=events)

# Route to create event page
@app.route("/create")
def create():
    return render_template("create_event.html")

# route to handle event creation API
@app.route("/api/create_event", methods=["POST"])
def api_create_event():
    payload = request.get_json()
    events = read_json(EVENTS_FILE, [])

    event = {
    "id": new_id(),
    "name": payload["name"],
    "timezone": "America/Toronto",
    "dates": payload["dates"],
    "start_time": int(payload["start_time"]),
    "end_time": int(payload["end_time"])
    }

    events.append(event)
    write_json(EVENTS_FILE, events)

    return jsonify({"status":"ok","event_id":event["id"]})

# Route to view event availability
@app.route("/event/<event_id>")
def event_view(event_id):
    events = read_json(EVENTS_FILE, [])
    event = next((e for e in events if e["id"] == event_id), None)
    if not event:
        return "Event not found", 404

    avails = read_json(AVAIL_FILE, {}).get(event_id, [])
    return render_template("event_view.html", event=event, responses=avails)

@app.route("/api/event/<event_id>/save", methods=["POST"])
def save_availability(event_id):
    payload = request.get_json()
    name = payload["name"]
    slots = payload["slots"]

    all_data = read_json(AVAIL_FILE, {})
    if event_id not in all_data:
        all_data[event_id] = []

    # Replace existing if same name
    found = False
    for r in all_data[event_id]:
        if r["name"].lower() == name.lower():
            r["slots"] = slots
            found = True
    if not found:
        all_data[event_id].append({"name": name, "slots": slots})

    write_json(AVAIL_FILE, all_data)
    return jsonify({"status":"saved"})

# Route to delete availability entry
@app.route("/api/event/<event_id>/delete", methods=["POST"])
def delete_availability(event_id):
    payload = request.get_json()
    name = payload["name"]

    all_data = read_json(AVAIL_FILE, {})
    if event_id in all_data:
        # Remove all entries matching this name
        all_data[event_id] = [r for r in all_data[event_id] if r["name"].lower() != name.lower()]
        write_json(AVAIL_FILE, all_data)

    return jsonify({"status": "deleted"})


@app.route("/api/event/<event_id>/summary")
def summary(event_id):
    all_data = read_json(AVAIL_FILE, {})
    return jsonify(all_data.get(event_id, []))

if __name__ == "__main__":
    app.run(debug=True)
