const express = require('express');
// routes
const userRouter = require('./routes/api/users');
const profileRouter = require('./routes/api/profile');
const postRouter = require('./routes/api/posts');

const passport = require('passport');
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//DB connect
require('./config/db')();

// passport middleware
app.use(passport.initialize());

// passport config
require('./config/passport')(passport);

app.get('/', (req, res) => res.send('Helloworld'));

app.use('/api/users', userRouter);
app.use('/api/profile', profileRouter);
app.use('/api/posts', postRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on ${port}`));