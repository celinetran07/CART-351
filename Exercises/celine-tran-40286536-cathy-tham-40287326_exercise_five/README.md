## Explanation of MongoDB Query and Visualizations

### Query 3 — /three
Retrieve all entries where the participant ended the event feeling positive.

```@app.route("/three")
def three():
    results = mongo.db.dataStuff.find({
        "after_mood": {"$in": positive_moods}
    })
    return {"results": results, "positive_moods": positive_moods}
```
#### `"after_mood": {"$in": positive_moods}`
- Keeps only entries where after_mood is one of the moods listed in positive_moods. (Uses array defined earlier in the code as all positive moods.)
#### `return {"results": results, "positive_moods": positive_moods}`
- Sends the filtered results and the helper array back to the client.

### Visualization 3
![Query 3 Screenshot](/Exercises/celine-tran-40286536-cathy-tham-40287326_exercise_five/static/screenshots/three.png)

Concept:
Positive moods are represented as bright, scattered “confetti” across the screen, symbolizing lightness and uplifting emotions.

Design Choices:
- Color = event_name
- Different events produce different colors of confetti.
- Size = after_mood_strength
Stronger positive moods create larger, more visible bubbles.
- Animated drifting movement
- Each bubble moves gently to reinforce an airy, uplifting feeling.

### Query 4 — /four
Retrieve all entries, but sorted alphabetically by event_name.

```@app.route("/four")
def four():
    results = mongo.db.dataStuff.find().sort("event_name", 1)
    return {"results": results, "events": event_names}
```
#### `.sort("event_name", 1)`
- Sorts all entries alphabetically by event_name (A to Z).
#### `return {...}`
- Sends the sorted results and the helper array of all event names to the client.

### Visualization 4
![Query 4 Screenshot](/Exercises/celine-tran-40286536-cathy-tham-40287326_exercise_five/static/screenshots/four.png)

Concept:
Each event category forms a clean horizontal row. This makes it easy to compare the density of entries within each event type.

Design Choices:
- Each row = one event_name
- Color = event_name
- Implemented subtle fade-in animation

The result is an organized “striped” layout where each line clearly represents a specific activity.

### Query 5 — /five
Analyze entries that occurred specifically on Monday or Tuesday, ordered by event impact.

```@app.route("/five")
def five():
    results = mongo.db.dataStuff.find({
        "day": {"$in": ["Monday", "Tuesday"]}
    }).sort("event_affect_strength", 1)

    return {"results": results, "days": ["Monday", "Tuesday"]}
```
#### `"day": {"$in": ["Monday", "Tuesday"]}`
- Filters the dataset so only entries that happened on Monday or Tuesday are returned.

#### `.sort("event_affect_strength", 1)`
- Orders those entries by how strongly the event affected the participant.

#### `return {...}`
- Sends the filtered + sorted set and the day labels to the client. 

### Visualization 5
![Query 5 Screenshot](/Exercises/celine-tran-40286536-cathy-tham-40287326_exercise_five/static/screenshots/five.png)

Two spirals represent Monday and Tuesday. This structure visually contrasts the event effects between the two days ordered by event affect trength.

Design Choices:
- Left spiral = Monday, Right spiral = Tuesday
- Size = event_affect_strength
- Stronger events appear as larger circles.
- Spirals expand outward to show “build-up” of event impact
- Pulse animation for more visual impact (Points subtly expand and contract to emphasize intensity)

Make comparison between the two days very clear.

### Query 6 — /six
Select cases where the participant felt negative before and after the event, organized by weather.

```@app.route("/six")
def six():
    query = {
        "start_mood": {"$in": negative_moods},
        "after_mood": {"$in": negative_moods}
    }
    results = mongo.db.dataStuff.find(query).sort("weather", 1)

    return {"results": results, "negative_moods": negative_moods}
```
#### `"start_mood": {"$in": negative_moods}`
- Keeps only entries where the starting mood is negative.

#### `"after_mood": {"$in": negative_moods}`
- Also checks that the after-mood is negative.

#### `find(query)`
- Only entries matching both conditions are included.

#### `.sort("weather", 1)`
- Sorts all results alphabetically by weather type.

#### `return {...}`
- Sends the results and the list of negative moods to the client.

### Visualization 6
![Query 6 Screenshot](/Exercises/celine-tran-40286536-cathy-tham-40287326_exercise_five/static/screenshots/six.png)

Negative moods are represented as layers buried within soil, reflecting the idea of emotional “lowness.” Since soil is the lowest physical place we can touch, it becomes a natural metaphor for negative emotional states. Each weather type becomes its own soil stratum, creating clear and meaningful groupings.

Design Choices:
- One horizontal band per weather type
- Each color represents each layer of soil layer
- Random horizontal scattering to mimic natural layering
- Hover growth animation for fun
- brown background as if buried underground

