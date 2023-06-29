import { React, useContext, useState, useEffect } from 'react';
import { Row, Col, Button, Container, Form, Alert, Spinner } from 'react-bootstrap';
import { Link, useParams, useLocation, Outlet, useNavigate } from 'react-router-dom';
import PagesTable from './PagesTable';
import PageForm from './PageForm';
import MessageContext from '../messageCtx';
import PageInfo from './PageInfo';
import API from '../API';
import dayjs from 'dayjs';

function DefaultLayout(props) {
    
    const page = props.popUpPage;

    return (
      <Row className="vh-100">
        <Col md={2} xl={3} bg="light" className="below-nav" id="left-sidebar">
          {page ? 
            <PageInfo page={page} setPopUpPage={props.setPopUpPage}/> 
            : ''
          }
        </Col>
        <Col md={8} xl={9} className="below-nav">
          <Outlet/>
        </Col>
    </Row>
  );
}

function MainLayout(props) {
  
  const navigate = useNavigate();

  const { handleErrors } = useContext(MessageContext);

  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    // if((props.dirty) || (props.dirty && props.loggedIn) || (!props.loggedIn)){ // cosi cambia ogni volta che un utente si logga o si slogga
      // per non avere la lista completa nel client quando non siamo loggati
      if(props.dirty || !props.loggedIn || props.loggedIn){
      API.getSiteName()
        .then(name => props.setSiteName(name))
        .catch(err => handleErrors(err));

      const mode = props.loggedIn ? 'all' : 'pubb';

      API.getPages(mode)
        .then(pages => {
          props.setPages(pages);
          props.setDirty(false);
          props.setLoading(false);
      }).catch(err => handleErrors(err));

    }
  }, [props.dirty, props.loggedIn]);

  const deletePage = (id) => {

    // nel frattempo che avviene l'aggiunta e l'aggiornamento al server
    props.setPages((oldPages) => oldPages.map((p) => {
      if (p.id === id) {
        const pageTmp = Object.assign({}, p);
        pageTmp.status = 'deleted';
        pageTmp.creationDate = dayjs(p.creationDate);
        if(pageTmp.pubblicationDate != ''){
          pageTmp.pubblicationDate = dayjs(p.pubblicationDate);
        }else{
          pageTmp.pubblicationDate = undefined;
        }
        return pageTmp;
      } else {
        return p;
      }
    }));

    API.deletePage(id)
      .then(() => { props.setDirty(true); })
      .catch(err => { handleErrors(err); })
  }
  
  return (
    <>
    {props.loading ?
      <LoadingLayout />
      : 
      <>    
      {/* Button to go to back or front office */}
      {props.user && props.front ?
        <Link className="btn btn-secondary btn-xsmall fixed-left-bottom" onClick={() => {props.setFront(false); props.setPopUpPage(undefined)}} > Go to back </Link>
        : ''
      }
      {props.user && !props.front ?
        <Link className="btn btn-secondary btn-xsmall fixed-left-bottom" onClick={() => {props.setFront(true); props.setPopUpPage(undefined)}} > Go to front </Link>
        : ''
      }


      {/* Button to change site name */}
      {!props.front && props.user && props.user.amministratore ?
        <Button className='mx-2' variant='secondary' onClick={() => {navigate('/modify-name'); props.setPopUpPage(undefined)}}>Change site name</Button>
        : ''
      }

      {/* Tabella delle pagine */}
      <PagesTable front={props.front} pages={props.pages} user={props.user} users={props.users} loggedIn={props.loggedIn}
        setErrorMsg={(msg) => setErrorMsg(msg)} 
        deletePage={deletePage}
        popUpPage={props.popUpPage} setPopUpPage={(page) => props.setPopUpPage(page)} />

      {errorMsg ? <Alert variant='danger' dismissible onClick={()=>setErrorMsg('')}>{errorMsg}</Alert> : ''}
      
      {/* <Link className="btn btn-secondary btn-lg fixed-right-bottom" disabled onClick={() => setErrorMsg("Non sei loggato")}> &#43; </Link> */}
      {/* Add button */}
      {(props.front || props.user == undefined) ? 
        ''
        :
        <Link className="btn btn-primary btn-lg fixed-right-bottom" to="/add" state={{nextpage: location.pathname}}
          onClick={() => props.setPopUpPage(undefined)}> &#43; </Link>
      }
      </>
    }
    </>
  )
}

function LoginLayout(props) {
  const [username, setUsername] = useState('t1@test.it');
  const [password, setPassword] = useState('pass');
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  const doLogin = (credentials) => {
    API.logIn(credentials)
      .then(user => {
        // console.log(user)
        setErrorMsg('');
        props.loginSuccessful(user);
        navigate('/');
      })
      .catch(err => {
        setErrorMsg(err);
      })
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMsg('');
    const credentials = { username, password };

    let valid = true;
    if(username == '' || password == '')
      valid = false;

    if(valid){
      doLogin(credentials);
    }else{
      setErrorMsg('Invalid email or password');
    }
  };

  return (
    <Container>
      <Row>
        <Col xs={3}></Col>
        <Col xs={6} className="below-nav">
          <h2>Login</h2>
          <Form onSubmit={handleSubmit}>
            {errorMsg ? <Alert variant='danger' dismissible onClick={()=>setErrorMsg('')}>{errorMsg}</Alert> : ''}
            <Form.Group controlId='username'>
              <Form.Label>Email</Form.Label>
              <Form.Control type='email' value={username} onChange={ev => setUsername(ev.target.value)} />
            </Form.Group>
            <Form.Group controlId='password'>
              <Form.Label>Password</Form.Label>
              <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} />
            </Form.Group>
            <Button className='my-2' type='submit'>Login</Button>
            <Button className='my-2 mx-2' variant='danger' onClick={()=>navigate('/')}>Cancel</Button>
          </Form>
        </Col>
        <Col xs={3}></Col>
      </Row>
    </Container>
  )

}

function AddLayout(props) {
  
  const {handleErrors} = useContext(MessageContext);

  const addPage = (page) => {

    // nel frattempo che avviene l'aggiunta e l'aggiornamento al server
    const pageTmp = Object.assign({}, page);
    props.setPages((oldPages) => {
      pageTmp.status = 'added';
      pageTmp.creationDate = dayjs(pageTmp.creationDate);
      if(pageTmp.pubblicationDate != ''){
        pageTmp.pubblicationDate = dayjs(pageTmp.pubblicationDate);
      }else{
        pageTmp.pubblicationDate = undefined;
      }
      return [...oldPages, pageTmp];
    });

    API.addPage(page)
      .then(() => {
        props.setDirty(true);
        props.setPopUpPage(undefined);
      })
      .catch(e => handleErrors(e));
  }

  return (
    <PageForm user={props.user} addPage={addPage} setPopUpPage={props.setPopUpPage} />
  )
}

function EditLayout(props) {

  const setDirty = props.setDirty;
  const {handleErrors} = useContext(MessageContext);

  // stato che contiene l'id della pagina da modificare
  const { pageId } = useParams();
  // stato che contiene la pagina da modificare, richiesta al server tramite l'id
  const [ page, setPage ] = useState(null);

  useEffect(() => {
    API.getPage(pageId)
      .then(page => {
        setPage(page);
      })
      .catch(e => {
        handleErrors(e); 
      }); 
  }, [pageId]);

  const editPage = (page) => {

    // nel frattempo che avviene l'aggiunta e l'aggiornamento al server
    props.setPages((oldPages) => oldPages.map((p) => {
      if (p.id === page.id) {
        const pageTmp = Object.assign({}, p);
        pageTmp.status = 'updated';
        pageTmp.creationDate = dayjs(p.creationDate);
        if(pageTmp.pubblicationDate != ''){
          pageTmp.pubblicationDate = dayjs(p.pubblicationDate);
        }else{
          pageTmp.pubblicationDate = undefined;
        }
        return pageTmp;
      } else {
        return p;
      }
    }));

    API.updatePage(page)
      .then(() => {
        setDirty(true);
        props.setPopUpPage(undefined);
      })
      .catch(e => handleErrors(e)); 
  }

  return (
    page ? <PageForm user={props.user} page={page} editPage={editPage} setPopUpPage={props.setPopUpPage} /> : <><p>Pagina non presente</p></>
  );
}

function ModifyLayout(props) {

  const location = useLocation();
  const navigate = useNavigate();
  const nextpage = location.state?.nextpage || '/';

  // contiene temporanemente il nuovo nome del sito
  const [name, setName] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if(name != ''){
      API.modifyName(name)
        .then(() => {
          props.setDirty(true);
          navigate(nextpage);
        })
        .catch(err => {
          console.log(err);
        })
    }else{
      setErrorMsg('Invalid name');
    }
  }

  return (
    <Container>
      <Row>
        <Col xs={3}></Col>
        <Col xs={6} className="below-nav">
          {errorMsg? <Alert variant='danger' onClose={()=>setErrorMsg('')} dismissible>{errorMsg}</Alert> : false }
          <Form className="block-example" onSubmit={handleSubmit}>
            <Form.Group className="mb-3 border border-secondary rounded mb-0 form-padding">
              <Form.Group className="mb-3">
                <Form.Label>New site name</Form.Label>
                <Form.Control type="text" /*required={true}*/ onChange={event => setName(event.target.value)}/>
            </Form.Group>
          </Form.Group>

          <Button className="mb-3" variant="primary" type="submit">Save</Button>
            &nbsp;
          <Link className="btn btn-danger mb-3" to={nextpage}> Cancel </Link>
          </Form>
        </Col>
        <Col xs={3}></Col>
      </Row>
    </Container>
  )
}

/**
 * This layout shuld be rendered while we are waiting a response from the server.
 */
function LoadingLayout(props) {
    return (
      <Row className="vh-100">
        <Col md={4} bg="light" className="below-nav" id="left-sidebar">
        </Col>
        <Col md={8} className="below-nav">
        <Spinner className='m-2' animation="border" role="status" />
        </Col>
      </Row>
    )
}

export { MainLayout, DefaultLayout, LoginLayout, AddLayout, EditLayout, LoadingLayout, ModifyLayout };