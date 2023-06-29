import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

import { React, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout, DefaultLayout, LoginLayout, AddLayout, EditLayout, ModifyLayout } from './components/PageLayout';
import { Container, Toast } from 'react-bootstrap/';
import { Navigation } from './components/Navigation';

import MessageContext from './messageCtx';
import API from './API';


function App() {
  const [dirty, setDirty] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // This state is used for displaying a LoadingLayout while we are waiting an answer from the server.
  // è qui e non in MainLayout perchà altrimenti il loading avviene ogni volta che si modifica o aggiunge una pagina
  // ma in quel caso non ho bisogno del loading ma uso le righe colorate della tabella
  const [loading, setLoading] = useState(true);

  // This state contains the list of pages (it is initialized from a empty array).
  const [pages, setPages] = useState([]);

  // This states are used for authentication
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(undefined);

  // This state is used for displaying pages information and preview
  const [popUpPage, setPopUpPage] = useState(undefined);

  // This state is used for displaying the site name
  const [siteName, setSiteName] = useState('');

  // This state is used for displaying the front or back office
  const [front, setFront] = useState(true);

  useEffect(()=> {
    const checkAuth = async() => {
      try {
        // here you have the user info, if already logged in
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
      } catch(err) {
        // user not logged in
      }
    };
    checkAuth();
  }, []);

  function handleErrors(err) {
    console.log(err);
    let errMsg = 'Unkwnown error';
    if (err.errors)
      if (err.errors[0].msg)
        errMsg = err.errors[0].msg;
    else if (err.error)
      errMsg = err.error;
        
    setErrorMsg(errMsg);
    setDirty(true);
  }

  const loginSuccessful = (user) => {
    setUser(user);
    setLoggedIn(true);
    setDirty(true);
  }

  const doLogOut = () => {
    API.logOut()
      .then(() => {
        setUser(undefined);
        setLoggedIn(false);
        setFront(true);
        setDirty(true);
        setPopUpPage(undefined);   
      })
      .catch(err => handleErrors(err)); 
  }

  return (
    <BrowserRouter>
      <MessageContext.Provider value={{ handleErrors }}>
        <Container fluid className="App">
          <Navigation user={user} logout={doLogOut} siteName={siteName} setPopUpPage={setPopUpPage}/>
          <Routes>
            <Route path="/" element={ <DefaultLayout popUpPage={popUpPage} setPopUpPage={setPopUpPage} /> } >

              <Route index element={ <MainLayout front={front} setFront={setFront} pages={pages} setPages={setPages} dirty={dirty} setDirty={setDirty} 
                loading={loading} setLoading={setLoading} user={user} loggedIn={loggedIn} popUpPage={popUpPage} setPopUpPage={setPopUpPage}
                setSiteName={setSiteName} />} />

              <Route path="/add" element={ <AddLayout user={user} setPages={setPages} setDirty={setDirty} setPopUpPage={setPopUpPage} />} />

              <Route path="/edit/:pageId" element={ <EditLayout user={user} pages={pages} setPages={setPages} setDirty={setDirty} setPopUpPage={setPopUpPage} />} />

            </Route>

            <Route path="/modify-name" element={ <ModifyLayout setSiteName={setSiteName} setDirty={setDirty} /> }/>

            <Route path="/login" element={<LoginLayout loginSuccessful={loginSuccessful} />} />

          </Routes>

          <Toast show={errorMsg !== ''} onClose={() => setErrorMsg('')} delay={4000} autohide>
            <Toast.Body>{ errorMsg }</Toast.Body>
          </Toast>

        </Container>
      </MessageContext.Provider>
    </BrowserRouter>
  )
}

export default App