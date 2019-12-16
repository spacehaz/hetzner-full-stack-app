const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user.js');
const route = express.Router();
const jwt = require('jsonwebtoken');

 
// Страница логина
route.get('/login', async (req, res) => {
    res.sendFile('public/login.html', { root: './' });
});

route.get('/register', async (req, res) => {
    res.sendFile('public/register.html', { root: './' });
});

route.post('/logout', async (req, res) => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    res.cookie('my-token', '', {
        httpOnly: true,
        exp: date
    }).json({ message: 'unauthorized!' }); 
});

route.post('/register', async (req, res, next) => {
    const { email, password } = req.body
    const user = await User.findOne({ email });
    if (!user) {
        const newUser = new User({ email, password })
        newUser.save(function (err, user) {
          if (err) return next({ errorMessage: err });
          res.send({ message: 'success!' })
        })
        
    } else {
      return next({errorMessage: 'User exists' });
    }
});
 
// Логин пользователя по паролю и имейлу
route.post('/login', async (req, res, next) => {
    const { email, password } = req.body
    const user = await User.findOne({ email });
    if (!user) {
      return next({ errorMessage: 'Email is not existed' });
    }
    var isMatch = await bcrypt.compare(password, user.password );
 
    if (!isMatch ) {
      return next({errorMessage: 'Password is invalid' });
    }

    // -----
 
    var token = await jwt.sign({ 
        _id: user._id.toString(),
        email: user.email
        // это должен быть секретный ключ
    }, 'my-token-key' )

    const date = new Date();
    date.setDate(date.getDate() + 7);
 
    res.cookie('my-token', token, {
        maxAge: 1000000000000,
        httpOnly: true,
        exp: date
    }).json({ message: 'authorized!', token }); 
} );
 
module.exports = route;