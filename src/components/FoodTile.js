import React, {useState } from 'react';
import { Card, ListGroup, Button} from 'react-bootstrap';
import '../App.css';
import FoodDetailsModal from './FoodDetails';

function FoodTile(props){
    const { id, name, description, price, imagepath, availableaddons } = props;
    const [modalShow, setModalShow] = useState(false);

    return (
      <>
      <Card style={{ width: '18rem' }}> 
      <Card.Img variant="top" src={imagepath}/>
      <Card.Body>
        <Card.Title>{name}</Card.Title>
        <Card.Text>
          {description}
        </Card.Text>
      </Card.Body>
      <ListGroup className="list-group-flush">
        <ListGroup.Item className="fs-5">R${price.toFixed(2)}</ListGroup.Item>
      </ListGroup>
      <Card.Body>
        <Button className="fw-bold fs-5"
                variant="warning"
                onClick={() => setModalShow(true)}>Ver Detalhes</Button>
      </Card.Body>
    </Card>

      <FoodDetailsModal
        id={id}
        name={name}
        description={description}
        price={price}
        imagepath={imagepath}
        availableaddons={availableaddons}
        show={modalShow}
        onHide={() => setModalShow(false)}>
      </FoodDetailsModal>

    </>
    );

}

export default FoodTile;