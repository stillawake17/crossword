import csv
from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

def load_crossword_from_csv(file_path):
    grid = []
    answers = {}  # Dictionary to dynamically load answers
    
    with open(file_path, newline='') as csvfile:
        reader = csv.reader(csvfile)
        for rowIndex, row in enumerate(reader):
            gridRow = [None if cell == '.' else cell for cell in row]
            grid.append(gridRow)
            # Example logic to extract horizontal words (simplified)
            rowStr = ''.join([cell if cell != '.' else ' ' for cell in row])
            for word in rowStr.strip().split():
                if len(word) > 1:  # Assuming only words longer than 1 letter are "answers"
                    answerKey = f"cell-{rowIndex}-{rowStr.index(word)}"
                    answers[answerKey] = word.upper()  # Storing answers in uppercase
    
    # This part does not account for vertical words or single letters as answers
    return {"grid": grid, "answers": answers}

csv_path = os.path.join(os.path.dirname(__file__), 'data', 'crossword.csv')
crossword_data = load_crossword_from_csv(csv_path)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/get-crossword', methods=['GET'])
def get_crossword():
    return jsonify(crossword_data["grid"])

@app.route('/check-guess', methods=['POST'])
def check_guess():
    try:
        data = request.json
        user_answers = data.get("answers", {})
        incorrect_ids = []
        
        for cell_id, user_answer in user_answers.items():
            correct_answer = crossword_data["answers"].get(cell_id, "").upper()
            print(f"Checking {cell_id}: user_answer={user_answer.strip().upper()} vs correct_answer={correct_answer}")
            if user_answer.strip().upper() != correct_answer:
                incorrect_ids.append(cell_id)
            
        return jsonify({"correct": len(incorrect_ids) == 0, "incorrect_answers": incorrect_ids})
    except Exception as e:
        print(f"Error processing /check-guess request: {e}")
        print("User answers:", user_answers)
        print("Incorrect IDs:", incorrect_ids)

        return jsonify({"error": "An error occurred processing your request."}), 500




if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
