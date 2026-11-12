import { describe, it } from 'node:test';
import { deepStrictEqual } from 'node:assert';
import { validateCardMessage } from './card-validation';

describe('validateCardMessage', () => {
    it('allows empty text', () => {
        deepStrictEqual(validateCardMessage(''), { isValid: true });
        deepStrictEqual(validateCardMessage('   '), { isValid: true });
    });

    it('allows pure Hebrew text', () => {
        deepStrictEqual(validateCardMessage('מזל טוב ליום ההולדת! מאחל המון בריאות ואושר'), { isValid: true });
    });

    it('allows pure English text', () => {
        deepStrictEqual(validateCardMessage('Happy Birthday! Wishing you all the best.'), { isValid: true });
    });

    it('allows mixed Hebrew, English, numbers, punctuation and emojis', () => {
        deepStrictEqual(validateCardMessage('מזל טוב! Happy Birthday 2026 🎉 ❤️'), { isValid: true });
    });

    it('rejects Spanish text with special characters', () => {
        deepStrictEqual(validateCardMessage('¡Feliz cumpleaños!'), {
            isValid: false,
            error: 'כרטיס הברכה יכול להכיל אותיות בעברית ובאנגלית בלבד (ללא ספרדית או שפות זרות אחרות).'
        });
        deepStrictEqual(validateCardMessage('Te quiero mucho señorita'), {
            isValid: false,
            error: 'כרטיס הברכה יכול להכיל אותיות בעברית ובאנגלית בלבד (ללא ספרדית או שפות זרות אחרות).'
        });
        deepStrictEqual(validateCardMessage('Está muy bien'), {
            isValid: false,
            error: 'כרטיס הברכה יכול להכיל אותיות בעברית ובאנגלית בלבד (ללא ספרדית או שפות זרות אחרות).'
        });
    });

    it('rejects other foreign scripts like Russian or Arabic', () => {
        deepStrictEqual(validateCardMessage('С днем рождения'), {
            isValid: false,
            error: 'כרטיס הברכה יכול להכיל אותיות בעברית ובאנגלית בלבד (ללא ספרדית או שפות זרות אחרות).'
        });
        deepStrictEqual(validateCardMessage('مبروك'), {
            isValid: false,
            error: 'כרטיס הברכה יכול להכיל אותיות בעברית ובאנגלית בלבד (ללא ספרדית או שפות זרות אחרות).'
        });
    });
});
