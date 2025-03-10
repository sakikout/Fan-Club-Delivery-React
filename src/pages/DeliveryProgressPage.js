import { useEffect, useState } from "react";
import { Tabs, Tab, Col, Row, Container, Card, Form, Image, InputGroup, Button } from "react-bootstrap";
import { useCart } from '../components/context/CartProvider';
import { useUser } from "../components/context/UserProvider";
import FirestoreService from "../services/firestore";
import CustomNavBar from '../components/NavBar';
import Receipt from "../components/Receipt";
import logo from "../assets/logo/fa_clube_logo.png"
import { IoMdSend } from "react-icons/io";

const firestoreService = new FirestoreService();

const DeliveryProgress = () => {
  const { user } = useUser();
  const { currentOrder } = useCart();
  const [ orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");


  useEffect(() => {
    const fetchOrder = async () => {
      if (user) {
        const userOrder = await firestoreService.getUserOrders();
        if (userOrder) {
          const activeOrders = userOrder.filter(order => order.status !== "Finalizado");
          setOrders(activeOrders);
        }
      }
    };
    fetchOrder();

    if (orders.length > 0) {
      const unsubscribe = firestoreService.getMessages(orders[0].id, (msgs) => {
        setMessages(msgs);
      });
  
      return () => unsubscribe();
    }

  }, [user, currentOrder, orders]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;
  
    await firestoreService.sendMessage(orders[0].id, newMessage, "user");
    setNewMessage(" "); 
  };

  return (
    <>
      <CustomNavBar />
      <Container className="gap-2 mt-3 mb-3">
      <p className="fw-bold fs-4">Pedidos Em Processamento</p>
        {orders.length > 0 ? (
          <Tabs 
            defaultActiveKey={orders[0]} 
            className="mb-2 fw-bold fs-5">
              {orders.map((order, index) => (
                <Tab 
                  eventKey={order.id} 
                  title={order.order.orderName} 
                  key={order.id}>
                  <Row>
                    { orders
                      .filter((orderCurrent) => orderCurrent.id === order.id)
                      .map((orderCurrent, indice) => (
                    <Col key={orderCurrent.id} md={3} className="mb-3">
                    <Receipt
                      key = {indice} 
                      id ={orderCurrent.id}></Receipt>

                    </Col>
                    ))}
                    <Card className="chat_card mt-4">
                      <Card.Header className="d-flex">
                        <Image src={logo} className="chat_logo" roundedCircle></Image>
                        <Row className="w-50 h-25 mt-2">
                          <div>
                          <Card.Title>Fã Clube Restaurante</Card.Title>
                          <Card.Subtitle className="mb-2 text-muted">Atendimento</Card.Subtitle>
                          </div>
                        </Row>
                    </Card.Header>
                    <Card.Body className="chat-body">
                    {messages.map((msg) => (
                      <div key={msg.id} className={msg.sender === "user" ? "message user" : "message restaurant"}>
                        <p>{msg.text}</p>
                      </div>
                    ))}
                    </Card.Body>
                    <Card.Footer>
                      <div className="mb-1 mt-1">
                    <Form.Group>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Digite aqui sua mensagem"
                        aria-describedby="messageInput"
                        onChange={(e) => setNewMessage(e.target.value)}
                      />
                    <Button variant="warning" id="messageInput" type="submit" onClick={() => handleSendMessage()}>
                    <IoMdSend />
                    </Button>
                    </InputGroup>
                    </Form.Group>
                    </div>
                    </Card.Footer>
                  </Card>
                  </Row>
                </Tab>
              ))}

          </Tabs>
        ) : <Col>
            <span className="fs-5">Nenhum pedido foi encontrado.</span>
            </Col>}
      </Container>
    </>
  );
};

export default DeliveryProgress;
