import React from 'react';
import { Card } from 'react-bootstrap';
import '../App.css';

function OrderTile(props){
    const { id, status, data, order } = props;

    return (
    <>
    <Card>
    <Card.Header>{data}</Card.Header>
      <Card.Body>
        <Card.Title>Pedido: #{id}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">{status}</Card.Subtitle>
        <Card.Text>
        { order }
        </Card.Text>
      </Card.Body>
    </Card>
    </>
    );

}

export default OrderTile;