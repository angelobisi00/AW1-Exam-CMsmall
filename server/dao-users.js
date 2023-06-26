'use strict';

const db = require('./db');
const crypto = require('crypto');


exports.getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE id = ?';
      db.get(sql, [id], (err, row) => {
        if (err) 
          reject(err);
        else if (row === undefined)
          resolve({error: 'User not found.'});
        else {
          // by default, the local strategy looks for "username": not to create confusion in server.js, we can create an object with that property
          const user = {id: row.id, username: row.email, name: row.name, admin: row.amministratore};
          resolve(user);
        }
    });
  });
};

exports.getUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.get(sql, [email], (err, row) => {
      if (err) { reject(err); }
      else if (row === undefined) { resolve(false); }
      else {
        const user = {id: row.id, username: row.email, name: row.name, amministratore: row.amministratore === 1 ? true : false};
        // console.log(user);
        const salt = row.salt;
        crypto.scrypt(password, salt, 64, (err, hashedPassword) => {
          if (err) reject(err);
  
          const passwordHex = Buffer.from(row.hash, 'hex');
  
          if(!crypto.timingSafeEqual(passwordHex, hashedPassword))
             resolve(false);
          else resolve(user); 
        });
      }
    });
  });
};

exports.getUsers = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users';
    db.all(sql, [], (err, rows) => {
      if (err) { reject(err); }

      if(rows == undefined) {
        reject({error: 'Database error'});
      }else{
        const users = rows.map((e) => ({
          id: e.id,
          email: e.email,
        }));

        resolve(users);
      }
    });
  });
};