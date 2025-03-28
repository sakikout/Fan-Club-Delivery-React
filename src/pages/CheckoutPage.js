import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, ListGroup, Row, Col, FloatingLabel, Form, Button, InputGroup, Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import FirestoreService from "../services/firestore";
import { QRCodeCanvas } from "qrcode.react";
import { FaRegCopy } from "react-icons/fa";
import { useCart } from '../components/context/CartProvider';
import { useUser } from "../components/context/UserProvider";
import CustomNavBar from '../components/NavBar';
import CreditCardComponent from '../components/CreditCard';

const firestoreService = new FirestoreService();

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, userData } = useUser();
  const { payment, setPayment, setCurrentOrder, feePrice, prepTime, deliveryTime, cart, clearCart } = useCart();
  const [ paymentMethod, setPaymentMethod ] = useState("");
  const [ troco, setTroco ] = useState("");
  const [ qrValue, setQrValue ] = useState("");
  const [ subtotal, setSubtotal ] = useState(0.0);
  const [ region, setUserRegion ] = useState("");
  const [ show, setShow ] = useState(false);
  const target = useRef(null);

  
  useEffect(() => {
    async function fetchRegion() {
      try {
          const regions_db = await firestoreService.getRegionsFromDatabase();
          if (userData?.regionId) {
              const user_region = regions_db.find(region => String(region.id) === userData.regionId);
              if (user_region) {
                  setUserRegion(user_region.name);
              } else {
                  console.warn("Região do usuário não encontrada.");
              }
          }
      } catch (error) {
          console.alert("Erro ao carregar regiões: " + error.message);
      }
  }

    const subtotal = cart.reduce((total, item) => {
      const itemTotal = item.price * item.quantity;
      
      const addonsTotal = item.addons
        ? item.addons.reduce((sum, addon) => sum + addon.price, 0) * item.quantity
        : 0;
  
      return total + itemTotal + addonsTotal;
    }, 0);

    fetchRegion();
    setSubtotal(subtotal + parseFloat(feePrice || 0));

    // console.log(payment);
    // console.log(paymentMethod);

  }, [cart, feePrice, payment, paymentMethod, userData.regionId]);

  const validateChange = (change) => {

    const moneyRegex  = /^\d+\.\d{2}$/;
    if (!moneyRegex.test(change)) {
      alert("Insira um valor válido.");
      return false;
    }

    setPayment("Dinheiro");
  }
  

  const createReceipt = async () => {
    try {
      if (cart) {
        if (cart.length === 0){
          alert("Seu carrinho está vazio!");
          return;
        }
      } else {
        alert("Nenhum item encontrado no carrinho.");
      }
  
      const subtotal = cart.reduce((total, item) => {
        const itemTotal = item.price * item.quantity;
        
        const addonsTotal = item.addons
          ? item.addons.reduce((sum, addon) => sum + addon.price, 0) * item.quantity
          : 0;
    
        return total + itemTotal + addonsTotal;
      }, 0);

      const total = subtotal + parseFloat(feePrice || 0);
      const address = userData.address;
      const complement = userData?.complement;
      const orderName = cart.map(item => item.name).join(" + ");

  
      const orderData = {
        orderName: orderName,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          imagePath: item.imagepath,
          quantity: item.quantity,
          price: item.price,
          availableAddons: item.addons ? item.addons.map(addon => ({
            name: addon.name,
            price: addon.price,
          })) : [],
        })),
        subtotal,
        feePrice,
        total,
        paymentMethod: payment,
        deliveryTime,
        address,
        region,
        complement
      };
  
      if (paymentMethod === "Dinheiro") {
        orderData.changeFor = troco;
      }
  
      const orderRef = await firestoreService.saveOrderToDatabase(orderData, prepTime, deliveryTime);
      console.log("Pedido salvo com ID:", orderRef.id);
      setCurrentOrder(orderRef.id);
  
      alert("Pedido realizado com sucesso!");
      clearCart();
      
      const first_message = `Olá, ${userData.displayName}! Nós recebemos o seu pedido e iremos te atualizar por meio desta conversa!`;
      await firestoreService.sendMessage(orderRef.id, first_message, "restaurant");
      navigate("/progress",  { replace: false });

    } catch (error) {
      console.error("Erro ao salvar o pedido:", error);
      alert("Erro ao processar o pedido. Tente novamente.");
    }
  };


  const generateRandomPix = () => {
    const randomPixCode = `00020126480014BR.GOV.BCB.PIX0114+5581999999995204000053039865802BR5913FAN CLUB6009MINAS GERAIS62140510${Math.floor(Math.random() * 10000000000)}`;
    setQrValue(randomPixCode);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(qrValue);
    setShow(!show);
  };

    return (
      <>
      <CustomNavBar></CustomNavBar>
      <Container>
        <Col className="gap-2 mt-3 mb-3"> 
        <h2 className="fw-bold">Checkout</h2>
        <Container className="mt-3 mb-3">
          <Card className="text-center">
            <Card.Header className="fw-bold">Pedido</Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {cart.map((item, index) => (
                  <ListGroup.Item key={index}>
                    <strong>{item.quantity} x {item.name}</strong> - R$ {(item.price * item.quantity)}
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

              <p className="mb-1">Endereço: {userData.address} { userData.complement ? <> - Complemento {userData?.complement} </>: " "} - {region}</p>
              <h5 className="mt-3">Total: R${subtotal}</h5>
            
            </Card.Body>
          </Card>

      </Container>
        <FloatingLabel controlId="floatingPaymentMethod" label="Método de Pagamento">
            <Form.Select 
            name= "paymentMethod"
            onChange={(e) => {
              setPaymentMethod(e.target.value);
              setPayment("");
              if (e.target.value === "cardInDelivery"){
                setPayment("Cartão na Entrega");
              }
              
            }}
            aria-label="Floating label select">
              <option value="">Selecione a forma de pagamento</option>
              <option name= "paymentMethod" value="creditCardApp">Cartão no Aplicativo</option>
              <option name= "paymentMethod" value="cardInDelivery">Cartão na Entrega</option>
              <option name= "paymentMethod" value="cash">Dinheiro</option>
              <option name= "paymentMethod" value="pix">Pix</option>
            </Form.Select>
        </FloatingLabel>
        </Col>

        {
          paymentMethod === "creditCardApp" ?
          <>

          <CreditCardComponent
            isPayment={true}
          ></CreditCardComponent>   
          
          </>

          : " "
        }
        
        {
          paymentMethod === "cash" ?
          <>
          <Form>
          <InputGroup className="mb-3 w-50 align-items-center">
          <InputGroup.Text id="changeFor" style={{ background: "#f5c030"}}> Troco </InputGroup.Text>
            <Form.Control
              name = "changeFor"
              onChange={(e) => {setTroco(e.target.value)}}
              placeholder="Insira para quanto será o troco. Formato aceito: 50.00"
              aria-describedby="changeFor"
            />
            <Form.Control.Feedback type="invalid">
              Insira um troco válido.
            </Form.Control.Feedback>
            <Button 
            onClick={() => validateChange(troco)}
            variant="warning"
            >
              Confirmar
            </Button>
          </InputGroup>
          </Form>
          </>

          : " "
        }

        {
          paymentMethod === "cardInDelivery" ?
          <>
          <span className="text-muted">O entregador irá trazer a maquininha para o pagamento na entrega.</span>
          </>

          : " "
        }

        {
          paymentMethod === "pix" ?
          <>
          <div className="d-flex gap-2 mt-2 mb-3">
            <Button variant="warning"
                    onClick={generateRandomPix}
            >Gerar Código Pix</Button>
          </div>

      <Card className="text-center shadow-lg p-4" style={{ maxWidth: "400px", margin: "auto" }}>
        <Card.Body>
          <Card.Title className="mb-3 fw-bold">Pagamento via Pix</Card.Title>
          <Card.Text className="text-muted">Escaneie o QR Code abaixo ou copie o código Pix para pagar.</Card.Text>
        
          {qrValue && (
            <div className="d-flex justify-content-center my-3">
              <QRCodeCanvas value={qrValue} size={180} />
            </div>
          )}

          <Form.Group className="mt-3">
          <InputGroup>
            <Form.Control
              type="text"
              value={qrValue}
              readOnly
            />
            <OverlayTrigger
              target={target.current} 
              show={show}
              delay={{show: 150, hide: 400}} 
              placement="right"
              overlay={(props) => (
                <Tooltip id="overlay-input-pix" {...props}>
                  Pix copiado!
                </Tooltip>
              )}
            >
            <Button variant="warning" onClick={handleCopy}>
              <FaRegCopy/>
            </Button>
            </OverlayTrigger>
          </InputGroup>
          </Form.Group>

            <Button 
              variant="success" 
              className="mt-3 w-100" 
              onClick={() => setPayment("Pix")}
              disabled={!qrValue}>Confirmar Pagamento</Button>
            <Card.Text className="text-muted">Aguarde a confirmação do pagamento para prosseguir.</Card.Text>
          </Card.Body>
        </Card>
          </>

          : " "
        }

      <div className="d-flex gap-2 mt-3 mb-3">
        <Button 
          className="fs-5"
          onClick={() => createReceipt()}
          variant="warning"
          disabled={!payment}>Confirmar Pagamento</Button>
        <Button 
          className="fs-5"
          variant="outline-danger"
          onClick={() => {
            setPayment("");
            setPaymentMethod("");
            navigate("/home");
          }}>Cancelar</Button>
      </div>
      </Container>
       </>
    );
  };
  
  export default CheckoutPage;