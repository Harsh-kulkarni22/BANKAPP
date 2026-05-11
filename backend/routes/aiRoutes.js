const express = require('express');
const { chatWithAi } = require('../controllers/aiController');

const router = express.Router();

router.post('/chat', chatWithAi);

module.exports = router;
