const table = document.getElementById("resultTable");
export function addResults(results) {
    let k=-1;
    if(!results.length){
        k=1;
        results=[results];
    }
    results.forEach((result) => {
        const newRow = table.insertRow(k);
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
            if (text === 'попал' || text === 'не попал') {
                const ok = text.trim().toLowerCase() === 'попал';
                cell.classList.add(ok ? 'yes' : 'no');
            }
        });
    });
}
export function clearTable() {
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }
}
export function saveResults(answer, prevResults) {
    prevResults.unshift({
        x: answer.x,
        y: answer.y,
        r: answer.r,
        time: answer.time,
        executionTime: answer.executionTime / 1000,
        result: answer.result
    });
    localStorage.setItem('resultRow', JSON.stringify(prevResults));
}
