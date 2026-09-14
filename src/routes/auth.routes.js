const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { redirectIfAuthed } = require("../middleware/auth");

router.get("/login", redirectIfAuthed, authController.showLogin);
router.post("/login", redirectIfAuthed, authController.login);
router.post("/logout", authController.logout);
router.get("/logout", authController.logout);

module.exports = router;
