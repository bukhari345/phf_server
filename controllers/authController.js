const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// eslint-disable-next-line consistent-return
exports.signup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      cnic,
      phone,
      profession,
      password,
      confirmPassword,
    } = req.body;

    //  Validate password match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    //  Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //  Create user
    const newUser = await User.create({
      firstName,
      lastName,
      email, // <-- MUST include this
      cnic,
      phone,
      profession,
      password: hashedPassword,
    });

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// eslint-disable-next-line consistent-return
// eslint-disable-next-line consistent-return
exports.login = async (req, res) => {
  try {
    const { cnic, password } = req.body;

    const user = await User.findOne({ where: { cnic } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Sign token with only user ID
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    // Remove password before sending user info
    const { password: _, ...userData } = user.toJSON();

    res.status(200).json({
      message: 'Login successful',
      token,
      user: userData, // ✅ send user info in response
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
