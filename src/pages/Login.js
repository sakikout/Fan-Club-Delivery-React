import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputGroup, Card, Col, Form, Row, Button, Container, Image } from 'react-bootstrap';
import { FaRegUser, FaKey } from "react-icons/fa";
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

      setValidated(true);

      if (!form.checkValidity() || !isValidEmail(email)) {
          event.stopPropagation();
          return;
      }

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

    const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };
  
  
    return (
      <>
      <Container className="w-50 d-flex align-items-center justify-content-center">
      <Card className="p-5 login_container">
      <Row className="mx-auto">
      <Form noValidate validated={validated}>
        <Row className='mx-auto text-center'>
          <div className="brand_logo_container">
          <Image className="brand_logo" src={logo} roundedCircle/>
          </div>
          <h4>Bem-vindo de volta!</h4>
        </Row>
      <Row className="mt-2 mb-3 justify-content-center">
        <div className="w-75 gap-3">
      <Form.Group className="mb-2" controlId="formGridEmail">
        <InputGroup hasValidation>
        <InputGroup.Text id="inputGroupText"><FaRegUser/></InputGroup.Text>
        <Form.Control 
          name = "email"
          type="email" 
          placeholder="SeuEmail@email.com" 
          onChange={(e => setEmail(e.target.value))}
          required/>
        <Form.Control.Feedback type="invalid">
          Informe um e-mail válido.
        </Form.Control.Feedback>
        </InputGroup>
      </Form.Group>
      <Form.Group className="mb-3" controlId="formGridPassword">
        <InputGroup hasValidation>
        <InputGroup.Text id="inputGroupText"><FaKey/></InputGroup.Text>
        <Form.Control 
          name = "senha"
          type="password" 
          placeholder="Digite sua senha" 
          onChange={(e => setSenha(e.target.value))}
          required/>
        <Form.Control.Feedback type="invalid">
           Informe sua senha.
         </Form.Control.Feedback>
         </InputGroup>
      </Form.Group>
      <div className="d-flex mt-2 justify-content-center">
      <Button 
        className="fw-bold fs-6 login_button"
        variant="warning" 
        type="submit" 
        onClick={handleSubmit}>
          Entrar
      </Button>
    </div>
    </div>
    </Row>
    </Form>
    <div className="mt-1">
      <div className="d-flex gap-1 mt-1 mb-3 justify-content-center">
      <span>Não tem uma conta?</span> <a className="fw-bold text_link" onClick={handleSignIn}>Cadastrar-se!</a>
      </div>
    </div>

    </Row>
    </Card>
    </Container>
    </>
    );
  }
  
  export default Login;
  