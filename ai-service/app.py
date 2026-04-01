from flask import Flask, request, jsonify
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

app = Flask(__name__)

# Example data
skills_list = ["python", "react", "ml"]

def vectorize(skills):
    return [1 if skill in skills else 0 for skill in skills_list]

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    print("Received chat request:", data)
    message = data.get("message").lower()

    # Simple rule-based AI
    if any(greet in message for greet in ["hi", "hii", "hello", "hey", "good morning", "good afternoon", "good evening"]):
        response = "Hi! I can help with skill matches, applications, and your profile. Try: 'recommend opportunities for me'."

    elif "match" in message or "recommend" in message:
        response = "Based on your skills, here are top matches:\n1. Web Developer - 90%\n2. Data Analyst - 80%"
    
    elif "apply" in message:
        response = "To apply: Open an opportunity and click the Apply button."

    elif "profile" in message:
        response = "You can update your profile from the dashboard."

    else:
        response = "Sorry, I didn’t understand. Try asking about matches or applications."

    print("Sending response:", response)
    return jsonify({"reply": response})

@app.route('/match', methods=['POST'])
def match():
    volunteer_skills = request.json["skills"]
    
    opportunities = [
        {"title": "Web Dev", "skills": ["react"]},
        {"title": "ML Intern", "skills": ["python", "ml"]}
    ]

    v1 = np.array(vectorize(volunteer_skills)).reshape(1, -1)

    results = []

    for opp in opportunities:
        v2 = np.array(vectorize(opp["skills"])).reshape(1, -1)
        score = cosine_similarity(v1, v2)[0][0]

        results.append({
            "title": opp["title"],
            "score": round(score * 100, 2)
        })

    return jsonify(results)

if __name__ == '__main__':
    app.run(port=5001)