import React from "react";
import { Container, Card, Button, ListGroup } from "react-bootstrap";
import CustomNavBar from '../components/NavBar';

const Receipt = (order) => {
  return (
    <>
      <CustomNavBar />
      <Container className="mt-4">
        {order ? (
          <Card className="text-center">
            <Card.Header className="fw-bold">Pedido #{order.id}</Card.Header>

            <Card.Body>
              <Card.Title className="mb-3">Resumo do Pedido</Card.Title>
              <ListGroup variant="flush">
                {order.items.map((item, index) => (
                  <ListGroup.Item key={index}>
                    <strong>{item.quantity}x {item.name}</strong> - R$ {(item.price * item.quantity)}
                    {item.availableAddons && item.availableAddons.length > 0 && (
                      <ul className="mt-1" style={{ fontSize: "0.9rem", color: "gray" }}>
                        {item.availableAddons.map((addon, i) => (
                          <li key={i}>{addon.quantity}x {addon.name} (+ R$ {(addon.price * addon.quantity)})</li>
                        ))}
                      </ul>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>

              <h5 className="mt-3">Total: R$ {order.totalAmount}</h5>
              <p className="mb-1">Pagamento: {order.paymentMethod}</p>
              {order.paymentMethod === "Dinheiro" && <p>Troco para: R$ {order.cashChange}</p>}

              <p className="text-muted">Tempo estimado de entrega: {order.deliveryTime} min</p>
              <Button variant="warning">Acompanhar entrega</Button>
            </Card.Body>

            <Card.Footer className="text-muted">Status: {order.status}</Card.Footer>
          </Card>
        ) : (
          <p className="text-center">Não encontrado...</p>
        )}
      </Container>
    </>
  );
};

export default Receipt;
