const jwt = require('jsonwebtoken');
const jwtKey = "my_secret_key";
const jwtExpirySeconds = 300;

// create & return the JWT token, with supplied payload, and store it in user's cookies
const create = (payload, res) => {
    var token = jwt.sign({ id: payload }, jwtKey, {
        algorithm: "HS256",
        expiresIn: jwtExpirySeconds,
    })
    res.cookie("token", token, {maxAge: jwtExpirySeconds * 1000 })
};

// return the payload within the JWT
const getPayload = (req, callback) => {
    var token = req.cookies.token;
    jwt.verify(token, jwtKey, function(err, decoded) {
        if (err) throw err; 
        var user_id = decoded.id;
        callback(user_id);
    });
}

module.exports.create = create;
module.exports.getPayload = getPayload;