import React, { useState } from 'react';
import { Container, Row, Col, Button, Modal } from 'react-bootstrap';
import { FaGithub, FaLinkedin } from "react-icons/fa";
import '../App.css';
import { nodeName } from 'jquery';

function FooterComponent(){
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const getYear = () => {
        return new Date().getFullYear();
    }

    return (
    <>

    <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Sobre nós</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <p>Nós somos um restaurante em funcionamento na cidade de <span className="fw-bold">João Monlevade - MG</span>, prontos para lhe oferecer a melhor experiência de sabor e entrega na região!</p>
            <p>Agora, sobre o site: ele está sendo desenvolvido apenas para um trabalho de faculdade. Você pode conferir detalhes sobre ele visitando meu <a href="https://github.com/sakikout" className="fw-bold no-decoration">Github</a>!</p></Modal.Body>
        <Modal.Footer>
          <Button variant="warning" onClick={handleClose}>
            Entendi!
          </Button>
        </Modal.Footer>
      </Modal>


    <footer className="app-footer mt-5">
     <Container>
        <Row className="justify-content-center">
        <Col className="md-12 text-center">
        <h5 className="footer-heading fw-bold mt-3">
            <a href="#" className="footer-logo">Fã Clube Delivery</a>
        </h5>
        <p className="menu">
            <a href="#" className="menu-text m-1">Home</a>
            <a onClick={handleShow} className="menu-text m-1">About</a>
        </p>

        <ul className="footer-social list-unstyled d-flex justify-content-center align-items-center">
            <li className="m-1"><a href="https://github.com/sakikout" target="_blank" data-toggle="tooltip" data-placement="top" title data-original-title="Github" className="footer-icons" rel="noreferrer"><FaGithub size={25}></FaGithub></a></li>
            <li className="m-1"><a href="https://www.linkedin.com/in/beatriz-evelyn-dalfior-994b04209/" target="_blank" data-toggle="tooltip" data-placement="top" title data-original-title="LinkedIn" className="footer-icons" rel="noreferrer"><FaLinkedin size={25}></FaLinkedin></a></li>
        </ul>

        </Col>
        </Row>
        <Row className="mt-3">
        <Col className="md-12 text-center">
        <p className="copyright">
        Copyright ©{getYear()} All rights reserved
        </p>
        </Col>
        </Row>
     </Container>
     </footer>
    </>
    );

}

export default FooterComponent;