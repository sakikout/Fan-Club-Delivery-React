import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, FloatingLabel, Form, Button, InputGroup, Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import FirestoreService from "../services/firestore";
import { QRCodeCanvas } from "qrcode.react";
import { FaRegCopy } from "react-icons/fa";
import { useCart } from '../components/context/CartProvider';
import { useUser } from "../components/context/UserProvider";
import CustomNavBar from '../components/NavBar';

const firestoreService = new FirestoreService();

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, userData } = useUser();
  const { payment, setPayment, setCurrentOrder, feePrice, prepTime, deliveryTime, cart } = useCart();
  const [ paymentMethod, setPaymentMethod ] = useState(" ");
  const [ creditCards, setCreditCards ] = useState([]);
  const [ addCardClicked, setAddCardClicked ] = useState(false);
  const [ troco, setTroco ] = useState(" ");
  const [qrValue, setQrValue] = useState("");
  const [show, setShow] = useState(false);
  const target = useRef(null);

  const [formCard, setFormCard] = useState({
        flag: "",
        cardHolder: "",
        cardNumber: "",
        CVV: "",
        expiryDate: "",
  });

  const handleInputChange = (event) => {
    const { name } = event.target;
      const { value } = event.target;
      setFormCard((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    
  };


  useEffect(() => {
    const fetchCards = async () => {
      if (user) {
        const userCards = await firestoreService.getUserCards(user.uid);
        console.log(userCards);
        setCreditCards(userCards);
      }
    };

    fetchCards();

    console.log(cart);

  }, []);


  const createCreditCard = async (event) => {
    event.preventDefault()

    if (!validateCard(formCard)) {
      return;
    }

    try {
      const new_creditCard = await firestoreService.addCreditCard(formCard);
      if (new_creditCard){
        setPayment("Cartão de Crédito no Aplicativo")
        console.log("Cartão de crédito adicionado!");
      }
      
    } catch (error) {
      console.error("Erro ao adicionar cartão:", error);
      
    }

  }

  const validateCard = (cardData) => {
    const { cardNumber, expiryDate, CVV, cardHolder } = cardData;
  
    if (!cardHolder || cardHolder.trim().length === 0) {
      alert("Nome no cartão inválido.");
      return false;
    }
  
    const cardNumberRegex = /^[0-9]{13,19}$/;
    if (!cardNumberRegex.test(cardNumber.replace(/\s/g, ""))) {
      alert("Número do cartão inválido.");
      return false;
    }
  
    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiryRegex.test(expiryDate)) {
      alert("Data de validade inválida.");
      return false;
    } else {
      const [month, year] = expiryDate.split("/").map(Number);
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
  
      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        alert("O cartão já expirou.");
        return false;
      }
    }
  
    const cvvRegex = /^[0-9]{3,4}$/;
    if (!cvvRegex.test(CVV)) {
      alert("CVV inválido.");
      return false;
    }
  
    return true;
  };

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
  
        const addonsTotal = item.availableAddons
          ? item.availableAddons.reduce((sum, addon) => sum + addon.price * addon.quantity, 0)
          : 0;
  
        return total + itemTotal + addonsTotal;
      }, 0);

      const total = subtotal + feePrice;
      const address = userData.address;
      const orderName = cart.map(item => item.name).join(" + ");

  
      const orderData = {
        orderName: orderName,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
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
        address
      };
  
      if (paymentMethod === "Dinheiro") {
        orderData.changeFor = troco;
      }
  
      const orderRef = await firestoreService.saveOrderToDatabase(orderData, prepTime, deliveryTime);
      console.log("Pedido salvo com ID:", orderRef.id);
      setCurrentOrder(orderRef.id);
  
      alert("Pedido realizado com sucesso!");
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
      <Container >
        <Col className="gap-2 mt-3 mb-3"> 
        <h2 className="fw-bold">Checkout</h2>
        <FloatingLabel controlId="floatingPaymentMethod" label="Método de Pagamento">
            <Form.Select 
            name= "paymentMethod"
            onChange={(e) => {setPaymentMethod(e.target.value)}}
            aria-label="Floating label select">
              <option>Selecione a forma de pagamento</option>
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

          { creditCards.length === 0 ?
            <Container>
              <span>Nenhum cartão adicionado.</span>
            </Container>
          : 
          (
          <FloatingLabel controlId="floatingPaymentMethod" label="Cartões Cadastrados">
            <Form.Select 
            name= "cardId"
            onChange={(e) => {setPayment(e.target.value)}}
            aria-label="Floating label select">
              <option>Selecione o cartão</option>
              { creditCards.map((card) => (
                  <option name="cardId" key={card.id} value={card.id}>
                  {card.flag} •••• {card.cardNumber ? card.cardNumber.slice(-4) : "XXXX"}
                </option>
              ))
              }
            </Form.Select>
          </FloatingLabel>
        )
          }
          
          <div className="d-flex gap-2 mt-2 mb-3">
            <Button variant="warning"
                    onClick={() => setAddCardClicked(true)}
            >Adicionar Cartão</Button>
          </div>

          { addCardClicked === true ?
          <Card className="p-3">
            <Form className="gap-2 mt-2 mb-3" onSubmit={createCreditCard}>
              <Form.Group className="mb-3" controlId="formGroupName">
                <Form.Label>Nome no Cartão</Form.Label>
                <Form.Control 
                onChange={handleInputChange}
                name ="cardHolder"
                type="text" 
                placeholder="Insira o nome escrito no cartão"/>
                <Form.Control.Feedback type="invalid">
                  Insira o nome no cartão.
               </Form.Control.Feedback>
              </Form.Group>
              <Row className="mb-3">
                <Form.Group as={Col} xs={7} controlId="formGridNumber">
                  <Form.Label>Número do Cartão</Form.Label>
                  <Form.Control 
                  onChange={(e) => {
                    const formatted = e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
                    setFormCard({ ...formCard, cardNumber: formatted });
                  }}
                  name="cardNumber"
                  type="text" 
                  placeholder="•••• •••• •••• ••••" />
                <Form.Control.Feedback type="invalid">
                  Insira um número válido.
               </Form.Control.Feedback>
                </Form.Group>

              <Form.Group as={Col} controlId="formGridFlag">
                <Form.Label>Bandeira</Form.Label>
                <Form.Control 
                onChange={handleInputChange}
                name="flag"
                type="text" 
                placeholder="Visa, etc" />
              <Form.Control.Feedback type="invalid">
                  Informe a bandeira do cartão.
               </Form.Control.Feedback>
              </Form.Group>
              </Row>

              <Row className="mb-3">
              <Form.Group as={Col} controlId="formGridCVV">
                <Form.Label>CVV</Form.Label>
                <Form.Control
                onChange={handleInputChange}
                name="CVV"
                type="text" 
                placeholder="•••"/>
                <Form.Control.Feedback type="invalid">
                  Insira um CVV válido.
               </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} controlId="formGridExpiryDate">
                <Form.Label>Data de Validade</Form.Label>
                <Form.Control
                  onChange={handleInputChange}
                  name="expiryDate"
                  type="text" 
                  placeholder="XX/XX"/>
                <Form.Control.Feedback type="invalid">
                  Insira uma data válida.
               </Form.Control.Feedback>
              </Form.Group>
              </Row>
              <div className="d-flex mt-2 gap-2">
              <Button 
                variant="primary" 
                type="submit">
                Criar Cartão
              </Button>
              <Button variant="outline-secondary"
                      onClick={() => setAddCardClicked(false)}>Cancelar</Button>
              </div>
            </Form>
            </Card>

            : " "
          }
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
              placeholder="Insira o troco necessário. Exemplo de formato aceito: 50.00"
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
          variant="outline-danger">Cancelar</Button>
      </div>
      </Container>
       </>
    );
  };
  
  export default CheckoutPage;