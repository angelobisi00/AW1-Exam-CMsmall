'use strict';

const db = require('./db');
const dayjs = require('dayjs');


exports.listPages = (mode) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM pages';
    db.all(sql, [], (err, rows) => {
      if(err) { reject(err);}
      
      if(rows == undefined) {
        reject({error: 'Database error'});
      }else{
        const pages = rows.map((e) => ({
          id: e.id,
          title: e.title,
          author: e.author,
          creationDate: e.creationDate,
          pubblicationDate: e.pubblicationDate,
          content: JSON.parse(e.content)
        }));

        if(mode == 'pubb'){
          const pages2 = pages.filter((e) => {
            if(dayjs(e.pubblicationDate)?.isBefore(dayjs()))
              return e;
          });
          resolve(pages2);
        }

        resolve(pages);
      }
      
    });
  });
};

exports.getPage = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM pages WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if(err) reject(err);

      if(row == undefined) {
        resolve({error: 'Page not found'});
      }else{
        const page = {
          id: row.id,
          title: row.title,
          author: row.author,
          creationDate: row.creationDate,
          pubblicationDate: row.pubblicationDate,
          content: JSON.parse(row.content)
        }
        resolve(page);
      }
    });
  });
}

exports.addPage = (page) => {
  if (page.pubblicationDate == "")
    page.pubblicationDate = null;

  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO pages (title, author, creationDate, pubblicationDate, content) VALUES(?, ?, ?, ?, ?)';
    db.run(sql, [page.title, page.author, page.creationDate, page.pubblicationDate, page.content], function (err) {
      if (err) {
        reject(err);
      }
      resolve(exports.getPage(this.lastID));
    });
  });
}

exports.updatePage = (pageId, page) => {
  if (page.pubblicationDate == "")
    page.pubblicationDate = null;

  return new Promise((resolve, reject) => {
    const sql = 'UPDATE pages SET title = ?, author = ?, creationDate = ?, pubblicationDate = ?, content = ? WHERE id = ?';
    db.run(sql, [page.title, page.author, page.creationDate, page.pubblicationDate, page.content, pageId], function (err) {
      if (err) {
        reject(err);
      }
      if(this.changes !== 1){
        resolve({ error: 'Page to modify not found.' });
      }else{
        resolve(exports.getPage(pageId));
      }
    });
  });
}

exports.deletePage = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM pages WHERE id = ?';
    db.run(sql, [id], function (err) {
      if (err) {
        reject(err);
      }else{
        resolve(null);
      }
    });
  });
}

exports.getSiteName = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT name FROM sitename';
    db.get(sql, (err, row) => {
      if(err) reject(err);

      if(row == undefined) {
        resolve({error: 'Site name not found'});
      }else{
        resolve(row.name);
      }
    });
  });
}

exports.modifyName = (name) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE sitename SET name = ? WHERE type = ? ';
    db.run(sql, [name, 'text'], function (err) {
      if (err) {
        reject(err);
      }
      
      if(this.changes !== 1){
        resolve({ error: 'Error in the db while change site name' });
      }else{
        resolve(name);
      }
    });
  });
}

exports.getImages = () => {
  return new Promise((resolve, reject) => {
    // resolve(['img1.jpeg', 'img2.jpeg', 'img3.jpeg', 'img4.jpeg']);
    const sql = 'SELECT value FROM images';
    db.all(sql, [], (err, rows) => {
      if(err) { reject(err);}
      
      if(rows == undefined) {
        reject({error: 'Database error'});
      }else{
        resolve(rows);
      }
    });
  });
}