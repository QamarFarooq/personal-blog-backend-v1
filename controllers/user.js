const { validationResult } = require('express-validator');
const jsonWebToken = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/user');
const Post = require('../models/post');
//const user = require('../models/user');

exports.signUpUser = (req, res, next) => {

    console.log("I am inside Sign Up User module");
    
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, data entered is incorrect.')
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    User.findOne().then(result => {
        //  the user does not exist
        if (!result) {
            bcrypt
                .hash(password, 12)
                .then(hashedPassword => {
                    const user = new User({
                        email: email,
                        password: hashedPassword,
                        name: name
                    });
                    return user.save();
                })
                // the 'result' param below is the 
                // return of the statement above 'return user.save()'
                .then(result => {
                    res.status(201).json({
                        message:"User was created successfully",
                        userId: result._id
                    });
                })
                .catch(err => {
                    if (!err.statusCode) {
                        err.statusCode = 500;
                    }
                    // you need to do next() otherwise error will not reach
                    // our middlewear in app.js file
                    next(err);
                })
        }
        // the user does exist
        else {
            res.status(200).json({
                message:"User already exists, cannot create a new user", userExists: true
            });
        }
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        // you need to do next() otherwise error will not reach
        // our middlewear in app.js file
        next(err);
    });
}

exports.signInUser = (req, res, next) => {

    console.log("I am inside User Sign In module");
    
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;

    User.findOne({email: email})
    .then(userObj => {
        if (!userObj) {
            console.log("I could not find this user");
            const error = new Error('Could not find User with this email')
            error.statusCode = 404;
            // if you throw an error inside a then block
            // than catch block will be reached and it will
            // be passed as an error to the catch block
            throw error;
        } 
        loadedUser = userObj;
        return bcrypt.compare(password, userObj.password);       
    })
    .then(isEqual => {
        if (!isEqual) {
            const error = new Error('Incorrect Password')
            error.statusCode = 401;
            throw error;
        }
        const token = jsonWebToken.sign({
            email: loadedUser.email,
            userId: loadedUser._id.toString()
        }, 'secretstringkey', { expiresIn: '500h' });
        res.status(200).json({message: 'Successfully authenticated', token: token, userId: loadedUser._id.toString()});
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        // you need to do next() otherwise error will not reach
        // our middlewear in app.js file
        next(err);
    })
};

exports.changeEmail = (req, res, next) => {

    console.log("I am inside Change Email module");
    
    const newEmail = req.body.email;

    User.findOne().then(user => {
        //if the user does not exist
        if (!user) {
            const error = new Error('Could not find User')
            error.statusCode = 404;
            // if you throw an error inside a then block
            // than catch block will be reached and it will
            // be passed as an error to the catch block
            throw error;
        }
        //set user email with new email extracted
        user.email = newEmail;
        user.save().then(res.status(200).json({message: 'User email was changed successfully to ' + newEmail, user: user}));
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        // you need to do next() otherwise error will not reach
        // our middlewear in app.js file
        next(err);
    })
};

exports.changeName = (req, res, next) => {

    console.log("I am inside Change User Name module");
    
    const newName = req.body.name;

    User.findOne().then(user => {
        //if the user does not exist
        if (!user) {
            const error = new Error('Could not find User')
            error.statusCode = 404;
            // if you throw an error inside a then block
            // than catch block will be reached and it will
            // be passed as an error to the catch block
            throw error;
        }
        //set user email with new email extracted
        user.name = newName;
        user.save().then(res.status(200).json({message: 'User name was changed successfully to ' + newName, user: user}));
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        // you need to do next() otherwise error will not reach
        // our middlewear in app.js file
        next(err);
    })
}

exports.changePassword = (req, res, next) => {

    console.log("I am inside Change Password module");
    
    const newPassword = req.body.password;

    User.findOne().then(user => {
        // if user does not exist
        if (!user) {
            const error = new Error('Could not find User')
            error.statusCode = 404;
            // if you throw an error inside a then block
            // than catch block will be reached and it will
            // be passed as an error to the catch block
            throw error;
        }
        else {
            bcrypt
                .hash(newPassword, 12)
                .then(hashedPassword => {
                    user.password = hashedPassword
                    user.save().then(res.status(200).json({message: 'User password was changed successfully to ' + newPassword, user: user}))
                })
        }
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        // you need to do next() otherwise error will not reach
        // our middlewear in app.js file
        next(err);
    })
};

exports.deleteUser = (req, res, next) => {
    
    console.log("I am inside Delete User module");
    //extracted userid from token
    userId = req.userId;

    console.log("userId is => ", userId);

    User.findByIdAndRemove(userId).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        // you need to do next() otherwise error will not reach
        // our middlewear in app.js file
        next(err);          
    });

    Post.deleteMany({creator: userId}).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        // you need to do next() otherwise error will not reach
        // our middlewear in app.js file
        next(err); 
    })

    console.log("I have reached the end and am about to send 410 response message");
    res.status(200).json({message: "Neo User and all posts created have been deleted succesfully!"});
}

exports.resetPassword = (req, res, next) => {
    res.status(200).json({
        posts: [{title: 'I am inside reset Password!'}]
    });
}

exports.userExists = (req, res, next) => {
    console.log("I am inside User Exists module");

    User.findOne().then(user => {
        // if user does not exist
        if (!user) {
            res.status(200).json({message: 'Neo user does not exist', userExists: false});
        }
        // user exists
        else {
            res.status(200).json({message: 'Neo user exists', userExists: true, userEmail: user.email, userName: user.name, userId: user._id, userPassword: user.password});
        }
    })
}