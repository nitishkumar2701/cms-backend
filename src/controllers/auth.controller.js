const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const { signToken, COOKIE_NAME } = require("../middleware/auth");

function cookieOptions() {
  const maxAge = Number(process.env.TOKEN_EXPIRY_SECONDS || 28800) * 1000;
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge,
  };
}

exports.showLogin = (req, res) => {
  res.render("login", { layout: false, error: null });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).render("login", {
      layout: false,
      error: "Username and password are required.",
    });
  }

  try {
    const admin = await prisma.adminUser.findUnique({ where: { username } });

    if (!admin) {
      return res.status(401).render("login", {
        layout: false,
        error: "Invalid username or password.",
      });
    }

    let passwordMatches = false;
    if (/^\$2[aby]\$/.test(admin.password)) {
      passwordMatches = await bcrypt.compare(password, admin.password);
    } else {
      passwordMatches = password === admin.password;
    }

    if (!passwordMatches) {
      return res.status(401).render("login", {
        layout: false,
        error: "Invalid username or password.",
      });
    }

    const token = signToken({ id: admin.id, username: admin.username });
    res.cookie(COOKIE_NAME, token, cookieOptions());
    return res.redirect("/dashboard");
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).render("login", {
      layout: false,
      error: "Something went wrong. Please try again.",
    });
  }
};

exports.logout = (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.redirect("/login");
};
