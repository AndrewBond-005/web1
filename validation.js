const ACCEPTABLE_X = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];
const ACCEPTABLE_R = [1, 1.5, 2, 2.5, 3];
export function parseNumber(str) {
    const normalizedStr = str.toString().replace(',', '.');
    const numberRegex = /^-?\d+(\.\d+)?$/;
    if (!numberRegex.test(normalizedStr)) {
        throw new Error("Введено не число!");
    }
    const num = Number(normalizedStr);
    if (isNaN(num)) {
        throw new Error("Введено не число!");
    }
    return num;
}
export function validateInput(input) {
    if (isNaN(input.x)) throw new Error('Поле X должно быть числом!');
    if (isNaN(input.y)) throw new Error('Поле Y должно быть числом от -3 до 3!');
    if (isNaN(input.r)) throw new Error('Поле R должно быть числом!');
    if (!ACCEPTABLE_X.includes(input.x)) throw new Error('Недопустимое значение X!');
    if (input.y < -3 || input.y > 3) throw new Error('Поле Y должно быть числом от -3 до 3!');
    if (!ACCEPTABLE_R.includes(input.r)) throw new Error('Недопустимое значение R!');
    return true;
}