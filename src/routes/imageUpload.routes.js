const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/imageUpload.controller'); 
const { requireAuthApi } = require('../middleware/auth');

router.use(requireAuthApi);

router.post('/', uploadController.uploadMiddleware, uploadController.handleUpload);

module.exports = router;