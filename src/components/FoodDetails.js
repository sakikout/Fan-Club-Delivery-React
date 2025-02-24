import React, { useState, useEffect } from 'react';
import { Image, Button, Modal, ListGroup, Form, Row } from 'react-bootstrap';
import { useCart } from "./context/CartProvider";
import '../App.css';
import QuantitySelector from './QuantitySelector';

function FoodDetailsModal(props) {
    const { id, name, description, price, imagepath, availableaddons, show } = props;
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [obs, setObs] = useState(" ");

    const [selectedAddons, setSelectedAddons] = useState({});

    useEffect(() => {
      const initialState = availableaddons.reduce((acc, _, index) => {
          acc[index] = false;
          return acc;
      }, {});
      setSelectedAddons(initialState);

    }, []); 
  

    const handleAddonChange = (index) => {
      setSelectedAddons((prevState) => ({
        ...prevState,
        [index]: !prevState[index],
      }));

        console.log(selectedAddons);
    };

    const handleAddToCart = () => {
        if(quantity === 0){
            return;
        }

      const addons = availableaddons.filter((_, index) => selectedAddons[index]);

      addToCart({
          id,
          name,
          imagepath,
          price,
          quantity,
          addons,
          obs,
      });
  
      props.onHide();
  };

  const minusFunction = () => {
    if (quantity > 0){
        setQuantity((quantity - 1));
    } else {
        setQuantity(1);
    }
  }

    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                
            </Modal.Header>
            <Modal.Body>
              <Row className="d-flex justify-content-center">
                <Image 
                  src={imagepath}
                  style={{ maxWidth: "250px", height: "auto", display: "block"}}
                  rounded fluid/>
                <div className="w-50 mt-3">
                  <h4>{name}</h4>
                  <p className="fs-5">R${price}</p>
                  <p>{description}</p>
                  <QuantitySelector 
                    minusfunction = {minusFunction}
                    plusfunction = {(e) => setQuantity((quantity + 1))}
                    quantity={quantity}></QuantitySelector>
                </div>
                </Row>
                <Row className="m-3">
                <h5>Adicionais</h5>
                <ListGroup variant="flush" >
                    {availableaddons.map((addon, index) => (
                        <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                            <div>
                                <Form.Check
                                    type="checkbox"
                                    label={`${addon.name} - R$${addon.price}`}
                                    checked={selectedAddons[index] || false}
                                    onChange={() => handleAddonChange(index)}
                                />
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
                </Row>
            <Row className="m-3">
              <h5>Observações</h5>
                <Form.Control
                    as="textarea"
                    placeholder='Escreva aqui observações que achar pertinentes para o pedido.'
                    onChange={(e) => setObs(e.target.value)}
                />
            </Row>  
            </Modal.Body>
            <Modal.Footer>
                <Button variant="warning" onClick={handleAddToCart}>
                    Adicionar ao carrinho
                </Button>
                <Button variant="outline-danger" onClick={props.onHide}>
                    Fechar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default FoodDetailsModal;
