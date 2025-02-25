import React, { useEffect, useState } from "react";
import { Container, Card, Button, ListGroup } from "react-bootstrap";
import CustomNavBar from '../components/NavBar';
import FirestoreService from "../services/firestore";
import { useUser } from "../components/context/UserProvider";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const firestoreService = new FirestoreService();

const Receipt = (props) => {
  const { id } = props;
  const { user, userData } = useUser();
  const [ orderInfo, setOrderInfo ] = useState({});

    useEffect(() => {
      const fetchOrders = async () => {
        if (user) {
          const userOrder = await firestoreService.getOrderById(id);
          console.log(userOrder);
          setOrderInfo(userOrder);
        }
      };
  
      fetchOrders();
  
      console.log(orderInfo);
  
    }, []);

    const formatDate = (isoString) => {
        return format(new Date(isoString), "dd/MM/yyyy - HH:mm", { locale: ptBR });
    };
  return (
    <>
      <CustomNavBar />
      <Container className="mt-4">
        {orderInfo ? (
          <Card className="text-center">
            <Card.Header className="fw-bold">Pedido #{orderInfo.orderName}</Card.Header>

            <Card.Body>
              { orderInfo.order ?
                ( <>
              <ListGroup variant="flush">
  
                {orderInfo.order.items.map((item, index) => (
                  <ListGroup.Item key={index}>
                    <strong>{item.quantity}x {item.name}</strong> - R$ {(item.price * item.quantity)}
                    {item.availableAddons && item.availableAddons.length > 0 && (
                      <ul className="mt-1 list-unstyled" style={{ fontSize: "0.9rem", color: "gray" }}>
                        {item.availableAddons.map((addon, i) => (
                          <li key={i}>{addon.name} (+ R$ {(addon.price)})</li>
                        ))}
                      </ul>
                    )}
                  </ListGroup.Item>
                ))}
                
              </ListGroup>

              <p className="mb-1">Endereço: {orderInfo.order.address} </p>
              <p className="mb-1">Forma de Pagamento: {orderInfo.order.paymentMethod}</p>
              {orderInfo.order.paymentMethod === "Dinheiro" && <p>Troco para: R$ {orderInfo.order.changeFor}</p>}
              <h5 className="mt-3">Total: R$ {orderInfo.order.total.toFixed(2)}</h5>
              <p className="text-muted">Entrega estimada para: {formatDate(orderInfo.estimatedDeliveryTime)} min</p>
              
              </>
              )
              : " "}
            </Card.Body>

            <Card.Footer className="text-muted">Status: <span className="fw-bold">{orderInfo.status}</span></Card.Footer>
          </Card>
        ) : (
          <p className="text-center">Não encontrado...</p>
        )}
      </Container>
    </>
  );
};

export default Receipt;
