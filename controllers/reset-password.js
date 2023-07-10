exports.resetPassword = (req, res, next) => {
    res.status(200).json({
        posts: [{title: 'I am inside passwordresetpassword'}]
    });
};