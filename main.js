import { validateInput, parseNumber } from './validation.js';
import { renderTable, clearTable, saveResults } from './table.js';

const form = document.getElementById('inputForm');
const clearButton = document.getElementById('clearButton');
const errorTag = document.getElementById('errorMessage');
const errorCell = document.getElementById('errorCell');
const themeTag = document.getElementById('themeTag');

let prevResults = JSON.parse(localStorage.getItem('resultRow')) || [];
renderTable(prevResults);
form.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        const input = {
            x: parseNumber(data.x),
            y: parseNumber(data.y),
            r: parseNumber(data.r)
        };
        
        if (validateInput(input)) {
            const params = new URLSearchParams(input);
            const response = await fetch("/fcgi-bin/web1-1.0-SNAPSHOT.jar?" + params.toString());
            
            if (response.status == 404) {
                throw new Error('Сервер не найден');
            }
            
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Сервер вернул не JSON: " + contentType);
            }
            
            const answer = await response.json();
            
            if (response.ok) {
                saveResults(answer, prevResults);
                renderTable(prevResults);
            } else {
                throw new Error('Сервер вернул ошибку: ' + answer.reason);
            }
        }
    } catch (error) {
        showError(error.message);
    }
});
clearButton.addEventListener('click', function(event) {
    event.preventDefault();
    clearTable();
    localStorage.setItem('resultRow', JSON.stringify([]));
    prevResults = [];
});
function showError(message) {
    errorTag.textContent = "Ошибка: " + message;
    errorTag.style.display = "inline";
    errorCell.style.display = "inline";
    setTimeout(() => {
        errorTag.textContent = "";
        errorTag.style.display = "none";
        errorCell.style.display = "none";
    }, 3000);
}
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateButtonText(savedTheme);
    }
});
themeTag.addEventListener('click', function() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = (currentTheme === 'dark') ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateButtonText(newTheme);
    });
function updateButtonText(theme) {
     themeTag.innerHTML = theme === 'dark' ? '☀️' : '🌙';
}
