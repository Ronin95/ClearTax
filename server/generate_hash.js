// server/generate-hash.js
const bcrypt = require('bcryptjs');

const password = '1234567890';
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log('Your password hash is:');
console.log(hash);