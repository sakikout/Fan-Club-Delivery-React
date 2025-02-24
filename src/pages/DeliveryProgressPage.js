import { useEffect, useState } from "react";
import { Container, Card, Button, ListGroup } from "react-bootstrap";
import { useCart } from '../components/context/CartProvider';
import { useUser } from "../components/context/UserProvider";
import FirestoreService from "../services/firestore";
import CustomNavBar from '../components/NavBar';
import Receipt from "../components/Receipt";

const firestoreService = new FirestoreService();

const DeliveryProgress = () => {
  const { user } = useUser();
  const { currentOrder } = useCart();
  const [ order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (user && currentOrder) {
        const userOrder = await firestoreService.getOrderById(currentOrder);
        if (userOrder) {
          setOrder(userOrder);
        }
      }
    };

    fetchOrder();
  }, [user, currentOrder]);

  return (
    <>
      <CustomNavBar />
      <Container>
        {order ? (
          <Receipt order={order}></Receipt>
        ) : " "}
      </Container>
    </>
  );
};

export default DeliveryProgress;
