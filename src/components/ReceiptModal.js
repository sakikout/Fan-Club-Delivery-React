import React, { useEffect, useState } from "react";
import { ListGroup, Modal } from "react-bootstrap";
import FirestoreService from "../services/firestore";
import { useUser } from "./context/UserProvider";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import FeedbackModal from "./FeedbackModal";

const firestoreService = new FirestoreService();

const ReceiptModal = (props) => {
    const { id, show, onHide } = props;
    const { user } = useUser();
    const [ orderInfo, setOrderInfo ] = useState({});
    const [ showModal, setShowModal ] = useState(false);

    useEffect(() => {
      const fetchOrder= async () => {
        if (user) {
          const userOrder = await firestoreService.getOrderById(id);
          setOrderInfo(userOrder);
        }
      };
  
      fetchOrder();
  
    }, [id, user]);

    const formatDate = (isoString) => {
        return format(new Date(isoString), "dd/MM/yyyy - HH:mm", { locale: ptBR });
    };

  return (
    <>
    <FeedbackModal
      id={id}
      name={orderInfo.order?.orderName}
      show={showModal}
      onHide={() => setShowModal(false)}>
    </FeedbackModal>

      <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
        <Modal.Header closeButton>
        <Modal.Title># { orderInfo.order ? <>{orderInfo.order.orderName} </>: " "}
        
        </Modal.Title>             
        </Modal.Header>
        <Modal.Body>
            <h5>Detalhes do Pedido</h5>
            { orderInfo.order ?
            ( <>
            <ListGroup variant="flush">
            {orderInfo.order.items.map((item, index) => (
                <ListGroup.Item key={index}>
                    <strong>{item.quantity}x {item.name}</strong> - R$ {(item.price * item.quantity)}
                    {item.availableAddons && item.availableAddons.length > 0 && (
                      <ul className="mt-1" style={{ fontSize: "0.9rem", color: "gray" }}>
                        {item.availableAddons.map((addon, i) => (
                          <li key={i}>{addon.name} (+ R$ {(addon.price)})</li>
                        ))}
                      </ul>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>

            <p className="mb-1">Endereço: {orderInfo.order.address} { orderInfo.order.complement ? <> - Complemento {orderInfo.order?.complement} </>: " "} {orderInfo.order.region ? <> - {orderInfo.order?.region}</> : " "}</p>
            <p className="mb-1">Forma de Pagamento: {orderInfo.order.paymentMethod}</p>
            {orderInfo.order.paymentMethod === "Dinheiro" && <p>Troco para: R$ {orderInfo.order.changeFor}</p>}
            <h5 className="mt-3">Total: R$ {orderInfo.order.total}</h5>
            <p className="text-muted">Entrega estimada para: {formatDate(orderInfo.estimatedDeliveryTime)} min</p>
            <p>Status: <span className="fw-bold">{orderInfo.status}</span></p>
            </>
            )
            : " "
            
            }
        </Modal.Body>
        <Modal.Footer >
        <span>Gostou do pedido?</span> <a className="fw-bold text_link" onClick={() => { setShowModal(true); }}>Deixe uma avaliação!</a>
        </Modal.Footer>
        </Modal>
    </>
  );
};

export default ReceiptModal;
