import React, { useEffect, useState } from "react";
import { Button, ListGroup, Modal, Image, Row } from "react-bootstrap";
import FirestoreService from "../services/firestore";
import { useUser } from "../components/context/UserProvider";
import ItemFeedback from "./ItemFeedback";

const firestoreService = new FirestoreService();

const FeedbackModal = (props) => {
    const { id, name, show, onHide } = props;
    const { user } = useUser();
    const [ itemsInfo, setItemsInfo ] = useState([]);

    useEffect(() => {
        const fetchOrderItems = async () => {
            if (user) {
              const userOrder = await firestoreService.getItemsFromOrder(id);
              setItemsInfo(userOrder);
            }
          };
      
        fetchOrderItems();
      
    }, []);
    
  function calculateSubtotalItem(item) {
      const itemTotal = item.price * item.quantity;
      
      const addonsTotal = item.addons
        ? item.addons.reduce((sum, addon) => sum + addon.price, 0) * item.quantity
        : 0;
    
      return itemTotal + addonsTotal;
  }
    

  return (
    <>
     <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>#{name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ListGroup>
          {itemsInfo.map((item) => (
              <ListGroup.Item 
                  key={item.id}
                  className="position-relative">
                <Row className="d-flex p-2">
                  <Image 
                    src={item.imagePath}
                    className="image-tile"
                    style={{ maxWidth: "200px", height: "auto", display: "block"}}
                  />
                    <div className="w-50">
                    <h5>{item.name}</h5>
                    <p>Preço unitário: R${item.price.toFixed(2)}</p>
                    <p>Quantidade: {item.quantity}</p>
                    {item.addons?.length > 0 && (
                      <p>
                        <span className="fw-bold">Adicionais:{" "}</span>
                          {item.addons.map((addon) => `${addon.name} (R$${addon.price.toFixed(2)})`).join(", ")}
                          </p>
                     )}
                      <p>Total: <span className="fw-bold">R${calculateSubtotalItem(item).toFixed(2)}</span></p>
                    </div>
                    <ItemFeedback foodId={item.id} orderId={id}></ItemFeedback>
                    </Row>
                  </ListGroup.Item>
            ))}
          </ListGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
    </>
  );
};

export default FeedbackModal;
