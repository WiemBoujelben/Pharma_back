import User from "../models/User.js";

const registerUser = async (req, res) => {
  const { wallet, role } = req.body;
  try {
    const user = new User({ wallet, role });
    await user.save();
    res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default { registerUser };