const express = require('express');
const router = express.Router();
const { decryptMD5 } = require('../controllers/md5Controller');

router.get('/decrypt-md5', decryptMD5);

module.exports = router;