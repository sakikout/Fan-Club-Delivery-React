import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Col, Form, Row, Button, Container, Image } from 'react-bootstrap';
import '../App.css';
import AuthService from "../services/auth/AuthService";
import logo from "../assets/logo/fa_clube_logo.png"

const authService = new AuthService();

function SignIn(){
    const navigate = useNavigate();
    const [validated, setValidated] = useState(false);
  
    const [formSignIn, setFormSignIn] = useState({
      nome: "",
      sobrenome: "",
      email: "",
      senha: "",
    });
      
    const handleInputChange = (event) => {
      const { name } = event.target;
        const { value } = event.target;
        setFormSignIn((prevData) => ({
          ...prevData,
          [name]: value,
        }));
      
    };
  
    const handleSubmit = async (event) => {
      event.preventDefault();
      const form = event.currentTarget;

      if (form.checkValidity() === false) {
        event.stopPropagation();
        return;
      } else {
        setValidated(true);
        try {
          await authService.signUpWithEmailAndPassword(
            formSignIn.email,
            formSignIn.senha,
            formSignIn.nome,
            formSignIn.sobrenome
          );
          alert("Usuário cadastrado com sucesso!");
          navigate("/");
        } catch (error) {
          alert(error.message);
        }
      }

    };
  
    return (
      <Container className="vh-80 w-50 d-flex align-items-center justify-content-center">
      <Row className="justify-content-md-center">
      <Form noValidate validated={validated}>
        <Row className='w-50 mx-auto text-center'>
          <Image src={logo} roundedCircle />
          <h4>Venha fazer parte disso!</h4>
        </Row>
        <Row className="mb-3">
        <Form.Group as={Col} controlId="formGridName">
          <Form.Label>Nome</Form.Label>
          <Form.Control 
            name = "nome"
            placeholder="Digite seu nome." 
            onChange={handleInputChange}
            required/>
            <Form.Control.Feedback type="invalid">
              Não pode estar vazio.
            </Form.Control.Feedback>
        </Form.Group>

        <Form.Group as={Col} controlId="formGridLastName">
          <Form.Label>Sobrenome</Form.Label>
          <Form.Control 
            name = "sobrenome"
            placeholder="Digite seu sobrenome." 
            onChange={handleInputChange}
            required/>
            <Form.Control.Feedback type="invalid">
              Não pode estar vazio.
            </Form.Control.Feedback>
        </Form.Group>
      </Row>
      <Row className="mb-3">
        <Form.Group as={Col} controlId="formGridEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control 
            name = "email"
            type="email" 
            placeholder="exemplo@email.com" 
            onChange={handleInputChange}
            required/>
            <Form.Control.Feedback type="invalid">
              Insira um e-mail válido.
            </Form.Control.Feedback>
        </Form.Group>

        <Form.Group as={Col} controlId="formGridPassword">
          <Form.Label>Senha</Form.Label>
          <Form.Control 
            name = "senha"
            type="password" 
            placeholder="Digite sua senha." 
            onChange={handleInputChange}
            required/>
            <Form.Control.Feedback type="invalid">
              Insira uma senha válida.
            </Form.Control.Feedback>
        </Form.Group>
      </Row>
      <div className="d-flex gap-2 mt-2 mb-3 ">
      <Button variant="warning" type="submit" onClick={handleSubmit}>
        Cadastrar
      </Button>
      <Button 
        variant="outline-secondary" 
        type="button" 
        onClick={() => navigate("/", { replace: false })}>
        Entrar
      </Button>
      </div>
      </Form>
      </Row>
    </Container>
    );
  }
  
  export default SignIn;
  