import React from 'react';
import { useUser } from "../components/context/UserProvider"
import { Container, ListGroup, Row, Col, Card } from 'react-bootstrap';
import { FaPen, FaKey, FaCreditCard, FaUserSlash } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import CustomNavBar from '../components/NavBar';


const SettingsPage = () => {
  const { user } = useUser();

    return (
      <>
      <CustomNavBar></CustomNavBar>
      <Container className="gap-2 mt-3 mb-3">
        <p className="fw-bold fs-4">Configurações</p>

      <ListGroup className="gap-2 mt-3 mb-3">
        <ListGroup.Item action><FaPen></FaPen> Alterar Nome</ListGroup.Item>
        <ListGroup.Item action><MdEmail></MdEmail> Alterar E-mail</ListGroup.Item>
        <ListGroup.Item action><FaKey></FaKey> Alterar Senha</ListGroup.Item>
        <ListGroup.Item action><FaCreditCard></FaCreditCard> Gerenciar Cartões no Aplicativo</ListGroup.Item>
        <ListGroup.Item action variant="danger">
          <FaUserSlash></FaUserSlash> Deletar Conta
        </ListGroup.Item>
      </ListGroup>

      <Card>
        <Card.Body>
        <Card.Title>titulo</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">corpo</Card.Subtitle>
        <Card.Text>
        </Card.Text>
        </Card.Body>
      </Card>
        
      </Container>
       </>
    );
  };
  
  export default SettingsPage;