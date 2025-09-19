const table = document.getElementById("resultTable");
const form = document.getElementById('inputForm');
const errorTag = document.getElementById('errorMessage');
const errorCell = document.getElementById('errorCell')

const input = { x: 0, y: 0, r: 0 };
const acceptableX = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];
const acceptableR = [1, 1.5, 2, 2.5, 3]; 
let prevResults = JSON.parse(localStorage.getItem('resultRow')) || [];
renderTable(prevResults);
form.addEventListener('submit', async function(event) {
    event.preventDefault();
    try {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    input.x = parseNumber(data.x);
    input.y = parseNumber(data.y);
    input.r = parseNumber(data.r);
    
    if (validate(input)) {
            const params = new URLSearchParams(input);
            const response = await fetch("/fcgi-bin/web1-1.0-SNAPSHOT.jar?" + params.toString());
            const contentType = response.headers.get("content-type");
            if(response.status == 404){
                throw new Error('Сервер не найден');
            }
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Сервер вернул не JSON: " + contentType);
            }
            const answer = await response.json();
            if (response.ok) {
                saveAndShow(answer);
            }
            else
                errorMessage('Сервер вернул ошибку: '+answer.reason);    
        }        
        } catch (error) {
            errorMessage("Ошибка: " + error.message);
        }
});
clearButton.addEventListener('click', async function(event) {
    event.preventDefault();
    clearTable();
    localStorage.setItem('resultRow', JSON.stringify(null));
    prevResults=[];
});
function parseNumber(str){
    const normalizedStr = str.toString().replace(',', '.');
    const numberRegex = /^-?\d+(\.\d+)?$/; 
    if (!numberRegex.test(normalizedStr)) {
        errorMessage("Ошибка: Введено не число!");    
    }
    const num = Number(normalizedStr);
    if (isNaN(num)) {
        errorMessage("Ошибка: Введено не число!");    
    }
    return num;
}
function validate(input) {
    try {
        if (isNaN(input.x)) throw new Error('Поле X должно быть числом!');
        if (isNaN(input.y)) throw new Error('Поле Y должно быть числом от -3 до 3 !');
        if (isNaN(input.r)) throw new Error('Поле R должно быть числом!');
        if (!acceptableX.includes(input.x)) throw new Error('Недопустимое значение X!');
        if (Number(input.y) < -3 || Number(input.y) > 3) throw new Error('Поле Y должно быть числом от -3 до 3 !');
        if (!acceptableR.includes(input.r)) throw new Error('Недопустимое значение R!');
        return true;
    } catch (e) {
        errorMessage(e.message);
        return false;
    }
}

function errorMessage(message) {
    errorTag.textContent = message;
    errorTag.style.display = "inline";
    errorCell.style.display = "inline";
    setTimeout(() => {
        errorTag.textContent = "";
        errorTag.style.display = "none";
        errorCell.style.display = "none";
    }, 3000);
}

function saveAndShow(answer) {
    prevResults.push({
        x: answer.x,
        y: answer.y,
        r: answer.r,
        time: answer.time,
        executionTime: answer.executionTime,
        result: answer.result
    });
    localStorage.setItem('resultRow', JSON.stringify(prevResults));
    clearTable();
    renderTable(prevResults);
}
function renderTable(results) {
    results.forEach((result) => {
        const newRow = table.insertRow();
        const cellsData = [
            result.x?.toString() ?? '',
            result.y?.toString() ?? '',
            result.r?.toString() ?? '',
            result.time ?? '',
            result.executionTime ?? '',
            result.result ?? ''
        ];
        cellsData.forEach(text => {
            const cell = newRow.insertCell();
            cell.textContent = text;
            if(text === 'попал' || text === 'не попал'){
                const ok = text.trim().toLowerCase() === 'попал';
                cell.classList.add(ok ? 'yes' : 'no');
            }
        });
    });
}
function clearTable() {
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }
}