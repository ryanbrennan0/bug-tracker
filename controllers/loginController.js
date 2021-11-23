const dbAPI = require('../database');

// get request, return login page
const get_login = (req, res) => {
    res.render('login');
}

// post request, receives login info, and queries db
const post_login = (req, res) => {
    var password = req.body.password;
    var username = req.body.username;
    var con = req.app.get('con');

    dbAPI.login(username, password, res, con);
}

module.exports = {
    post_login,
    get_login
}