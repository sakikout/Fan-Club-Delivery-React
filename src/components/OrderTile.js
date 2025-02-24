import React, {useState} from 'react';
import { Card } from 'react-bootstrap';
import { CiSquareMore } from "react-icons/ci";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ReceiptModal from './ReceiptModal';
import '../App.css';

function OrderTile(props){
    const { id, status, data, orderName } = props;
      const [modalShow, setModalShow] = useState(false);

    const formatDate = (isoString) => {
      return format(new Date(isoString), "dd/MM/yyyy - HH:mm", { locale: ptBR });
    };

    return (
    <>
    <Card>
    <Card.Header>{formatDate(data)}</Card.Header>
      <Card.Body>
        <Card.Title>Pedido: #{orderName}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">{status}</Card.Subtitle>
        <Card.Text>
        </Card.Text>
      </Card.Body>
      <CiSquareMore 
        className="icon_top me-2 pure_icon" 
        size={24}
        onClick={() => setModalShow(true)}/>
    </Card>

    
    <ReceiptModal
        id={id}
        show={modalShow}
        onHide={() => setModalShow(false)}>
      </ReceiptModal>
    </>
    );

}

export default OrderTile;