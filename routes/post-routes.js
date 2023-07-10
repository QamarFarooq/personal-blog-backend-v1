const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const isAuth = require('../middleware/is-auth');

const userController = require('../controllers/user');

const feedController = require('../controllers/feed');

const postController = require('../controllers/post');

const resetPasswordController = require('../controllers/reset-password');

// get list of all post
// example of url localhost:3000/?page=2
router.post('/', feedController.getPost);

// // confirm if user exists or not
// router.get('/get-user-details', userController.userExists);

// find specific post by id of post
router.post('/get-post-by-id', feedController.getPostById);

// get total count of post
router.get('/total-post-count', feedController.getTotalCountPost);

// creating a post 
router.post('/create-post', [
    body('title').trim().isLength({min: 5}),
    body('content').trim().isLength({min: 5})
], isAuth, postController.createPost);

// editing a post 
// exampe of url localhost:3000/edit-post/614362f38f1dde4020a063bb
router.put('/edit-post', [
    body('title').trim().isLength({min: 5}),
    body('content').trim().isLength({min: 5})
], isAuth, postController.editPost);

// deleting a post 
router.delete('/delete-post/:postId', isAuth, postController.deletePost);







module.exports = router;