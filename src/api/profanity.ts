const PROFANE_WORDS = ["kerfuffle", "sharbert", "fornax"];

export function cleanProfanities(text: string): string {
  let result = '';
  let currentWord = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    if (/[a-zA-Z]/.test(char)) {
      currentWord += char;
    } else {
      // We hit a non-letter character
      if (currentWord) {
        // Check if currentWord is profane (case-insensitive)
        if (PROFANE_WORDS.includes(currentWord.toLowerCase())) {
          result += '****';
        } else {
          result += currentWord;
        }
        currentWord = '';
      }
      result += char;
    }
  }
  
  // Don't forget the last word if the text ends with a letter
  if (currentWord) {
    if (PROFANE_WORDS.includes(currentWord.toLowerCase())) {
      result += '****';
    } else {
      result += currentWord;
    }
  }
  
  return result;
}
