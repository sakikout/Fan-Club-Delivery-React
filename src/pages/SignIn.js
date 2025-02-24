import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputGroup, Card, Col, Form, Row, Button, Container, Image } from 'react-bootstrap';
import { FaRegUser, FaKey } from "react-icons/fa";
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

      setValidated(true);

      if (form.checkValidity() === false || !isValidEmail(formSignIn.email) || !isValidPassword(formSignIn.senha)) {
        event.stopPropagation();
        return;
        
      } else {

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
    
  
    return (
      <Container className="d-flex align-items-center justify-content-center">
      <Card className="p-5 login_container">
      <Row className="mx-auto">
      <Form noValidate validated={validated}>
        <Row className='mx-auto text-center'>
          <div className="brand_logo_container">
            <Image src={logo} className="brand_logo" roundedCircle />
          </div>
          <h4>Venha fazer parte disso!</h4>
        </Row>
        <Row className="mt-2 mb-3 justify-content-center">
          <div className="w-75 gap-3">
        <Form.Group className="mb-2" controlId="formGridName">
          <Form.Control 
            name = "nome"
            placeholder="Digite seu nome" 
            onChange={handleInputChange}
            required/>
            <Form.Control.Feedback type="invalid">
              Não pode estar vazio!
            </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-2" controlId="formGridLastName">
          <Form.Control 
            name = "sobrenome"
            placeholder="Digite seu sobrenome" 
            onChange={handleInputChange}
            required/>
            <Form.Control.Feedback type="invalid">
              Não pode estar vazio!
            </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-2" controlId="formGridEmail">
          <InputGroup hasValidation>
          <InputGroup.Text id="inputGroupText"><FaRegUser/></InputGroup.Text>
          <Form.Control 
            name = "email"
            type="email" 
            placeholder="SeuEmail@email.com" 
            onChange={handleInputChange}
            required/>
            <Form.Control.Feedback type="invalid">
              Insira um e-mail válido.
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
            onChange={handleInputChange}
            required/>
            <Form.Text id="passwordHelpBlock" muted>
            Sua senha deve ter pelo menos 8 caracteres e conter pelo menos um número, uma letra maiúscula, uma letra minúscula e um caractere especial. 
            </Form.Text>
            <Form.Control.Feedback type="invalid">
              Insira uma senha válida.
            </Form.Control.Feedback>
            </InputGroup>
        </Form.Group>

      <div className="d-flex mt-2 justify-content-center">
      <Button 
        className="fw-bold fs-6 signin_button"
        variant="warning" 
        type="submit" 
        onClick={handleSubmit}>
        Criar Conta
      </Button>
      </div>
      </div>
      </Row>
      </Form>
      </Row>
      <div className="mt-1">
      <div className="d-flex gap-1 mt-1 justify-content-center">
      <span>Já tem uma conta?</span> <a className="fw-bold text_link" onClick={() => navigate("/", { replace: false })}>Entrar!</a>
      </div>
    </div>
      </Card>
    </Container>
    );
  }
  
  export default SignIn;
  