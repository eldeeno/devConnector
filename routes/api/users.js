const validateRegister = require('../../validations/register');
const validateLogin = require('../../validations/login');
const config = require('../../config/key');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const express = require('express');
const router = express.Router();



const User = require('../../models/User');

// @route   GET api/users
// @desc    Test users route
// @access  Public
router.get('/', (req, res) => {
  res.json({
    msg: 'Users works'
  });
});

// @route   POST api/users/register
// @desc    Regsiter users route
// @access  Public
router.post('/register', async (req, res) => {
  const { errors, isValid } = validateRegister(req.body);

  if(!isValid) return res.status(400).json(errors);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send('user already registered');

  const avatar = gravatar.url(req.body.email, {
    s: 200,
    r: 'pg',
    default: 'mm'
  });

  user = new User({ 
    name: req.body.name,
    email: req.body.email,
    avatar,
    password: req.body.password 
  });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  res.send(_.pick(user, ['_id', 'name', 'email']));
});

// @route   GET api/users/login
// @desc    Login users route
// @access  Public
router.post('/login', async (req, res) => {
  const { errors, isValid } = validateLogin(req.body);

  if(!isValid) return res.status(400).json(errors);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).send('Email not available...');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send('Incorrect password...');

  const token = jwt.sign(
    { 
      id: user.id, 
      name: user.name,
      avatar: user.avatar 
    },
    config.secretKey,
    { expiresIn: 3600 }
  );
  
  res.json({
    success: true,
    token: 'Bearer ' + token});
  });

module.exports = router;