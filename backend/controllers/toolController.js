const { checkMD5AgainstWordlist, checkSHA1AgainstWordlist, addToWordlistHelper } = require('../utils/toolHelper');

const decryptMD5 = async (req, res) => {
  // Extract hash from the query parameters
  const { hash } = req.query;

  // Check if the hash is provided
  if (!hash) {
    return res.status(400).json({ error: "Hash parameter is required" });
  }

  try {
    // Call the checkMD5AgainstWordlist function to check the hash
    const decryptedText = await checkMD5AgainstWordlist(hash);

    return res.json({ decryptedText: decryptedText });

  } catch (error) {
    // Log the error and return a 500 status code if there's an issue
    console.error('Error while processing hash:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const decryptSHA1 = async (req, res) => {
  // Extract hash from the query parameters
  const { hash } = req.query;

  // Check if the hash is provided
  if (!hash) {
    return res.status(400).json({ error: "Hash parameter is required" });
  }

  try {
    // Call the checkSHA1AgainstWordlist function to check the hash
    const decryptedText = await checkSHA1AgainstWordlist(hash);

    return res.json({ decryptedText: decryptedText });

  } catch (error) {
    // Log the error and return a 500 status code if there's an issue
    console.error('Error while processing hash:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const addToWordlist = async (req, res) => {
  // Extract the word from the request body
  const { word } = req.body;

  // Check if the word is provided
  if (!word) {
    return res.status(400).json({ error: "Word parameter is required" });
  }

  try {
    // Call the addToWordlistHelper function to add the word to the wordlist
    await addToWordlistHelper(word);

    return res.json({ message: 'Word added to the wordlist' });

  } catch (error) {
    // Log the error and return a 500 status code if there's an issue
    console.error('Error while adding word to the wordlist:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { decryptMD5, decryptSHA1, addToWordlist };