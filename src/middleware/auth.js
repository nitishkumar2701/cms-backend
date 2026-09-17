const jwt = require("jsonwebtoken");

const COOKIE_NAME = "cms_token";

function signToken(payload) {
  const expiresIn = Number(process.env.TOKEN_EXPIRY_SECONDS || 28800);
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}

function requireAuthPage(req, res, next) {
  const token = req.cookies[COOKIE_NAME];
  const user = token && verifyToken(token);
  if (!user) {
    return res.redirect("/login");
  }
  req.user = user;
  res.locals.currentUser = user;
  next();
}

function requireAuthApi(req, res, next) {
  const token = req.cookies[COOKIE_NAME];
  const user = token && verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  req.user = user;
  next();
}

function redirectIfAuthed(req, res, next) {
  const token = req.cookies[COOKIE_NAME];
  const user = token && verifyToken(token);
  if (user) {
    return res.redirect("/dashboard");
  }
  next();
}

module.exports = {
  COOKIE_NAME,
  signToken,
  verifyToken,
  requireAuthPage,
  requireAuthApi,
  redirectIfAuthed,
};
