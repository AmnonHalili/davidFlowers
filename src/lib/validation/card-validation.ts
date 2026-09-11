/**
 * Validates whether a greeting card message contains only allowed characters
 * (Hebrew, English, digits, spaces, standard punctuation, and emojis).
 * Spanish accents (á, é, í, ó, ú, ñ, ¿, ¡) and other non-Hebrew/English scripts are rejected.
 */
export function validateCardMessage(text: string): { isValid: boolean; error?: string } {
    if (!text || text.trim() === '') {
        return { isValid: true };
    }

    // Pattern allowing Hebrew (\u0590-\u05FF), English (a-zA-Z), Digits (0-9),
    // Whitespaces, common punctuation, and Emojis.
    const allowedPattern = new RegExp('^[\\u0590-\\u05FFa-zA-Z0-9\\s.,!?\'"()\\-_:;\\/&%+@#$~*=\\p{Extended_Pictographic}\\u{2600}-\\u{26FF}\\u{2700}-\\u{27BF}\\u{FE0F}]*$', 'u');

    if (!allowedPattern.test(text)) {
        return {
            isValid: false,
            error: 'כרטיס הברכה יכול להכיל אותיות בעברית ובאנגלית בלבד (ללא ספרדית או שפות זרות אחרות).'
        };
    }

    return { isValid: true };
}
