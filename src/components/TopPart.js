import React, { useState, useEffect } from 'react';
import { InputGroup, Button, Form, FloatingLabel, Col, Row, Container, ListGroup} from 'react-bootstrap';
import '../App.css';
import FirestoreService from '../services/firestore';
import { FaMapMarkerAlt } from "react-icons/fa";
import { useUser } from "./context/UserProvider";
import { useCart } from "./context/CartProvider";

const firestoreService = new FirestoreService();

function TopPart(props){
    const { userData } = useUser();
    const { feePrice, setFeePrice, setDeliveryTime } = useCart();
    const [ addressInput, setAddress ] = useState("");
    const [ regions, setRegions ] = useState([]);
    const [ selectedRegion, setSelectedRegion ] = useState("");
    const [ deliveryTime, setDeliveryTimeString ] = useState("");
    const [ prepTimeString, setPrepTimeString ] = useState("");
    const [ userRegion, setUserRegion ]= useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                const regions_db = await firestoreService.getRegionsFromDatabase();
                setRegions(regions_db);
    
                if (userData?.regionId) {
                    const user_region = regions_db.find(region => String(region.id) === userData.regionId);
                    
                    if (user_region) {
                        setUserRegion(user_region.name);
                        setDeliveryTime(user_region.prepTime, user_region.deliveryTime);
                        setDeliveryTimeString(`${user_region.deliveryTime} minutos`);
                        setPrepTimeString(`${user_region.prepTime} minutos`);
                        setFeePrice(user_region.feePrice);
                    } else {
                        console.warn("Região do usuário não encontrada.");
                    }
                }
            } catch (error) {
                alert("Erro ao carregar regiões: " + error.message);
            }
        }
    
        fetchData();
    }, [userData]);


    const handleChangeAddress = async () => {
        try {
            const region_updated = await firestoreService.updateUserAddress(
             addressInput,
             selectedRegion
            );
            
            if (region_updated){
                alert("Endereço atualizado!");
            }
           
        } catch (error) {
            alert(error.message);
        }

    }

    return (
      <>
      <Container className="gap-2 mt-3 mb-3">
      <Row>
        <Col xs={6}>
        <Form.Label className="fw-bold fs-4" 
        htmlFor="address">Endereço de Entrega</Form.Label>
        <InputGroup hasValidation>
         <InputGroup.Text><FaMapMarkerAlt/></InputGroup.Text>
        <Form.Control
            type="text"
            name="address"
            id="address"
            onChange={(e => setAddress(e.target.value))}
            placeholder='Insira sua localização atual'
        />
         </InputGroup>
        {   userData ?
        
        <Form.Text 
        className="fw-bold fs-6"
        id="address" muted> 
        Endereço atual: {userData.address} - {userRegion}</Form.Text>
        : " "

        }
      <div className="gap-2 mt-2"> 
      <FloatingLabel controlId="floatingSelectPessoa" label="Região">
            <Form.Select 
                name = "regionId"
                aria-label="Floating label select"
                onChange={(e) => {setSelectedRegion(e.target.value)}}
                required>
                <option>Selecione uma região</option>
                { regions.map((region) => (
                    <option name = "regionId"
                            key={region.id} 
                            value={region.id}>
                        {region.name}
                    </option>
                ))}
            </Form.Select>
        </FloatingLabel>
        </div>
        <div className="d-flex gap-2 mt-2 mb-3">        
        <Button className="fw-bold fs-6"
                variant="warning"
                onClick={handleChangeAddress}>
            Salvar Endereço
        </Button>
        </div>
        </Col>

        <Col>
        <div className="gap-2 mt-1 mb-3"> 
        <span className="fw-bold fs-4" >Informações de Entrega</span> 
        <ListGroup>
            <ListGroup.Item>Taxa de Entrega: <span className="fw-bold fs-6">R${feePrice}</span></ListGroup.Item>
            <ListGroup.Item>Tempo de Entrega: <span className="fw-bold fs-6">{deliveryTime}</span></ListGroup.Item>
            <ListGroup.Item>Tempo de Preparo: <span className="fw-bold fs-6">{prepTimeString}</span></ListGroup.Item>
        </ListGroup>
        </div>
        </Col>
      </Row>
      </Container>
    </>
    );

}

export default TopPart;