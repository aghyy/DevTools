const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

const checkMD5AgainstWordlist = (hash) => {
  const defaultWordlistPath = path.join(__dirname, '../assets/default-wordlist.txt');
  const customWordlistPath = path.join(__dirname, '../assets/custom-wordlist.txt');

  const checkFile = (filePath) => {
    return new Promise((resolve, reject) => {
      // Create a readable stream for the wordlist file
      const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });

      // Create the readline interface to process the file line by line
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,  // Handle all line endings correctly
      });

      // Flag to prevent multiple resolutions of the promise
      let resolved = false;

      // Hash the line and check against the hash in each line
      rl.on('line', (line) => {
        const word = line.trim();  // Trim any surrounding whitespace
        if (word === '') return;   // Skip empty lines

        // Hash the word using MD5
        const wordHash = crypto.createHash('md5').update(word).digest('hex');

        if (wordHash === hash) {
          if (!resolved) {
            resolved = true;  // Ensure only one resolution happens
            rl.close();  // Stop reading once a match is found
            resolve(word);  // Resolve with the matched word
          }
        }
      });

      // When the file is fully processed, resolve with null if no match is found
      rl.on('close', () => {
        if (!resolved) {
          resolve(null);  // No match found, resolve with null
        }
      });

      // Handle errors, such as file read errors
      rl.on('error', (error) => {
        if (!resolved) {
          resolved = true;
          reject(error);  // Reject on error
        }
      });

      // Handle the stream error for any issues in the file reading process
      fileStream.on('error', (error) => {
        if (!resolved) {
          resolved = true;
          reject(error);  // Reject if fileStream has an error
        }
      });
    });
  };

  // First check default-wordlist.txt, if no match found check custom-wordlist.txt
  return checkFile(defaultWordlistPath)
    .then((result) => {
      if (result) {
        return result;  // Return the result from default-wordlist.txt
      } else {
        return checkFile(customWordlistPath);  // If no match in default, check custom
      }
    });
};

const addToWordlistHelper = (word) => {
  const customWordlistPath = path.join(__dirname, '../assets/custom-wordlist.txt');
  const defaultWordlistPath = path.join(__dirname, '../assets/default-wordlist.txt');

  return new Promise((resolve, reject) => {
    // Check if the word exists in the default wordlist
    fs.readFile(defaultWordlistPath, 'utf-8', (defaultReadError, defaultData) => {
      if (defaultReadError) {
        reject(defaultReadError);  // Reject if there's an error reading the default wordlist
      } else {
        const defaultWordList = defaultData.split('\n').map(line => line.trim());
        
        // If the word is in the default wordlist, reject without writing it
        if (defaultWordList.includes(word)) {
          resolve();  // Resolve immediately if the word is already in the default wordlist
        } else {
          // Check if the word already exists in the custom wordlist
          fs.readFile(customWordlistPath, 'utf-8', (customReadError, customData) => {
            if (customReadError) {
              reject(customReadError);  // Reject if there's an error reading the custom wordlist
            } else {
              const customWordList = customData.split('\n').map(line => line.trim());

              // If the word is already in the custom wordlist, resolve without writing
              if (customWordList.includes(word)) {
                resolve();  // Resolve if the word is already in the custom wordlist
              } else {
                // If the word is not in either wordlist, append it to the custom wordlist
                const fileStream = fs.createWriteStream(customWordlistPath, { flags: 'a' });

                fileStream.write(`${word}\n`, (writeError) => {
                  if (writeError) {
                    reject(writeError);  // Reject if there's an error while writing
                  } else {
                    resolve();  // Resolve if the word is written successfully
                  }
                });

                // Handle the stream error for any issues in the file writing process
                fileStream.on('error', (streamError) => {
                  reject(streamError);  // Reject if fileStream has an error
                });
              }
            }
          });
        }
      }
    });
  });
};

module.exports = { checkMD5AgainstWordlist, addToWordlistHelper };