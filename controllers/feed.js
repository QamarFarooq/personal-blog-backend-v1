const Post = require('../models/post');
const mongodb = require('mongodb');

exports.getPost = (req, res, next) => {
    const currentPage = req.body.page || 1;
    const perPage = 3; //this value needs to be the same on the front-end
    let totalItems; 

    console.log("i am inside get ALL post");

    Post.find()
        .countDocuments()
        .then(count => {
            totalItems = count;
            return Post.find()
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
        })
        .then(posts => {
            res.status(200).json({ message: 'Fetched paginated posts successfully', posts: posts, totalCount: totalItems })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err);
        })
};

exports.getPostById = (req, res, next) => {
    const postId = req.body._id;

    console.log("i am inside get SPECIFIC post by _Id ");
    
    Post.find({_id: new mongodb.ObjectId(postId)}).then(post => {
        res.status(200).json({ message: 'Fetched single post by id successfully', post: post})
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err);
    })
};

exports.getTotalCountPost = (req, res, next) => {

    console.log("i am inside total post count");
    
    Post.countDocuments().then(count => {
        res.status(200).json({ message: 'successfully fetched total number of post', totalCount: count})
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err);
    })
}

