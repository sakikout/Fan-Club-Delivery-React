import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Col, Form, Row, Button, Container, Image } from 'react-bootstrap';
import '../App.css';
import AuthService from "../services/auth/AuthService";
import logo from "../assets/logo/fa_clube_logo.png"

const authService = new AuthService();

function Login(){
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [validated, setValidated] = useState(false);
  
    const handleSignIn = () => {
      navigate("signIn",  { replace: false });
    };

  
    const handleSubmit = async (event) => {
      event.preventDefault();
      const form = event.currentTarget;

      if (form.checkValidity() === false) {
        event.stopPropagation();
        return;
      }

      setValidated(true);
        try {
          await authService.signInWithEmailAndPassword(
              email,
              senha,
            );
            navigate("home");
        } catch (error) {
          alert(error.message);
        }

    };
  
  
    return (
      <>
      <Container className="vh-80 w-50 d-flex align-items-center justify-content-center">
      <Row className="w-50 mx-auto">
      <Form noValidate validated={validated}>
        <Row className=' mx-auto text-center'>
          <Image src={logo} roundedCircle/>
          <h2>Bem-vindo de volta!</h2>
        </Row>
      <Row className="mb-3">
      <div className="d-flex gap-2">
      <Form.Group as={Row} controlId="formGridEmail">
        <Form.Label>Email</Form.Label>
        <Form.Control 
          name = "email"
          type="email" 
          placeholder="exemplo@email.com" 
          onChange={(e => setEmail(e.target.value))}
          required/>
        <Form.Control.Feedback type="invalid">
          Informe seu e-mail.
        </Form.Control.Feedback>
      </Form.Group>
      </div>
      <div className="d-flex gap-2 mt-2">
      <Form.Group as={Row} controlId="formGridPassword">
        <Form.Label>Senha</Form.Label>
        <Form.Control 
          name = "senha"
          type="password" 
          placeholder="Digite sua senha." 
          onChange={(e => setSenha(e.target.value))}
          required/>
        <Form.Control.Feedback type="invalid">
           Informe sua senha.
         </Form.Control.Feedback>
      </Form.Group>
      </div>
    </Row>
    
    <div className="d-flex gap-2 mt-2 mb-3 ">
    <Button variant="warning" type="submit" onClick={handleSubmit}>
      Entrar
    </Button>
    <Button variant="outline-secondary" onClick={handleSignIn}>
      Cadastrar-se
    </Button>
    </div>
    </Form>
    </Row>
    </Container>
    </>
    );
  }
  
  export default Login;
  