// Vigenere cipher implementation

type Operation = (charNum: number, keyNum: number) => number;

// Function to run the original Vigenère algorithm
function runVigenere(
  message: string,
  key: string,
  alphabet: string,
  operation: Operation
): string {
  const keyNumbers: number[] = [];
  for (let i = 0; i < message.length; i++) {
    const keyLetter = key[i % key.length];
    const keyNumber = alphabet.indexOf(keyLetter);
    keyNumbers.push(keyNumber);
  }
  
  const messageNumbers = message.split('').map(char => alphabet.indexOf(char));
  return applyOperation(messageNumbers, keyNumbers, operation, alphabet);
}

// Function to run the Autokey algorithm (variant of Vigenère)
function runAutokey(
  message: string,
  key: string,
  alphabet: string,
  operation: Operation
): string {
  const combinedKey = (key + message).substring(0, message.length);
  
  const keyNumbers: number[] = [];
  for (const keyLetter of combinedKey) {
    const keyNumber = alphabet.indexOf(keyLetter);
    keyNumbers.push(keyNumber);
  }
  
  const messageNumbers = message.split('').map(char => alphabet.indexOf(char));
  return applyOperation(messageNumbers, keyNumbers, operation, alphabet);
}

// Function to run the Gronsfeld algorithm (variant of Vigenère)
function runGronsfeld(
  message: string,
  key: string,
  alphabet: string,
  operation: Operation
): string {
  const keyNumbers = key.split('').map(n => parseInt(n));
  const messageNumbers = message.split('').map(char => alphabet.indexOf(char));
  return applyOperation(messageNumbers, keyNumbers, operation, alphabet);
}

// Function to run the Porta algorithm (variant of Vigenère)
function runPorta(
  message: string,
  key: string,
  alphabet: string
): string {
  const keyNumbers: number[] = [];
  for (let i = 0; i < message.length; i++) {
    const keyLetter = key[i % key.length];
    const keyNumber = alphabet.indexOf(keyLetter);
    keyNumbers.push(keyNumber);
  }
  
  let result = "";
  for (let index = 0; index < message.length; index++) {
    const char = message[index];
    const charNumber = alphabet.indexOf(char);
    const keyNumber = keyNumbers[index];
    
    if (charNumber < 0 || keyNumber < 0) {
      continue;
    }
    
    const [firstHalf, secondHalf] = splitAlphabet(keyNumber, alphabet);
    
    if (firstHalf.includes(char)) {
      result += secondHalf[firstHalf.indexOf(char)];
    }
    if (secondHalf.includes(char)) {
      result += firstHalf[secondHalf.indexOf(char)];
    }
  }
  
  return result;
}

// Helper function for operation application
function applyOperation(
  message: number[],
  key: number[],
  operation: Operation,
  alphabet: string
): string {
  let result = "";
  
  message.forEach((charNumber, charIndex) => {
    const keyNumber = key[charIndex % key.length];
    if (charNumber >= 0 && keyNumber >= 0) {
      const alphabetNumber = operation(charNumber, keyNumber) % alphabet.length;
      const finalIndex = alphabetNumber >= 0 ? alphabetNumber : alphabetNumber + alphabet.length;
      result += alphabet[finalIndex];
    }
  });
  
  return result;
}

// Helper function for Porta algorithm
function splitAlphabet(keyIndex: number, alphabet: string): [string, string] {
  const halfLen = Math.ceil(alphabet.length / 2);
  const firstHalf = alphabet.substring(0, halfLen);
  const secondHalf = alphabet.substring(halfLen);
  const halfKeyIndex = Math.floor(keyIndex / 2);
  
  let shiftedSecondHalf = "";
  for (let i = 0; i < secondHalf.length; i++) {
    const newIndex = (halfKeyIndex + i) % halfLen;
    shiftedSecondHalf += secondHalf.charAt(newIndex < secondHalf.length ? newIndex : newIndex % secondHalf.length);
  }
  
  return [firstHalf, shiftedSecondHalf];
}

// Main encryption function
export function encrypt(
  message: string,
  key: string,
  variant: string,
  alphabet: string
): string {
  const operation: Operation = (charNum, keyNum) => charNum + keyNum;

  switch (variant) {
    case 'porta':
      return runPorta(message, key, alphabet);
    case 'gronsfeld':
      return runGronsfeld(message, key, alphabet, operation);
    case 'autokey':
      return runAutokey(message, key, alphabet, operation);
    case 'beaufort':
      return runVigenere(message, key, alphabet, (charNum, keyNum) => keyNum - charNum);
    default:
      return runVigenere(message, key, alphabet, operation);
  }
}

// Main decryption function
export function decrypt(
  message: string,
  key: string,
  variant: string,
  alphabet: string
): string {
  const operation: Operation = (charNum, keyNum) => charNum - keyNum;

  switch (variant) {
    case 'porta':
      return runPorta(message, key, alphabet);
    case 'gronsfeld':
      return runGronsfeld(message, key, alphabet, operation);
    case 'autokey':
      return runAutokey(message, key, alphabet, operation);
    case 'beaufort':
      return runVigenere(message, key, alphabet, (charNum, keyNum) => keyNum + charNum);
    default:
      return runVigenere(message, key, alphabet, operation);
  }
} 