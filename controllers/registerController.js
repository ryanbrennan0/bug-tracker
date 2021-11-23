const dbAPI = require('../database');

// get request, render the register page
const get_register = (req, res) => {
    res.render('register');
}

// post request, receive user info, and add to db
const post_register = (req, res) => {
    var password = req.body.password;
    var username = req.body.username;

    dbAPI.registerUser(username, password, res, con);
}

// export the functions
module.exports = {
    get_register,
    post_register
}