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

// Protects page routes (dashboard views): redirects to /login if not authed.
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

// Protects JSON API routes: returns 401 instead of redirecting.
function requireAuthApi(req, res, next) {
  const token = req.cookies[COOKIE_NAME];
  const user = token && verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  req.user = user;
  next();
}

// If already logged in, skip the login page.
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
