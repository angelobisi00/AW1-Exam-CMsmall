import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import {Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../API';

const PageForm = (props) => {

  const location = useLocation();
  const navigate = useNavigate();
  const nextpage = location.state?.nextpage || '/';

  const [errorMsg, setErrorMsg] = useState('');

  // stato che contiene tutti gli utenti in modo da permettere agli admin di cambiare l'autore della pagina
  const [users, setUsers] = useState([]);

  const [title, setTitle] = useState(props.page ? props.page.title : '');
  const [author, setAuthor] = useState(props.page ? props.page.author : props.user.id);
  const [creationDate, setCreationDate] = useState(props.page ? props.page.creationDate : dayjs().format('YYYY-MM-DD'));
  const [pubblicationDate, setPubblicationDate] = useState(props.page && props.page !== null && props.page.pubblicationDate !== null ? props.page.pubblicationDate : '');
  // lista dei content della pagina
  const [contentList, setContentList] = useState(props.page ? props.page.content : []);
  // tipo del nuovo content da aggiungere alla pagina
  const [newContent, setNewContent] = useState('');

  useEffect(() => {
    API.getUsers()
      .then(users => setUsers(users))
  }, []);

  useEffect(() => {
    const page = {
      "info": false,
      "title": title,
      "author": author,
      "creationDate": dayjs(creationDate),
      "pubblicationDate": dayjs(pubblicationDate),
      "content": [...contentList]
    };
    props.setPopUpPage(page);
  }, [contentList]);

  const handleSubmit = (event) => {
      event.preventDefault();
      const authorId = props.page ? props.page.author : props.user.id
      const page = {
        "title": title,
        "author": author,
        "creationDate": creationDate,
        "pubblicationDate": pubblicationDate,
        "content": [...contentList]
      };
      
      let valid = true;

      // controllo se tutti i campi sono compilati
      contentList.map((c) => {
        if(c.value == ''){
            valid = false;
        }
      });
      if(!valid){
        setErrorMsg('All the content must have a value');
        return;
      }

      // controllo se la pubblicationDate viene dopo la creationDate
      valid = false;
      if(pubblicationDate){
        if(dayjs(pubblicationDate).isAfter(dayjs(creationDate)) || dayjs(pubblicationDate).isSame(dayjs(creationDate))){
          valid = true;
        }
      }else{
        valid = true;
      }
      if(!valid){
        setErrorMsg('The pubblication date must be after the creation date');
        return;
      }

      // controllo se ci sono almeno un header e un altro blocco
      valid = false;
      let cont = 0;
      contentList.map((c) => {
        if(c.type == 'Header')
          valid = true;
        else
          cont++;
      });
      if(cont == 0)
        valid = false;
      if(!valid){
        setErrorMsg('The page must have at least one header and one other block');
        return;
      } 

      if(props.page){
          page.id = props.page.id;
          props.editPage(page);
      } else {
          props.addPage(page);
      }

      navigate('/');
  }

  const addContent = (type) => {
    let cont = 1;
    contentList.forEach((c) => {
      // if(c.type.includes(type))
        cont++;
    });

    setContentList((oldContent) => [...oldContent, {"type": type, "name": type.concat(cont), value: ''}]);
  }

  return (
    <>
    {errorMsg? <Alert variant='danger' onClose={()=>setErrorMsg('')} dismissible>{errorMsg}</Alert> : false }
    <Form className="block-example" onSubmit={handleSubmit}>
      <Form.Group className="mb-3 border border-secondary rounded mb-0 form-padding">
        {/* Title */}
        <Form.Group className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control type="text" required={true} value={title} onChange={event => setTitle(event.target.value)}/>
        </Form.Group>

        {/* Author */}
        <Form.Group className="mb-3">
          <Form.Label>Author</Form.Label>
          <Form.Select value={author} required={true} disabled={/*(props.page? false : true)||*/(props.user.amministratore != true)} onChange={event => setAuthor(event.target.value)} >
          {users.map((u, i) =>{
            return <option defaultValue={props.page ? u.email == author : u.email == author}
              /*selected={props.page ? u.id == author : u.id == author}*/
              key={i} value={u.id}>{u.email}</option>
          })}
        </Form.Select>
        </Form.Group>

        {/* Creation date */}
        <Form.Group className="mb-3">
          <Form.Label>Creation date</Form.Label>
          <Form.Control type="date" disabled={true} value={creationDate} onChange={event => setCreationDate(event.target.value) }/>
        </Form.Group>

        {/* Pubblication date */}
        <Form.Group className="mb-3">
          <Form.Label>Pubblication date</Form.Label>
          <Form.Control type="date" value={pubblicationDate} onChange={event => setPubblicationDate(event.target.value) }/>
        </Form.Group>
      </Form.Group>

      {/* Content */}
      <Form.Group className="mb-3">
        <Form.Label>Content</Form.Label>

        {contentList.map((c, i) =>
          <Form.Group className="mb-3 border border-secondary rounded mb-0 form-padding" key={i}>
            <ContentRow key={i} index={i} content={c} contentList={contentList} setContentList={setContentList} />
          </Form.Group>
        )}

        <br></br>
        <Form.Select onChange={event => setNewContent(event.target.value)} >
          <option value=''>Select content type</option>
          <option value='Header'>Header</option>
          <option value='Image'>Image</option>
          <option value='Paragraph'>Paragraph</option>
        </Form.Select>
  
        <Button variant="warning" disabled={newContent == ''} onClick={() => addContent(newContent) }>Add content</Button>
      </Form.Group>
  
    
      <Button className="mb-3" variant="primary" type="submit">Save</Button>
      &nbsp;
      <Link className="btn btn-danger mb-3" to={nextpage} onClick={() => props.setPopUpPage(undefined)}> Cancel </Link>
    </Form>
    </>
  )
}

function ContentRow(props){

  const index = props.index;

  const rimuoviContent = () => {
    props.setContentList((oldContent) => oldContent.filter((c) => c.name !== props.content.name));
  }

  const contentSu = () => {
    props.setContentList((oldContent) => {
      let data = [...oldContent];

      let temp = data[index-1];
      data[index-1] = data[index];
      data[index] = temp;

      return data;
    });
  }

  const contentGiu = () => {
    props.setContentList((oldContent) => {
      let data = [...oldContent];

      let temp = data[index+1];
      data[index+1] = data[index];
      data[index] = temp;

      return data;
    });
  }

  const contentChange = (value) => {
    props.setContentList((oldContent) => {
      let data = [...oldContent];
      data[index].value = value;
      return data;
    });
  }

  const render = () => {
    if(props.content.type === 'Image'){
      return (
        <ImageContent index={props.index} content={props.content} contentChange={contentChange} />
      )
    }else if(props.content.type === 'Header'){
      return (
        <Form.Control index={props.index} type="text" value={props.content.value} onChange={event => contentChange(event.target.value)} />
      )
    }else if(props.content.type === 'Paragraph'){
      return (
        <Form.Control index={props.index} as="textarea" rows={3} value={props.content.value} onChange={event => contentChange(event.target.value)} />
      )
    }
  }

  return (
    <>
      <Row><b>{props.content.name}</b></Row>
      <Row>
        <Col>
          {render()}
        </Col>
        <Col>
          <Button bssize="small" variant='danger' onClick={() => rimuoviContent()} >
            <i className="bi bi-trash"/>
          </Button>
          {index > 0 ?
            <Button bssize="xsmall" variant='secondary' onClick={() => contentSu()} >
              <i className="bi bi-arrow-up-circle"/>
            </Button>
            : <></>
          }
          {index !== props.contentList.length-1 ?
            <Button bssize="xs" variant='secondary' onClick={() => contentGiu()} >
              <i className="bi bi-arrow-down-circle"/>
            </Button>
            : <></>
          }
        </Col>
      </Row>
      <br></br>
    </>
  )
}

function ImageContent(props){

  const [images, setImages] = useState([]);
  const [dirty, setDirty] = useState(true);

  useEffect(() => {
    if(dirty){
      API.getImages()
        .then((values) => {
          setImages(values);
          setDirty(false);
        });
      
    }
  }, [dirty]);

  const findImageName = (id) => {
    // questa funzione perchè ho dovuto cambiare il formato dell'id, perche se si inserivano due blocchi image andavano in conflitto
    // ho aggiunto l'indice all'id in modo da differenziare due blocchi, ma devo levare l'indice per trovare il nome dell'immagine
    let tmp = id.split('-');
    props.contentChange(tmp[1]);
  }

  return (
  <>
    <Row>
    {images.map((image, i) =>
      <Col key={i} md={3}>
        <Form.Check key={i} className='image-checkbox' type='radio' id={`${props.index}-${image}`} name={`${props.index}-image`} defaultChecked={props.content.value == image}
          label={<img src={`http://localhost:3001/${image}`} className='img-fluid' />} onClick={(e) => findImageName(e.target.id)} />
      </Col>
    )}
    </Row>
    </>
  )
}

export default PageForm;