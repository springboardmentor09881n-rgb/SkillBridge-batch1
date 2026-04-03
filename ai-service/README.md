# AI Service

This is the AI service component of SkillBridge, providing intelligent matching and chat functionalities.

## Overview

The AI service is built with Flask and uses simple machine learning techniques for skill-based matching between volunteers and opportunities.

## Features

- **Skill Matching**: Matches volunteers with opportunities based on their skills using cosine similarity.
- **Chat Bot**: Provides a simple rule-based chatbot for user assistance.

## API Endpoints

- `POST /chat`: Handles chat messages and returns responses.
- `POST /match`: Matches volunteer skills with available opportunities.

## Tech Stack

- **Flask**: Web framework for Python.
- **scikit-learn**: For cosine similarity calculations.
- **NumPy**: For vector operations.

## Running the Service

1. Install dependencies: `pip install flask scikit-learn numpy`
2. Run the app: `python app.py`

The service will start on port 5000 by default.