import dayjs from 'dayjs';
import { Form, Button, Row, Col } from 'react-bootstrap';

function PageInfo(props) {

  const page = props.page;

  return (
    <>
    <Form className="block-example">
      {page.info == false ? // le info non vengono visualizzate durante la modifica o l'aggiunta della pagina, ma solo la preview
        ''
        :
        <Form.Group className="mb-3 border border-secondary rounded mb-0 form-padding">

          <Row>
            <Col></Col>
            <Col></Col>
            <Col></Col>
            <Col></Col>
            <Col >
              <Button variant='danger' onClick={() => {props.setPopUpPage(undefined)}} >
                <i className="bi bi-x-lg"/>
              </Button>
            </Col>
          </Row>

          <Row>
            {/* Title */}
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" disabled defaultValue={page.title} />
            </Form.Group>

            {/* Author */}
            <Form.Group className="mb-3">
              <Form.Label>Author</Form.Label>
              <Form.Control type="text" disabled defaultValue={props.users.find(user => user.id === props.page.author)?.email} />
            </Form.Group>

            {/* Creation date */}
            <Form.Group className="mb-3">
              <Form.Label>Creation date</Form.Label>
              <Form.Control type="text" disabled defaultValue={page.creationDate.format('DD/MM/YYYY')} />
            </Form.Group>

            {/* Pubblication date */}
            <Form.Group className="mb-3">
              <Form.Label>Pubblication date</Form.Label>
              <Form.Control type="text" disabled defaultValue={page.pubblicationDate?.format('DD/MM/YYYY')} />
            </Form.Group>
          </Row>
          
        </Form.Group>
      }

      <Form.Group className="mb-3">
        <Form.Label>Page View</Form.Label>
          <Form.Group className="mb-3 border border-secondary rounded mb-0 form-padding">
            {page.content.map((c, i) =>
              <ContentRow key={i} content={c} />
            )}
          </Form.Group>
      </Form.Group>

    </Form>
    </>
  )
}

function ContentRow(props){

  return (
    <>
      {/* <Row><b>{content.type}</b></Row> */}
      <Row>
        <Col>
        {props.content.type === 'Image' && props.content.value ?
          <img src={`http://localhost:3001/${props.content.value}`} className='img-fluid' />
          :
          props.content.type === 'Header' ?
            <h1>{props.content.value}</h1>
            :
            <p>{props.content.value}</p>
        }
        </Col>
      </Row>
      <br></br>
    </>
  )
}

export default PageInfo;