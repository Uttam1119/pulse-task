const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

router.post("/register", async (req, res) => {
  const { email, password, name, role, tenantId } = req.body;
  if (!email || !password || !tenantId)
    return res.status(400).json({ message: "missing" });
  try {
    let user = new User({
      email,
      password,
      name,
      role: role || "viewer",
      tenantId,
    });
    await user.save();
    const token = jwt.sign(
      { id: user._id, role: user.role, tenantId: user.tenantId },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    res.json({
      token,
      user: { id: user._id, email: user.email, role: user.role, tenantId },
    });
  } catch (err) {
    res
      .status(400)
      .json({ message: "error creating user", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "missing" });
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "invalid creds" });
  const ok = await user.comparePassword(password);
  if (!ok) return res.status(400).json({ message: "invalid creds" });
  const token = jwt.sign(
    { id: user._id, role: user.role, tenantId: user.tenantId },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
  res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    },
  });
});

router.get("/me", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.json({ user: null });
  try {
    const token = auth.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(payload.id).select("-password");

    return res.json({
      user: {
        id: user._id,
        email: user.email,
        role: payload.role,
        tenantId: payload.tenantId,
      },
    });
  } catch (err) {
    return res.json({ user: null });
  }
});

module.exports = router;
