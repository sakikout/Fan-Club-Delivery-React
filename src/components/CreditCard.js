import React, { useState, useEffect} from 'react';
import { Container, Row, Col, FloatingLabel, Form, Button, Card } from 'react-bootstrap';
import FirestoreService from "../services/firestore";
import { useCart } from '../components/context/CartProvider';
import { useUser } from "../components/context/UserProvider";

const firestoreService = new FirestoreService();

const CreditCardComponent = (props) => {
    const { isPayment } = props
    const { user } = useUser();
    const { setPayment } = useCart();
    const [ creditCards, setCreditCards ] = useState([]);
    const [ addCardClicked, setAddCardClicked ] = useState(false);
    const [ cardSelected, setCardSelected ] = useState("");
    const [validated, setValidated] = useState(false);

  const [formCard, setFormCard] = useState({
        flag: "",
        cardHolder: "",
        cardNumber: "",
        CVV: "",
        expiryDate: "",
  });

  const [formErrors, setFormErrors] = useState({
    cardHolder: "",
    cardNumber: "",
    CVV: "",
    expiryDate: "",
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormCard((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    validateField(name, value);
  };


  useEffect(() => {
    const fetchCards = async () => {
      if (user) {
        const userCards = await firestoreService.getUserCards(user.uid);
        setCreditCards(userCards);
      }
    };

    fetchCards();
  }, [creditCards, user]);


  const createCreditCard = async (event) => {
    event.preventDefault()
    const form = event.currentTarget;

    setValidated(true);

    if (!form.checkValidity()) {
        event.stopPropagation();
        return;
    }

    try {
      const new_creditCard = await firestoreService.addCreditCard(formCard);
      if (new_creditCard){
        if (isPayment && isPayment === true){
            setPayment("Cartão de Crédito no Aplicativo");
        }
        alert("Cartão de crédito adicionado!");
        setValidated(false);
      }
      
    } catch (error) {
      alert("Erro ao adicionar cartão:", error);
      
    }

  }

  const deleteCreditCard = async () => {
    try {
        console.log(cardSelected);
        const deletedCard = await firestoreService.deleteCreditCard(cardSelected);
        if (deletedCard){
          alert("O Cartão foi apagado com sucesso!");
        }
        
      } catch (error) {
        console.error("Erro ao deletar cartão:", error);
        
      }
  }

  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "cardHolder":
        if (!value.trim()) error = "Insira o nome no cartão.";
        break;
  
      case "cardNumber":
        if (!/^[0-9]{13,24}$/.test(value.replace(/\s/g, ""))) {
          error = "Número de cartão inválido.";
        }
        break;
  
      case "CVV":
        if (!/^[0-9]{3,4}$/.test(value)) error = "CVV inválido.";
        break;
  
      case "expiryDate":
        if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(value)) {
          error = "Formato inválido. Use MM/YY.";
        } else {
          const [month, year] = value.split("/").map(Number);
          const currentYear = new Date().getFullYear() % 100;
          const currentMonth = new Date().getMonth() + 1;
          if (year < currentYear || (year === currentYear && month < currentMonth)) {
            error = "Cartão expirado.";
          }
        }
        break;
  
      default:
        break;
    }
  
    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

    return (
    <>
    { creditCards.length === 0 ?
        <Container>
            <span className="fs-5">Nenhum cartão adicionado.</span>
        </Container>
          : 
          (
          <FloatingLabel controlId="floatingCards" label="Cartões Cadastrados">
            <Form.Select 
            name= "cardId"
            onChange={(e) => {setCardSelected(e.target.value);  
                if (isPayment && isPayment === true){
                    setPayment("Cartão de Crédito no Aplicativo");
            }}}
            aria-label="Floating label select">
              <option value={""}>Selecione o cartão</option>
              { creditCards.map((card) => (
                  <option name="cardId" key={card.id} value={card.cardNumber}>
                  {card.flag} •••• {card.cardNumber ? card.cardNumber.slice(-4) : "XXXX"}
                </option>
              ))
              }
            </Form.Select>
          </FloatingLabel>
        )
          }
          
          <div className="d-flex gap-2 mt-2 mb-3">
          { creditCards.length !== 0 ?
          <Button variant="danger"
                    onClick={() => deleteCreditCard()}
                    disabled={cardSelected === ""}
            >Remover Cartão</Button>
          : " "}
            <Button variant="warning"
                    onClick={() => setAddCardClicked(true)}
            >Adicionar Cartão</Button>
          </div>

          { addCardClicked === true ?
          <Card className="p-3">
            <Form className="gap-2 mt-2 mb-3" onSubmit={createCreditCard} noValidate validated={validated}>
              <Form.Group className="mb-3" controlId="formGroupName">
                <Form.Label>Nome no Cartão</Form.Label>
                <Form.Control 
                onChange={handleInputChange}
                name ="cardHolder"
                type="text" 
                placeholder="Insira o nome escrito no cartão"
                isInvalid={!!formErrors.cardHolder}/>
                <Form.Control.Feedback type="invalid">
                 {formErrors.cardHolder}
               </Form.Control.Feedback>
              </Form.Group>
              <Row className="mb-3">
                <Form.Group as={Col} xs={7} controlId="formGridNumber">
                  <Form.Label>Número do Cartão</Form.Label>
                  <Form.Control 
                  onChange={handleInputChange}
                  name="cardNumber"
                  type="text" 
                  placeholder="•••• •••• •••• ••••" 
                  isInvalid={!!formErrors.cardNumber}/>
                <Form.Control.Feedback type="invalid">
                {formErrors.cardNumber}
               </Form.Control.Feedback>
                </Form.Group>

              <Form.Group as={Col} controlId="formGridFlag">
                <Form.Label>Bandeira</Form.Label>
                <Form.Control 
                onChange={handleInputChange}
                name="flag"
                type="text" 
                placeholder="Visa, etc" 
                isInvalid={!!formErrors.flag}/>
              <Form.Control.Feedback type="invalid">
                {formErrors.flag}
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
                placeholder="•••"
                isInvalid={!!formErrors.CVV}/>
                <Form.Control.Feedback type="invalid">
                {formErrors.CVV}
               </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} controlId="formGridExpiryDate">
                <Form.Label>Data de Validade</Form.Label>
                <Form.Control
                  onChange={handleInputChange}
                  name="expiryDate"
                  type="text" 
                  placeholder="XX/XX"
                  isInvalid={!!formErrors.expiryDate}/>
                <Form.Control.Feedback type="invalid">
                {formErrors.expiryDate}
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
                      onClick={() => {setAddCardClicked(false); setValidated(false)}}>Cancelar</Button>
              </div>
            </Form>
            </Card>

            : " "
          }
    </>
    );
  };
  
  export default CreditCardComponent;