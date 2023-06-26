import {React, useState} from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { Navbar, Nav, Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const Navigation = (props) => {
  const navigate = useNavigate();
 
  const name = props.user && props.user.username;

  const handleSubmit = (event) => {
    event.preventDefault();
  }

  return (
    <Navbar bg="primary" expand="sm" variant="dark" fixed="top" className="navbar-padding">

      <Link to="/" onClick={() => props.setPopUpPage(undefined)} >
        {/* Icon site */}
        <Navbar.Brand>
          <i className="bi bi-file-earmark-fill icon-size"/> {props.siteName}
        </Navbar.Brand>
      </Link>

      {/* {props.user && props.user.amministratore ?
      <Button className='mx-2' variant='secondary' onClick={()=> navigate('/')}>Change site name</Button>
      : ''
      } */}

      <Form className="my-2 my-lg-0 mx-auto d-sm-block" action="#" role="search" aria-label="Quick search" onSubmit={handleSubmit}>
        {/* <Form.Control className="mr-sm-2" type="search" placeholder="Search" aria-label="Search query" /> */}
      </Form>

      {/* Login e Logout */}
      <Nav className="ml-md-auto">
        <Nav.Item>
        { name? <>
          <Navbar.Text className='fs-5'>
            {"Signed in as: "+name}
          </Navbar.Text>
          <Button className='mx-2' variant='danger' onClick={() => {props.logout(); navigate('/')}}>Logout</Button>
          </> : 
          <Button className='mx-2' variant='warning' onClick={()=> navigate('/login')}>Login</Button> }
        </Nav.Item>
      </Nav>

    </Navbar>
  );
}

export { Navigation }; 