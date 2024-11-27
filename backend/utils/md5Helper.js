const fs = require('fs');
const path = require('path');
const readline = require('readline');

const checkHashInDictionary = (hash) => {
  const dictionaryPath = path.join(__dirname, 'crackstation.txt');
  
  return new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(dictionaryPath, 'utf-8');
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      const [plaintext, md5hash] = line.split(' ');

      console.log(`Checking ${md5hash} against ${hash}`); 

      if (!md5hash || !plaintext) return;

      if (md5hash === hash) {
        rl.close();
        resolve(plaintext);
      }
    });

    rl.on('close', () => {
      resolve(null);
    });

    rl.on('error', (error) => {
      reject(error);
    });
  });
};

module.exports = { checkHashInDictionary };