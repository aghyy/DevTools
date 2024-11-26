const fs = require("fs");
const path = require("path");
const md5 = require("md5");

const crackStationPath = path.join(__dirname, "crackstation.txt");

const loadDictionary = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(crackStationPath, "utf-8", (err, data) => {
      if (err) return reject(err);
      const dictionary = data.split("\n");
      resolve(dictionary);
    });
  });
};

const checkHashAgainstDictionary = async (hash) => {
  const dictionary = await loadDictionary();

  for (let word of dictionary) {
    const wordHash = md5(word.trim()); // You can use a hashing library like `md5` or `crypto`
    if (wordHash === hash) {
      return word;
    }
  }
  return null; // Not found in the dictionary
};

module.exports = { checkHashAgainstDictionary };