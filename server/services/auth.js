const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config");

module.exports = {
  async encryptPassword(password) {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          reject(err);
        } else {
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) {
              reject(err);
            } else {
              resolve(hash);
            }
          });
        }
      });
    });
  },

  async matchPassword({ password, hashedPassword }) {
    const result = await bcrypt.compare(password, hashedPassword);
    return result;
  },

  async createJWT({ userId, roleId }) {
    return new Promise((resolve, reject) => {
      jwt.sign(
        {
          userId,
          roleId
        },
        config.jwtSecret,
        { expiresIn: 60000000000000000 * 600000000000 },
        (err, token) => {
          if (err) {
            reject({ success: false });
          } else {
            resolve({ success: true, token });
          }
        }
      );
    });
  }
};
