from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Simple in-memory leaderboard (use DB in production)
leaderboard = [
    {"name": "Alice", "points": 150},
    {"name": "Bob", "points": 120}
]

# Points per action
action_points = {
    "cycle": 20,
    "recycle": 10,
    "plant": 50,
    "reuse": 5
}

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/log_action", methods=["POST"])
def log_action():
    data = request.get_json()
    name = data.get("name", "Guest")
    action = data.get("action")

    if action not in action_points:
        return jsonify({"error": "Invalid action"}), 400

    points = action_points[action]

    # Check if user exists
    for player in leaderboard:
        if player["name"] == name:
            player["points"] += points
            break
    else:
        leaderboard.append({"name": name, "points": points})

    leaderboard.sort(key=lambda x: x["points"], reverse=True)
    return jsonify({"message": "Action logged", "leaderboard": leaderboard})

@app.route("/leaderboard", methods=["GET"])
def get_leaderboard():
    return jsonify(leaderboard)

if __name__ == "__main__":
    app.run(debug=True)