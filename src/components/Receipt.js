import React, { useEffect, useState } from "react";
import { Container, Card, Button, ListGroup } from "react-bootstrap";
import CustomNavBar from '../components/NavBar';
import FirestoreService from "../services/firestore";
import { useUser } from "../components/context/UserProvider";

const firestoreService = new FirestoreService();

const Receipt = (order) => {
  const { user, userData } = useUser();
  const [ orderInfo, setOrderInfo ] = useState({});

    useEffect(() => {
      const fetchOrders = async () => {
        if (user) {
          const userOrder = await firestoreService.getOrderById(order);
          console.log(userOrder);
          setOrderInfo(userOrder);
        }
      };
  
      fetchOrders();
  
      console.log(orderInfo);
  
    }, []);

  return (
    <>
      <CustomNavBar />
      <Container className="mt-4">
        {orderInfo ? (
          <Card className="text-center">
            <Card.Header className="fw-bold">Pedido #{orderInfo.id}</Card.Header>

            <Card.Body>
              <Card.Title className="mb-3">Resumo do Pedido</Card.Title>
              <ListGroup variant="flush">
                {orderInfo.order.items.map((item, index) => (
                  <ListGroup.Item key={index}>
                    <strong>{item.quantity}x {item.name}</strong> - R$ {(item.price * item.quantity)}
                    {item.availableAddons && item.availableAddons.length > 0 && (
                      <ul className="mt-1" style={{ fontSize: "0.9rem", color: "gray" }}>
                        {item.availableAddons.map((addon, i) => (
                          <li key={i}>{addon.name} (+ R$ {(addon.price)})</li>
                        ))}
                      </ul>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>

              <h5 className="mt-3">Total: R$ {orderInfo.order.total}</h5>
              <p className="mb-1">Pagamento: {orderInfo.order.paymentMethod}</p>
              {orderInfo.order.paymentMethod === "Dinheiro" && <p>Troco para: R$ {orderInfo.order.changeFor}</p>}

              <p className="text-muted">Entrega estimada para: {orderInfo.estimatedDeliveryTime} min</p>
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
