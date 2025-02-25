import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from "../components/context/UserProvider"
import FirestoreService from "../services/firestore"
import { Container, Row, Col } from 'react-bootstrap';
import OrderTile from '../components/OrderTile';
import CustomNavBar from '../components/NavBar';


const firestoreService = new FirestoreService();

const DeliveryHistory = () => {
  const [ orders, setOrders ] = useState([]);

  useEffect(() => {
      getOrders();

    }, []);

  const getOrders = async () => {
    try {
        const orders_db = await firestoreService.getUserOrders();
        setOrders(orders_db);
        console.log(orders_db);

      } catch (error) {
            console.error("Erro ao buscar pedidos do usuário:", error);
      }

  }

    return (
      <>
      <CustomNavBar></CustomNavBar>
      <Container className="gap-2 mt-3 mb-3">
        <p className="fw-bold fs-4">Histórico de Pedidos</p>
        <Row xs={1} md={2} className="g-4">
        { orders.length === 0 ?
            <Col>
              <span className="fs-5">Nenhum pedido foi encontrado.</span>
            </Col>
            : orders.map((order) => (
              <Col key ={order.id}>
                <OrderTile
                  orderName={order.order.orderName}
                  id={order.id}
                  data={order.data}
                  status={order.status}>
                </OrderTile>
              </Col>
                ))
          }
        </Row>
      </Container>
      </>
    );
  };
  
  export default DeliveryHistory;