import React, { useState } from 'react';
import { useUser } from "../components/context/UserProvider";
import { Container, ListGroup, Row, Col, Card, Form, InputGroup, Button } from 'react-bootstrap';
import { FaPen, FaKey, FaCreditCard, FaUserSlash } from "react-icons/fa";
import { BsFillPersonFill, BsFillPersonLinesFill } from "react-icons/bs";
import { TbMail } from "react-icons/tb";
import { MdEmail } from "react-icons/md";
import { GoKey } from "react-icons/go";
import CustomNavBar from '../components/NavBar';
import FirestoreService from '../services/firestore';
import { getAuth, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import CreditCardComponent from '../components/CreditCard';
import { useNavigate } from 'react-router-dom';

const firestoreService = new FirestoreService();

const SettingsPage = () => {
  const { user, userData, logout } = useUser();
  const navigate = useNavigate();
  const [itemSelected, setItemSelected] = useState(0);
  const [validated, setValidated] = useState(false);

  const [formErrors, setFormErrors] = useState({
    name: "",
    lastName: "",
    email: "",
    password: "",
    newPassword: "",
    passwordConfirm: ""
  });

  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    password: "",
    newPassword: "",
    passwordConfirm: ""
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
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
      password: "",
      newPassword: "",
      passwordConfirm: ""
    });
    setFormErrors({
      name: "",
      lastName: "",
      email: "",
      password: "",
      newPassword: "",
      passwordConfirm: ""
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
        if (!value.trim()) error = "Você precisa inserir um nome.";
        break;

      case "lastName":
        if (!value.trim()) error = "Você precisa inserir um sobrenome.";
        break;

      case "email":
        if (!isValidEmail(value)) error = "Insira um e-mail válido.";
        break;

      case "password":
        if (!isValidPassword(value)) error = "Insira uma senha válida.";
        break;

      case "newPassword":
        if (!isValidPassword(value)) error = "Insira uma senha válida.";
        break;

      case "passwordConfirm":
        if (value !== formData.newPassword) error = "As senhas precisam ser iguais.";
        break;

      default:
        break;
    }

    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...formErrors };

    for (const key in formData) {
      validateField(key, formData[key]);
      if (formErrors[key]) isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  const handleSubmitName = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity() === false || !validateForm()) {
      event.stopPropagation();
    } else {
      try {
        await firestoreService.updateUserNameLastName(formData.name, formData.lastName);
        alert("Nome e sobrenome atualizados com sucesso!");
        clearFields();
      } catch (error) {
        alert(error.message);
      }
    }

    setValidated(true);
  };

  const handleSubmitEmail = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity() === false || !validateForm()) {
      event.stopPropagation();
    } else {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        // Reautenticar o usuário
        const credential = EmailAuthProvider.credential(user.email, formData.password);
        await reauthenticateWithCredential(user, credential);

        // Atualizar o e-mail
        await firestoreService.updateUserEmail(formData.email, formData.password);
        alert("E-mail atualizado com sucesso!");
        clearFields();
      } catch (error) {
        alert(error.message);
      }
    }

    setValidated(true);
  };

  const handleSubmitPassword = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity() === false || !validateForm()) {
      event.stopPropagation();
    } else {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        // Reautenticar o usuário
        const credential = EmailAuthProvider.credential(user.email, formData.password);
        await reauthenticateWithCredential(user, credential);

        // Atualizar a senha
        await firestoreService.updateUserPassword(formData.password, formData.newPassword);
        alert("Senha atualizada com sucesso!");
        clearFields();
      } catch (error) {
        alert(error.message);
      }
    }

    setValidated(true);
  };

  const handleDeleteAccount = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity() === false || !validateForm()) {
      event.stopPropagation();
    } else {
      try {
        await firestoreService.deleteUserAccount(formData.password);
        alert("Sua conta foi deletada.");
        logout();
        navigate("/");
      } catch (error) {
        alert(error.message);
      }
    }

    setValidated(true);
  };

  return (
    <>
      <CustomNavBar />
      <Container className="gap-2 mt-3 mb-3">
        <p className="fw-bold fs-4">Configurações</p>
        <Row>
          <Col xs={3}>
            <ListGroup className="gap-2 mt-2 mb-3">
              <ListGroup.Item action onClick={() => setItemSelected(0)}><FaPen /> Alterar Nome</ListGroup.Item>
              <ListGroup.Item action onClick={() => setItemSelected(1)}><MdEmail /> Alterar E-mail</ListGroup.Item>
              <ListGroup.Item action onClick={() => setItemSelected(2)}><FaKey /> Alterar Senha</ListGroup.Item>
              <ListGroup.Item action onClick={() => setItemSelected(3)}><FaCreditCard /> Gerenciar Cartões</ListGroup.Item>
              <ListGroup.Item action variant="danger" onClick={() => setItemSelected(4)}>
                <FaUserSlash /> Deletar Conta
              </ListGroup.Item>
            </ListGroup>
          </Col>

          <Col xs={9}>
            {itemSelected === 0 && (
              <Card>
                <Card.Body>
                  <Card.Title className="mb-3">Alterar Nome ou Sobrenome</Card.Title>
                  <Card.Text>
                    <Form className="mb-1" onSubmit={handleSubmitName} noValidate validated={validated}>
                      <Row>
                        <Col>
                          <Form.Group>
                            <InputGroup>
                              <InputGroup.Text><BsFillPersonFill /></InputGroup.Text>
                              <Form.Control
                                name="name"
                                type="text"
                                placeholder="Insira o novo nome"
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
                              <InputGroup.Text><BsFillPersonLinesFill /></InputGroup.Text>
                              <Form.Control
                                name="lastName"
                                type="text"
                                placeholder="Insira o novo sobrenome"
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
            )}

            {itemSelected === 1 && (
              <Card>
                <Card.Body>
                  <Card.Title className="mb-3">Alterar E-mail</Card.Title>
                  <Card.Text>
                    <Form className="mb-1" onSubmit={handleSubmitEmail} noValidate validated={validated}>
                      <Row>
                        <Col>
                          <Form.Group>
                            <InputGroup>
                              <InputGroup.Text><TbMail /></InputGroup.Text>
                              <Form.Control
                                name="email"
                                type="email"
                                placeholder="Insira o novo e-mail"
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
                              <InputGroup.Text><FaKey /></InputGroup.Text>
                              <Form.Control
                                name="password"
                                type="password"
                                placeholder="Insira sua senha"
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
                          <Button variant="warning" type="submit">
                            Confirmar
                          </Button>
                        </Col>
                      </Row>
                    </Form>
                  </Card.Text>
                </Card.Body>
              </Card>
            )}

            {itemSelected === 2 && (
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
                              <InputGroup.Text><FaKey /></InputGroup.Text>
                              <Form.Control
                                name="password"
                                type="password"
                                placeholder="Insira a senha atual"
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
                              <InputGroup.Text><GoKey /></InputGroup.Text>
                              <Form.Control
                                name="newPassword"
                                type="password"
                                placeholder="Insira a nova senha"
                                required
                                onChange={handleInputChange}
                                isInvalid={!!formErrors.newPassword}
                              />
                              <Form.Control.Feedback type="invalid">
                                {formErrors.newPassword}
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
            )}

            {itemSelected === 3 && (
              <>
                <CreditCardComponent isPayment={false} />
              </>
            )}

            {itemSelected === 4 && (
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
                              <InputGroup.Text><FaKey /></InputGroup.Text>
                              <Form.Control
                                name="password"
                                type="password"
                                placeholder="Insira sua senha"
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
                          <Button variant="danger" type="submit">
                            Confirmar
                          </Button>
                        </Col>
                      </Row>
                    </Form>
                  </Card.Text>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default SettingsPage;