import csv
import os
import traceback
from flask import Flask, jsonify, render_template, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def load_crossword_from_csv(file_path):
    grid = []
    answers = {}  # Adjusted to map individual cells to letters
    clues = {
        "across": {
            "1": "First clue across",  # Example clues
            "2": "Second clue across"
        },
        "down": {
            "1": "First clue down",
            "3": "Second clue down"
        }
    }
    
    with open(file_path, newline='') as csvfile:
        reader = csv.reader(csvfile)
        for rowIndex, row in enumerate(reader):
            gridRow = [None if cell == '.' else cell for cell in row]
            grid.append(gridRow)
            # Map each letter to its cell
            for columnIndex, cell in enumerate(row):
                if cell != '.':
                    answers[f"cell-{rowIndex}-{columnIndex}"] = cell.upper()
    
    return {"grid": grid, "answers": answers, "clues": clues}

csv_path = os.path.join(os.path.dirname(__file__), 'data', 'crossword.csv')
crossword_data = load_crossword_from_csv(csv_path)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/get-crossword', methods=['GET'])
def get_crossword():
    # Now returning the entire crossword_data including clues
    return jsonify(crossword_data)

@app.route('/check-guess', methods=['POST'])
def check_guess():
    user_answers = {}  # Initialize outside try to avoid reference before assignment
    incorrect_ids = []
    try:
        data = request.json
        user_answers = data.get("answers", {})
        
        for cell_id, user_answer in user_answers.items():
            correct_answer = crossword_data["answers"].get(cell_id, "").upper()  # Ensure upper for consistent comparison
            if correct_answer:
                print(f"Comparing {cell_id}: User answer='{user_answer.strip().upper()}', Correct answer='{correct_answer}'")
                if user_answer.strip().upper() != correct_answer:
                    incorrect_ids.append(cell_id)
            else:
                print(f"No correct answer found for {cell_id}. User answer was '{user_answer.strip().upper()}'")
        
        return jsonify({"correct": len(incorrect_ids) == 0, "incorrect_answers": incorrect_ids})
    except Exception as e:
        print(f"Error processing /check-guess request: {e}")
        traceback.print_exc()
        print("User answers:", user_answers)
        print("Incorrect IDs:", incorrect_ids)
        return jsonify({"error": "An error occurred processing your request."}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
