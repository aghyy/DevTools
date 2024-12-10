const express = require('express');
const router = express.Router();
const { decryptMD5, addToWordlist } = require('../controllers/toolController');

router.get('/decrypt-md5', decryptMD5);
router.post('/add-to-wordlist', addToWordlist);

module.exports = router;