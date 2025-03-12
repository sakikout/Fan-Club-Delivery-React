import React, { useState, useEffect } from 'react';
import { useUser } from "../components/context/UserProvider"
import { Container, ListGroup, Row, Col, Card, Form, InputGroup, Button, FloatingLabel } from 'react-bootstrap';
import { FaPen, FaKey, FaCreditCard, FaUserSlash } from "react-icons/fa";
import { BsFillPersonFill, BsFillPersonLinesFill } from "react-icons/bs";
import { TbMail, TbMailPlus } from "react-icons/tb";
import { MdEmail } from "react-icons/md";
import { GoKey } from "react-icons/go";
import CustomNavBar from '../components/NavBar';
import FirestoreService from '../services/firestore';
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from "firebase/auth";
import CreditCardComponent from '../components/CreditCard';
import { useNavigate } from 'react-router-dom';

const firestoreService = new FirestoreService();

const SettingsPage = () => {
  const { user, userData } = useUser();
  const navigate = useNavigate();
  const [ itemSelected, setItemSelected ] = useState(0);
  const [validated, setValidated] = useState(false);
  
  const [formErrors, setFormErrors] = useState({
    name: "",
    lastName: "",
    email: "",
    emailConfirm: "",
    password: "",
    passwordConfirm: "",
  });

  const [formData, setFormData] = useState({
      name: "",
      lastName: "",
      email: "",
      emailConfirm: "",
      password: "",
      passwordConfirm: "",
    });

    useEffect(() => {
    
      }, []);
    

  const handleInputChange = (event) => {
    const { name } = event.target;
    const { value } = event.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));

    validateField(name, value);
  };

  const clearFields = () => {
    setFormData({
      name: "",
      lastName: "",
      email: "",
      emailConfirm: "",
      password: "",
      passwordConfirm: "",
    });
  };


  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const isValidPassword = (password) => {
    return password.length >= 8 && 
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) && 
           /\d/.test(password) && 
           /[@$!%*?&]/.test(password); 
  };

  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "name":
        if (!formData.name.trim()) error = "Você precisa inserir um nome.";
        break;
  
      case "lastName":
        if (!formData.lastName.trim()) error = "Você precisa inserir um sobrenome.";
        
        break;
  
      case "email":
        if (!isValidEmail(formData.email)) error = "Insira um e-mail válido.";
        break;
  
      case "emailConfirm":
        if (formData.email !== formData.emailConfirm) error = "Os e-mails precisam ser iguais.";
        break;

      case "password":
        if (!isValidPassword(formData.password)) error = "Insira uma senha válida.";
        break;
      
      case "passwordConfirm":
        if (formData.password !== formData.passwordConfirm) error = "As senhas precisam ser iguais.";
        break;
  
      default:
        break;
    }
  
    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const handleSubmitName = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    setValidated(true);

    if (form.checkValidity() === false) {
      event.stopPropagation();
      return;
      
    } else {
      const data = {
        name: formData.name,
        lastName: formData.lastName
      }

      try {
        await firestoreService.updateUserNameLastName(data.name, data.lastName);
        alert("O nome e sobrenome foram alterados com sucesso!");
        setValidated(false);

        setFormData((prevData) => ({
          ...prevData,
          name: "",
          lastName: ""
        }));

      } catch (error) {
        alert(error.message);
      }
    }

  };

  const handleSubmitEmail = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    setValidated(true);

    if (form.checkValidity() === false) {
      event.stopPropagation();
      return;
      
    } else {

      try {
        await firestoreService.updateUserEmail(formData.email);
        alert("O e-mail foi alterado com sucesso!");

        setValidated(false);

        setFormData((prevData) => ({
          ...prevData,
          email: "",
          emailConfirm: ""
        }));

      } catch (error) {
        alert(error.message);
      }
    }

  };

  const handleSubmitPassword = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    setValidated(true);

    if (form.checkValidity() === false) {
      event.stopPropagation();
      return;
      
    } else {

      try {
        await firestoreService.updateUserPassword(
          formData.password
        );
        alert("A senha foi alterada com sucesso!");

        setValidated(false);

        setFormData((prevData) => ({
          ...prevData,
          password: "",
          passwordConfirm: ""
        }));

      } catch (error) {
        alert(error.message);
      }
    }

  };

  const handleDeleteAccount = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    setValidated(true);

    if (form.checkValidity() === false) {
      event.stopPropagation();
      return;

    } 
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) {
      alert("Usuário não autenticado.");
      return;
    }

    const credential = EmailAuthProvider.credential(user.email, formData.password);

      try {
        await reauthenticateWithCredential(user, credential);
        await firestoreService.deleteUserAccount();
        setValidated(false);

        alert("Sua conta foi deletada.");
        navigate("/");
      } catch (error) {
        alert(error.message);
      }
    

  };

    return (
      <>
      <CustomNavBar></CustomNavBar>
      <Container className="gap-2 mt-3 mb-3">
        <p className="fw-bold fs-4">Configurações</p>
      <Row>
        <Col xs={3}>
      <ListGroup className="gap-2 mt-2 mb-3">
        <ListGroup.Item action onClick={() => setItemSelected(0)}><FaPen></FaPen> Alterar Nome</ListGroup.Item>
        <ListGroup.Item action onClick={() => setItemSelected(1)}><MdEmail></MdEmail> Alterar E-mail</ListGroup.Item>
        <ListGroup.Item action onClick={() => setItemSelected(2)}><FaKey></FaKey> Alterar Senha</ListGroup.Item>
        <ListGroup.Item action onClick={() => setItemSelected(3)}><FaCreditCard></FaCreditCard> Gerenciar Cartões</ListGroup.Item>
        <ListGroup.Item action variant="danger" onClick={() => setItemSelected(4)}>
          <FaUserSlash></FaUserSlash> Deletar Conta
        </ListGroup.Item>
      </ListGroup>
        </Col>

        <Col xs={9}>
        { itemSelected === 0 ?



           <Card>
           <Card.Body>
           <Card.Title className="mb-3">Alterar Nome ou Sobrenome</Card.Title>
           <Card.Text>
          <Form className="mb-1" onSubmit={handleSubmitName} noValidate validated={validated}>
            <Row>
              <Col>
           <Form.Group>
              <InputGroup>
              <InputGroup.Text><BsFillPersonFill/></InputGroup.Text>
                <Form.Control
                  name="name"
                  type="text"
                  placeholder="Insira o novo nome"
                  aria-describedby="nameInput"
                  required
                  onChange={handleInputChange}
                  isInvalid={!!formErrors.name}
                />
                <Form.Control.Feedback type="invalid">
                 {formErrors.name}
                </Form.Control.Feedback>
                </InputGroup>
            </Form.Group>
            </Col>
            <Col>
            <Form.Group>
              <InputGroup>
              <InputGroup.Text><BsFillPersonLinesFill/></InputGroup.Text>
                <Form.Control
                  name="lastName"
                  type="text"
                  placeholder="Insira o novo sobrenome"
                  aria-describedby="lastNameInput"
                  required
                  onChange={handleInputChange}
                  isInvalid={!!formErrors.lastName}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.lastName}
                </Form.Control.Feedback>
                </InputGroup>
            </Form.Group>
            </Col>
            <Col>
            <Button variant="warning" type="submit">
              Confirmar
            </Button>
            </Col>

            </Row>
            </Form>

           </Card.Text>
           </Card.Body>
         </Card>

        : " "
        }

    { itemSelected === 1 ?

        <Card>
          <Card.Body>
            <Card.Title className="mb-3">Alterar E-mail</Card.Title>
            <Card.Text>
          <Form className="mb-1" onSubmit={handleSubmitEmail} noValidate validated={validated}>
            <Row>
              <Col>
            <Form.Group>
              <InputGroup>
              <InputGroup.Text><TbMail/></InputGroup.Text>
                <Form.Control
                  name="email"
                  type="text"
                  placeholder="Insira o novo e-mail"
                  aria-describedby="emailInput"
                  required
                  onChange={handleInputChange}
                  isInvalid={!!formErrors.email}
                />
                <Form.Control.Feedback type="invalid">
                 {formErrors.email}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
              </Col>
              <Col>
            <Form.Group>
               <InputGroup>
               <InputGroup.Text><TbMailPlus/></InputGroup.Text>
                  <Form.Control
                    name="emailConfirm"
                    type="text"
                    placeholder="Confirme o novo e-mail"
                    aria-describedby="emailConfirmInput"
                    required
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.emailConfirm}
                  />
                <Form.Control.Feedback type="invalid">
                  {formErrors.emailConfirm}
                </Form.Control.Feedback>
                </InputGroup>
            </Form.Group>
              </Col>
              <Col>
              <Button variant="warning" type="submit">
                  Confirmar
              </Button>
              </Col>
 
            </Row>
            </Form>

          </Card.Text>
          </Card.Body>
          </Card>

            : " "
          }

      { itemSelected === 2 ?

        <Card>
          <Card.Body>
              <Card.Title>Alterar Senha</Card.Title>
              <Card.Subtitle className="mb-3 text-muted">Sua senha deve ter pelo menos 8 caracteres e conter pelo menos um número, uma letra maiúscula, uma letra minúscula e um caractere especial.</Card.Subtitle>
              <Card.Text>
            <Form className="mb-1" onSubmit={handleSubmitPassword} noValidate validated={validated}>
              <Row>
                <Col>
                <Form.Group>
                  <InputGroup>
                  <InputGroup.Text><FaKey/></InputGroup.Text>
                    <Form.Control
                      name="password"
                      type="password"
                      placeholder="Insira a nova senha"
                      aria-describedby="passwordInput"
                      required
                      onChange={handleInputChange}
                      isInvalid={!!formErrors.password}
                    />
                  <Form.Control.Feedback type="invalid">
                   {formErrors.password}
                  </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <InputGroup>
                  <InputGroup.Text><GoKey/></InputGroup.Text>
                    <Form.Control
                      name="passwordConfirm"
                      type="password"
                      placeholder="Confirme a nova senha"
                      aria-describedby="passwordConfirmInput"
                      required
                      onChange={handleInputChange}
                      isInvalid={!!formErrors.passwordConfirm}
                    />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.passwordConfirm}
                  </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col>
                <Button variant="warning" type="submit">
                  Confirmar
                </Button>
              </Col>
 
            </Row>
          </Form>

          </Card.Text>
          </Card.Body>
          </Card>

          : " "
        }


        { itemSelected === 3 ?

          <>
            <CreditCardComponent
            isPayment={false}></CreditCardComponent>
          </>

          : " "
        }

      { itemSelected === 4 ?

        <Card border="danger">
            <Card.Body>
              <Card.Title>Deletar Conta</Card.Title>
              <Card.Subtitle className="mb-3 text-muted">Uma vez deletada, você perderá o acesso a sua conta e aos seus pedidos.</Card.Subtitle>
              <Card.Text>
            <Form className="mb-1" onSubmit={handleDeleteAccount} noValidate validated={validated}>
          <Row>
            <Col>
                <Form.Group>
                  <InputGroup>
                    <InputGroup.Text><FaKey/></InputGroup.Text>
                  <Form.Control
                      name="password"
                      type="password"
                      placeholder="Insira sua senha"
                      aria-describedby="passwordInput"
                      required
                      onChange={handleInputChange}
                      isInvalid={!!formErrors.password}
                    />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.password}
                  </Form.Control.Feedback>
                </InputGroup>
                </Form.Group>
              </Col>
              <Col>
              <Form.Group>
                  <InputGroup>
                    <InputGroup.Text><GoKey/></InputGroup.Text>
                      <Form.Control
                        name="passwordConfirm"
                        type="password"
                        placeholder="Confirme sua senha"
                        aria-describedby="passwordConfirmInput"
                        required
                        onChange={handleInputChange}
                        isInvalid={!!formErrors.passwordConfirm}
                      />
                  <Form.Control.Feedback type="invalid">
                  {formErrors.passwordConfirm}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Col>
          <Col>
          <Button variant="danger" type="submit">
            Confirmar
          </Button>
        </Col>

        </Row>
      </Form>

      </Card.Text>
      </Card.Body>
      </Card>

        : " "
    }
        </Col>


      </Row>
        
      </Container>
       </>
    );
  };
  
  export default SettingsPage;