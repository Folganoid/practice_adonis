const crypto = require('crypto');

// generate pass
function getPass(pass) {
    return crypto.createHash('md5').update(pass).digest("hex");
}

// compare pass
function compare (pass, hash) {
    return crypto.createHash('md5').update(pass).digest("hex") === hash;
}

// generate token
function generateToken(length){
    //allowed characters
    var a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");
    var b = [];
    for (let i=0; i<length; i++) {
        let j = (Math.random() * (a.length-1)).toFixed(0);
        b[i] = a[j];
    }
    return b.join("");
}

module.exports.getPass = getPass;
module.exports.compare = compare;
module.exports.generateToken = generateToken;
