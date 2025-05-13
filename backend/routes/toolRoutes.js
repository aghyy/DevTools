const express = require('express');
const router = express.Router();
const { 
  decryptMD5, 
  decryptSHA1, 
  decryptSHA256,
  decryptSHA224,
  decryptSHA512,
  decryptSHA384,
  decryptSHA3,
  decryptRIPEMD160,
  decryptHash,
  addToWordlist, 
  useProxy, 
  shortenUrl, 
  redirectToOriginalUrl 
} = require('../controllers/toolController');

// Backward compatibility routes
router.get('/decrypt-md5', decryptMD5);
router.get('/decrypt-sha1', decryptSHA1);

// New specific hash algorithm routes
router.get('/decrypt-sha256', decryptSHA256);
router.get('/decrypt-sha224', decryptSHA224);
router.get('/decrypt-sha512', decryptSHA512);
router.get('/decrypt-sha384', decryptSHA384);
router.get('/decrypt-sha3', decryptSHA3);
router.get('/decrypt-ripemd160', decryptRIPEMD160);

// Generic hash route that can handle all algorithms
router.get('/decrypt-hash', decryptHash);

router.post('/add-to-wordlist', addToWordlist);
router.get('/proxy', useProxy);

// URL Shortener Routes
router.post('/shorten-url', shortenUrl);
router.get('/redirect/:shortCode', redirectToOriginalUrl);

module.exports = router;