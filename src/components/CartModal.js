import React, { useEffect, useState} from "react";
import { useCart } from "./context/CartProvider";
import { Button, ListGroup, Modal, Row, Image } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import { FaRegTrashAlt } from "react-icons/fa";

function CartModal({ show, onHide }) {
  const { cart, removeFromCart, clearCart, feePrice } = useCart();
  const [ subtotal, setSubTotal ] = useState(0);
  const [ totalProducts, setTotalProducts ] = useState(0);
  const [ disabled, setDisabled ] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    function calculateSubtotal(cart) {
      return cart.reduce((total, item) => {
        const itemTotal = item.price * item.quantity;
        
        const addonsTotal = item.addons
          ? item.addons.reduce((sum, addon) => sum + addon.price, 0) * item.quantity
          : 0;
        
        return total + itemTotal + addonsTotal + feePrice;
      }, 0);
    }

    function calculateTotalProducts(cart) {
      return cart.reduce((total, item) => {
        const itemTotal = item.price * item.quantity;
        
        const addonsTotal = item.addons
          ? item.addons.reduce((sum, addon) => sum + addon.price, 0) * item.quantity
          : 0;
        
        return total + itemTotal + addonsTotal;
      }, 0);
    }
      if (cart){
        if (cart.length > 0){
          const value = calculateSubtotal(cart);
          const value_p = calculateTotalProducts(cart);
          setSubTotal(value);
          setTotalProducts(value_p);
          setDisabled(false);
        }
      }
      
    }, [cart]);

    function calculateSubtotalItem(item) {
      const itemTotal = item.price * item.quantity;
      
      const addonsTotal = item.addons
        ? item.addons.reduce((sum, addon) => sum + addon.price, 0) * item.quantity
        : 0;
    
      return itemTotal + addonsTotal;
    }
    

    const handleClearCart = () => {
      clearCart();
      setSubTotal(0);
    }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Seu Carrinho</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {cart.length === 0 ? (
          <p className="fs-5">O carrinho está vazio.</p>
        ) : (
          <>
            <ListGroup>
              {cart.map((item) => (
                <ListGroup.Item 
                  key={item.id}
                  className="position-relative">
                     <Button 
                      className="position-absolute top-0 end-0 m-2"
                      variant="outline-danger" 
                      onClick={() => removeFromCart(item.id)}>
                      <FaRegTrashAlt/>
                      </Button>
                <Row className="d-flex">
                <Image 
                  src={item.imagepath}
                  style={{ maxWidth: "200px", height: "auto", display: "block"}}
                  rounded/>
                  <div className="w-50">
                  <h5>{item.name}</h5>
                  <p>Preço unitário: R${item.price.toFixed(2)}</p>
                  <p>Quantidade: {item.quantity}</p>
                  {item.addons.length > 0 && (
                    <p>
                      <span className="fw-bold">Adicionais:{" "}</span>
                      {item.addons.map((addon) => `${addon.name} (R$${addon.price.toFixed(2)})`).join(", ")}
                    </p>
                  )}
                  <p>Total: <span className="fw-bold">R${calculateSubtotalItem(item).toFixed(2)}</span></p>
                  </div>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </>
        )}
      <div className="gap-2 m-2 text-end">
        <Row>
          <span className="fs-6">Total Produtos: R${totalProducts}</span>
        </Row>
        <Row>
          <span className="fs-6">Taxa de Entrega: R${feePrice}</span>
        </Row>
        <Row>
        <span className="fs-5 fw-bold">Subtotal: R${subtotal}</span>
        </Row>
      </div>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="warning" 
          onClick={() => navigate("/checkout")}
          disabled={disabled === true}>
          Finalizar Compra
        </Button>
        <Button variant="outline-danger" onClick={handleClearCart}>
          Limpar Carrinho
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CartModal;
