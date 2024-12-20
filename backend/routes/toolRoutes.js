const express = require('express');
const router = express.Router();
const { decryptMD5, decryptSHA1, addToWordlist, useProxy } = require('../controllers/toolController');

router.get('/decrypt-md5', decryptMD5);
router.get('/decrypt-sha1', decryptSHA1);
router.post('/add-to-wordlist', addToWordlist);

router.get('/proxy', useProxy);

module.exports = router;