const crypto = require('crypto');

// generate random salt of length 'length'
const generateSalt = (length) => {
    return crypto.randomBytes(Math.ceil(length/2)).toString('hex').slice(0, length);
};

// hash the password appended w/ salt using sha256 algorithm
const hash = (password, salt) => {
    password = password + salt;
    var hash = crypto.createHash('sha256');
    hash.update(password);
    return hash.digest('hex');
};

// export functions
module.exports.generateSalt = generateSalt;
module.exports.hash = hash;