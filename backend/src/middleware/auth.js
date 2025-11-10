const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "No token" });
  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("-password");
    if (!user) return res.status(401).json({ message: "Invalid token" });
    req.user = user;
    req.user.role = payload.role;
    req.user.tenantId = payload.tenantId;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Token invalid", error: err.message });
  }
};

module.exports = authMiddleware;
