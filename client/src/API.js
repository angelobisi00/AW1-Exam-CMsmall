import dayjs from 'dayjs';

const SERVER_URL = 'http://localhost:3001/api/';

/**
 * A utility function for parsing the HTTP response.
 */
function getJson(httpResponsePromise) {
  // server API always return JSON, in case of error the format is the following { error: <message> } 
  return new Promise((resolve, reject) => {
    httpResponsePromise
      .then((response) => {
        if (response.ok) {

          // the server always returns a JSON, even empty {}. Never null or non json, otherwise the method will fail
          response.json()
            .then(json => resolve(json))
            .catch(err => reject({ error: "Cannot parse server response" }))

        } else {
          // analyzing the cause of error
          response.json()
            .then(obj =>
              reject(obj)
            ) // error msg in the response body
            .catch(err => reject({ error: "Cannot parse server response" })) // something else
        }
      })
      .catch(err =>
        reject({ error: "Cannot communicate" })
      ) // connection error
  });
}


const getPages = async (mode) => {

  const url = mode == 'pubb' ? 'pubPages' : 'pages';

  return getJson(
    fetch(SERVER_URL + `${url}`, { credentials: 'include' })
  ).then( json => {
    return json.map((page) => {
      // console.log(page)
      const clientPages = {
        id: page.id,
        title: page.title,
        author: page.author,
        creationDate: dayjs(page.creationDate),
        content: page.content
      }

      if(page.pubblicationDate){
        clientPages.pubblicationDate = dayjs(page.pubblicationDate);
      }else{
        clientPages.pubblicationDate = undefined;
      }

      return clientPages;
    });
  }).catch(err => {throw err});
}

const getPage = async (id) => {
  return getJson(
    fetch(SERVER_URL + 'pages/' + id, { credentials: 'include' }))
    .then(page => {
      // console.log(page)
      const clientPage = {
        id: page.id,
        title: page.title,
        author: page.author,
        creationDate: dayjs(page.creationDate),
        content: page.content
      }
      if(page.pubblicationDate){
        clientPage.pubblicationDate = dayjs(page.pubblicationDate);
      }else{
        clientPage.pubblicationDate = undefined;
      }

      return page;
    }).catch(err => {throw err});
}

function addPage(page) {
  if(page.pubblicationDate == '')
    page.pubblicationDate = null;
  return getJson(
    fetch(SERVER_URL + 'pages', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(page),
    })
  ).catch(err => {throw err});
}

function updatePage(page) {
  if(page && page.creationDate && (page.creationDate instanceof dayjs))
    page.creationDate = page.creationDate.format('YYYY-MM-DD');
  if(page && page.pubblicationDate && (page.pubblicationDate instanceof dayjs))
    page.pubblicationDate = page.pubblicationDate.format('YYYY-MM-DD');

  if(page.pubblicationDate == '')
    page.pubblicationDate = null;

  return getJson(
    fetch(SERVER_URL + 'pages/' + page.id, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(page),
    })
  ).catch(err => {throw err});
}

function deletePage(pageId) {
  return getJson(
    fetch(SERVER_URL + 'pages/' + pageId, {
      method: 'DELETE',
      credentials: 'include',
    })
  ).catch(err => {throw err});
}

const getUsers = async () => {
  return getJson(
    fetch(SERVER_URL + 'users', { credentials: 'include' })
  ).then( json => {
    return json.map((user) => {
      const clientUsers = {
        id: user.id,
        email: user.email,
      }
      return clientUsers;
    })
  }).catch(err => {throw err});
}

const getSiteName = async () => {
  return getJson(
    fetch(SERVER_URL + 'get-name/', { credentials: 'include' }))
    .then(name => {
      return name;
    }).catch(err => {throw err});
}

async function modifyName(name){
  return getJson(
    fetch(SERVER_URL + 'modify-name/' + name, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    })
  ).catch(err => {throw err});
}

async function getImages() {
  return getJson(
    fetch(SERVER_URL + 'images', { credentials: 'include' })
  ).then( json => {
    return json.map((image) => {
      return image.value;
    })
  }).catch(err => {throw err});
};

async function getUserInfo() {
  return getJson(
    fetch(SERVER_URL + 'sessions/current', { credentials: 'include' })
  )
};

async function logIn(credentials) {
  // call  POST /api/sessions
  let response = await fetch(SERVER_URL + 'sessions/', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  // console.log(response.json());
  if (response.ok) {
    const user = await response.json();
    return user;
  } else {
    const errDetail = await response.json();
    throw errDetail.message;
  }
}

async function logOut() {
  // call  DELETE /api/sessions/current
  await fetch(SERVER_URL + 'sessions/current', {
    method: 'DELETE',
    credentials: 'include'
  });
}

const API = { getPages, getPage, addPage, updatePage, deletePage, getUsers, getSiteName, getImages, modifyName, getUserInfo, logIn, logOut };
export default API;