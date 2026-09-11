import { validateCardMessage } from './card-validation';

describe('validateCardMessage', () => {
    it('allows empty text', () => {
        expect(validateCardMessage('')).toEqual({ isValid: true });
        expect(validateCardMessage('   ')).toEqual({ isValid: true });
    });

    it('allows pure Hebrew text', () => {
        expect(validateCardMessage('מזל טוב ליום ההולדת! מאחל המון בריאות ואושר')).toEqual({ isValid: true });
    });

    it('allows pure English text', () => {
        expect(validateCardMessage('Happy Birthday! Wishing you all the best.')).toEqual({ isValid: true });
    });

    it('allows mixed Hebrew, English, numbers, punctuation and emojis', () => {
        expect(validateCardMessage('מזל טוב! Happy Birthday 2026 🎉 ❤️')).toEqual({ isValid: true });
    });

    it('rejects Spanish text with special characters', () => {
        expect(validateCardMessage('¡Feliz cumpleaños!')).toEqual({
            isValid: false,
            error: 'כרטיס הברכה יכול להכיל אותיות בעברית ובאנגלית בלבד (ללא ספרדית או שפות זרות אחרות).'
        });
        expect(validateCardMessage('Te quiero mucho señorita')).toEqual({
            isValid: false,
            error: 'כרטיס הברכה יכול להכיל אותיות בעברית ובאנגלית בלבד (ללא ספרדית או שפות זרות אחרות).'
        });
        expect(validateCardMessage('Está muy bien')).toEqual({
            isValid: false,
            error: 'כרטיס הברכה יכול להכיל אותיות בעברית ובאנגלית בלבד (ללא ספרדית או שפות זרות אחרות).'
        });
    });

    it('rejects other foreign scripts like Russian or Arabic', () => {
        expect(validateCardMessage('С днем рождения')).toEqual({
            isValid: false,
            error: 'כרטיס הברכה יכול להכיל אותיות בעברית ובאנגלית בלבד (ללא ספרדית או שפות זרות אחרות).'
        });
        expect(validateCardMessage('مبروك')).toEqual({
            isValid: false,
            error: 'כרטיס הברכה יכול להכיל אותיות בעברית ובאנגלית בלבד (ללא ספרדית או שפות זרות אחרות).'
        });
    });
});
