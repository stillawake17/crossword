// Fetch crossword data from the backend
function fetchCrossword() {
    fetch('/get-crossword')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log(data); // For debugging: log the fetched grid data
            generateCrossword(data); // Generate the crossword grid with the fetched data
        })
        .catch(error => {
            console.error('Error fetching crossword data:', error);
            document.getElementById('feedback').innerHTML = '<span style="color: red;">Failed to load crossword data.</span>';
        });
}

// Dynamically generate the crossword grid based on the fetched data
function generateCrossword(grid) {
    const crosswordContainer = document.getElementById('crossword');
    crosswordContainer.innerHTML = ''; // Clear existing grid

    const table = document.createElement('table');
    table.className = 'crossword-grid';
    let allInputs = []; // To keep track of all input fields for navigation

    grid.forEach((row, rowIndex) => {
        const tableRow = document.createElement('tr');
        row.forEach((cell, cellIndex) => {
            const tableCell = document.createElement('td');
            if (cell !== null) {
                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = 1; // Ensure only a single character can be entered
                input.setAttribute('data-cell', `cell-${rowIndex}-${cellIndex}`);
                input.addEventListener('input', (event) => handleInput(event, allInputs));
                tableCell.appendChild(input);
                allInputs.push(input); // Add this input to the array
            } else {
                tableCell.className = 'blocked';
            }
            tableRow.appendChild(tableCell);
        });
        table.appendChild(tableRow);
    });

    crosswordContainer.appendChild(table);
}

// Handle input in each crossword square
function handleInput(event, allInputs) {
    const input = event.target;
    if (input.value.length >= input.maxLength) {
        const currentIndex = allInputs.indexOf(input);
        const nextInput = allInputs[currentIndex + 1];
        if (nextInput) {
            nextInput.focus();
        }
    }
}

// Function for checking answers
function checkAnswers() {
    let answers = {};
    document.querySelectorAll('#crossword input[type="text"]').forEach(input => {
        let cellId = input.getAttribute('data-cell');
        answers[cellId] = input.value.toUpperCase(); // Convert answers to uppercase for consistency
    });

    fetch('/check-guess', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({answers: answers}),
    })
    .then(response => response.json())
    .then(data => {
        const feedbackElement = document.getElementById('feedback');
        if(data.correct) {
            feedbackElement.innerHTML = '<span style="color: green;">All answers are correct!</span>';
        } else {
            feedbackElement.innerHTML = '<span style="color: red;">Some answers are incorrect. Please try again.</span>';
            console.log("Incorrect IDs:", data.incorrect_answers);
            data.incorrect_answers.forEach(cellId => {
                let input = document.querySelector(`input[data-cell='${cellId}']`);
                if (input) {
                    input.style.backgroundColor = 'pink';
                } else {
                    console.error('Element not found for data-cell:', cellId);
                }
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('feedback').innerHTML = '<span style="color: red;">Error checking answers.</span>';
    });
}

document.addEventListener('DOMContentLoaded', fetchCrossword);
