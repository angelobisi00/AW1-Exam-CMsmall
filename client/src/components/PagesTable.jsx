import { Alert } from 'bootstrap';
import dayjs from 'dayjs';

import { Table, Form, Button } from 'react-bootstrap/'
import { Link, useLocation } from 'react-router-dom';

function PagesTable(props) {

  const userId = props.user && props.user.id;
  const admin = props.user && props.user.amministratore;
  // console.log(userId + " " + admin)
  const allPages = props.pages;
  const filetredPages = [...allPages];
  const sortedPages = filetredPages.filter(a => {
    // allow all pages if admin and back office
    if(!props.front && admin)
      return a;

    // allow only pubblished pages and pages created by the user
    if((!props.front && userId) || a.pubblicationDate?.isBefore(dayjs()))
      return a;
  });
  sortedPages.sort((a, b) => {
    if(a.pubblicationDate && b.pubblicationDate)
      return a.pubblicationDate.format('YYYYMMDD') - b.pubblicationDate.format('YYYYMMDD');
    else if(a.pubblicationDate)
      return -1;
    else if(b.pubblicationDate)
      return 1;
  });
  

  return (
    <Table striped>
      <thead>
        <tr>
          <th><p>Actions</p></th>
          <th><p>Title</p></th>
          <th><p>Author</p></th>
          <th><p>Creation date</p></th>
          <th><p>Pubblication date</p></th>
          <th><p>Content</p></th>
          <th><p>State</p></th>
        </tr>
      </thead>
      <tbody>
        {sortedPages.map((page , i) => 
          <PageRow key={i} front={props.front} page={page} admin={admin} users={props.users} userId={userId} setErrorMsg={(msg) => props.setErrorMsg(msg)}
            deletePage={props.deletePage} popUpPage={props.popUpPage} setPopUpPage={(page) => props.setPopUpPage(page)} />
        )}
      </tbody>  
    </Table>
  )
}

function PageRow(props) {

  let statusClass = null;

  // console.log(props.page.status)

  if(props.page.status !== undefined)
    switch(props.page.status) {
      case 'added':
        statusClass = 'table-success';
        break;
      case 'deleted':
        statusClass = 'table-danger';
        break;
      case 'updated':
        statusClass = 'table-warning';
        break;
      default:
        break;
    }

  const formatWatchDate = (dayJsDate, format) => {
    return dayJsDate ? dayJsDate.format(format) : '';
  }

  const location = useLocation();

  return (
    <>
    <tr className={statusClass} >
      {/*Edit and Delte button*/}
      <td>
        {props.front ?
          '' :
          ((props.admin !== true && props.page.author !== props.userId)) ?
            <Link className="btn disabled btn-primary" to={"/edit/" + props.page.id} state={{nextpage: location.pathname}} onClick={() => setErrorMsg("Non sei loggato")}>
              <i className="bi bi-pencil-square"/>
            </Link>
            :
            <Link className="btn btn-primary" to={"/edit/" + props.page.id} state={{nextpage: location.pathname}} onClick={() => {props.setPopUpPage(undefined)}} >
              <i className="bi bi-pencil-square"/>
            </Link>
        }

        &nbsp;
        {props.front ?
          '' :
          <Button variant='danger' onClick={() => {props.deletePage(props.page.id); props.setPopUpPage(undefined)}} disabled={!props.admin && (props.page.author !== props.userId)} >
            <i className="bi bi-trash"/>
          </Button>
        }
        &nbsp;

        <Button variant='primary' onClick={() => {props.setPopUpPage(props.page)}} disabled={props.popUpPage !== undefined} >
          <i className="bi bi-eye"/>
        </Button>
      </td>
      
      {/*Title*/}
      <td>
        <p>{props.page.title}</p>
      </td>

      {/*Author*/}
      <td>
        <p>{props.users.find(user => user.id === props.page.author)?.email}</p>
      </td>
      
      {/*Creation date*/}
      <td>
        <p>{formatWatchDate(props.page.creationDate, 'MMMM D, YYYY')}</p>
      </td>

      {/*Pubblication date*/}
      <td>
        <p>{formatWatchDate(props.page.pubblicationDate, 'MMMM D, YYYY')}</p>
      </td>

      {/* Content */}
      <td>
        {props.page.content.map((content, index) =>
          <ContentRow key={index} index={index} content={content} />
        )}
      </td>

      {/*State*/}
      <td>
        <>
        {props.page.pubblicationDate ?
          <>
          {props.page.pubblicationDate.isBefore(dayjs()) ?
            <p>Published</p>
            :
            <p>Scheduled</p>
          }
          </>
          :
          <p>Draft</p>
        }
        </>
      </td>
    </tr>
    </>
  )
}

function ContentRow(props) {
  return (
    <>
      <p>{(props.index+1) + '. ' + props.content.type}</p>
    </>
  )
}

export default PagesTable;