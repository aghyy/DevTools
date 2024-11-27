const { checkHashInDictionary } = require('../utils/md5Helper');

const decryptMD5 = async (req, res) => {
  const { hash } = req.query;

  if (!hash) {
    return res.status(400).json({ error: "Hash parameter is required" });
  }

  try {
    const plaintext = await checkHashInDictionary(hash);

    if (plaintext) {
      return res.json({ decryptedText: plaintext });
    } else {
      return res.status(404).json({ error: "Hash not found in dictionary" });
    }
  } catch (error) {
    console.error('Error while processing hash:', error);  // Log errors
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { decryptMD5 };