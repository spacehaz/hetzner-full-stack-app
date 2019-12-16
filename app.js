const express = require( 'express' );
const userRoutes = require( './routers/user.js' );
const mongoose = require( 'mongoose' );
const path = require( 'path' );
const cookie = require( 'cookie-parser' );
const jwt = require('jsonwebtoken');
const User = require('./models/user.js');
const cors = require('cors');

const app = express();
// подключение к монго
mongoose.connect( 'mongodb://127.0.0.1:27017/authentication-project', { useNewUrlParser: true,
  useCreateIndex: true
}, (error, client) => {});

// app.use(function(req, res, next) {  
//     res.header('Access-Control-Allow-Origin', req.headers.origin);
//     res.header('Access-Control-Allow-Credentials', true);
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });  
app.use(express.static(path.join(__dirname, '/public')))

// позволяет работать с json форматом в запросе
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// позволяет работать с куками
app.use(cookie());

// миддлвеар который контролирует область доступа для юзера
app.use((req, res, next) => {
  console.log('cookie: ', req.cookies['my-token'])
  if (req.path === '/register') {
    return next();
  }
  if (req.path !== '/login' && !req.cookies['my-token']) {
    return res.redirect('/login');
  }
  if (req.path === '/login' && req.cookies['my-token']) {
    return res.redirect('/');
  }
  next();
});

app.use(userRoutes);

// Корневой урл, на который пользователь попадет только если он был авторизован. во всех остальных случаях он не попадет сюда
app.get('/', (req, res, next) => {
  var decoded = jwt.verify(req.cookies['my-token'], 'my-token-key');
  const { email } = decoded
  console.log({ email })
  res.sendFile('public/main.html', { root: './' });
});

app.use((err, req, res, next) => {
  console.log('from centralized error handler')
  res.status(404).send(err)
  next();
});

app.listen(3000, () => {
    console.log('listening on port 3000');
});