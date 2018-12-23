const crypto = require('crypto');

function getPass(pass) {
    return crypto.createHash('md5').update(pass).digest("hex");
};

function compare (pass, hash) {
    return crypto.createHash('md5').update(pass).digest("hex") === hash;
}

module.exports.getPass = getPass;
module.exports.compare = compare;