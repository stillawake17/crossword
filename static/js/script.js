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
            console.log(data); // For debugging: log the fetched grid and clues data
            generateCrossword(data.grid); // Corrected to pass only the grid part of the data
            displayClues(data.clues); // Assuming displayClues function is correctly implemented
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

// Function to display clues
function displayClues(clues) {
    const cluesContainer = document.getElementById('clues-container');
    cluesContainer.innerHTML = ''; // Clear previous clues

    // Display 'Across' clues
    const acrossClues = document.createElement('div');
    acrossClues.innerHTML = '<h3>Across</h3><ul>' + 
        Object.entries(clues.across).map(([number, clue]) => `<li>${number}. ${clue}</li>`).join('') + 
        '</ul>';
    cluesContainer.appendChild(acrossClues);

    // Display 'Down' clues
    const downClues = document.createElement('div');
    downClues.innerHTML = '<h3>Down</h3><ul>' + 
        Object.entries(clues.down).map(([number, clue]) => `<li>${number}. ${clue}</li>`).join('') + 
        '</ul>';
    cluesContainer.appendChild(downClues);
}

// Existing functions (handleInput, checkAnswers, clearCrossword) remain unchanged...

document.addEventListener('DOMContentLoaded', fetchCrossword);
