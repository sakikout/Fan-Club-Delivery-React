import React, { useState } from 'react';
import { useUser } from "../components/context/UserProvider";
import { useCart } from "../components/context/CartProvider";
import { useNavigate } from 'react-router-dom';
import { Container, Navbar, Button, Nav, Badge } from 'react-bootstrap';
import CartModal from "./CartModal";
import { FaShoppingCart, FaHome, FaHistory, FaCog, FaSignOutAlt } from "react-icons/fa";

function CustomNavBar() {
  const { logout } = useUser();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [showCart, setShowCart] = useState(false);

  /*<Navbar className="nav-custom shadow-sm" expand="lg" variant="dark" fixed="top"> */

  return (
    <>
      <Navbar className="nav-custom shadow-sm" expand="lg" variant="dark" fixed="top">
        <Container>
          <Navbar.Brand className="fs-4 fw-bold">Fã Clube Delivery</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse>
            <Nav className="me-auto fs-5">
              <Nav.Link onClick={() => navigate("/home")} className="mx-2">
                <FaHome className="me-1" /> Home
              </Nav.Link>
              <Nav.Link onClick={() => navigate("/history")} className="mx-2">
                <FaHistory className="me-1" /> Histórico
              </Nav.Link>
              <Nav.Link onClick={() => navigate("/progress")} className="mx-2">
                <FaShoppingCart className="me-1" /> Pedido Atual
              </Nav.Link>
              <Nav.Link onClick={() => navigate("/settings")} className="mx-2">
                <FaCog className="me-1" /> Configurações
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
          <Navbar.Collapse className="justify-content-end">
            <div className="d-flex gap-3">
              <Button variant="outline-light" className="fs-6" onClick={() => setShowCart(true)}>
                <FaShoppingCart className="me-2" /> Carrinho
                {
                  cart.length > 0 ?
                  <Badge bg="danger m-1">{cart.length}</Badge>
                  : " "
                }
              </Button>
              <Button variant="danger" className="fs-6" onClick={() => { logout(); navigate("/");}}>
                <FaSignOutAlt className="me-2" /> Sair
              </Button>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <CartModal show={showCart} onHide={() => setShowCart(false)} />
    </>
  );
}

export default CustomNavBar;
