const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const shortid = require('shortid');

const app = express();

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

var done = (err, data) => {
    if (err) {
        console.log("Error" + err);
    } else {
        console.log("Completed: " + data);
    }
};

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

mongoose.connect(process.env.MLAB_URI, options); 

const Schema = mongoose.Schema;

const exerciseSchema = new Schema ({
    userId: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    date: {
        type: Date
    }
});

const userSchema = new Schema ({
    username: {
        type: String,
        required: true
    },
    userId: String,
    log: [exerciseSchema]
});

const User = mongoose.model('User', userSchema);
const ExerciseSchema = mongoose.model('Exercise', exerciseSchema);

app.use(cors());
app.use(
    bodyParser.urlencoded({extended: false}),
    bodyParser.json()
);
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// GET response
app.get("/api/exercise/log", function( req,res ) {
    res.json({ greetings: "hey" });
});

// POST response
app.post("/api/exercise/new-user", function(req,res) {
    const newUser = {
        username: req.body.username,
        userId: shortid.generate(),
        log: []
    };
    User.findOne({ username: newUser.username }, (err,user) => {
        if (!user) {
            User.create(newUser, (err,data) => {
                res.json({
                    username: newUser.username,
                    _id: newUser.userId
                });
                return err ? done(err) : done(null,data);
            });
        } else {
            res.json("User already exist");
        }
        return err ? done(err) : done(null,done);
    });
});

app.post("/api/exercise/add", function( req, res ) {
    const newExercise = {
        userId: req.body.userId,
        description: req.body.description,
        duration: req.body.duration,
        date: req.body.date == "" ? new Date().toDateString() :
            new Date(req.body.date).toDateString()
    };

    res.json( newExercise );
    err ? done(err) : done(null, count);
});

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'});
});

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage;

  if (err.errors) {
    // mongoose validation error
    errCode = 400; // bad request
    const keys = Object.keys(err.errors);
    // report the first validation error
    errMessage = err.errors[keys[0]].message;
  } else {
    // generic or custom error
    errCode = err.status || 500;
    errMessage = err.message || 'Internal Server Error';
  }
  res.status(errCode).type('txt')
    .send(errMessage);
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
