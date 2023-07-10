const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        dafult: 'I am new here!'
    },
    posts: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Post'
        }
    ]
});

userSchema.pre('findByIdAndRemove', function(next) {
    console.log("hey i am inside userschema pre middlewear")
    next();
})

module.exports = mongoose.model('User', userSchema);

