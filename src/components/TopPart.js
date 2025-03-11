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
    const [ complement, setComplement ] = useState("");
    const [ addressError, setAddressError ] = useState(false);
    const [ regionError, setRegionError ] = useState(false);
    const [ regions, setRegions ] = useState([]);
    const [ selectedRegion, setSelectedRegion ] = useState("");
    const [ deliveryTime, setDeliveryTimeString ] = useState("");
    const [ prepTimeString, setPrepTimeString ] = useState("");
    const [ userRegion, setUserRegion ]= useState("");
    const [ validated, setValidated ] = useState(true);

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
                console.alert("Erro ao carregar regiões: " + error.message);
            }
        }
    
        fetchData();
    }, [setDeliveryTime, setFeePrice, userData]);


    const handleInputChange = (event) => {
    const { name, value } = event.target;
    
    if (name === "address") {
        setAddress(value);
        const enderecoRegex = /^(Rua|Avenida)\s+[A-Za-zÀ-ÖØ-öø-ÿ\s]+,\s*\d+$/i;
        if (!enderecoRegex.test(value.trim())) {
            setAddressError(true);
        } else {
            setAddressError(false);
        }
    } 
    
    if (name === "regionId"){
        setSelectedRegion(value);

    }

    setValidated(!addressInput.trim() || !selectedRegion || selectedRegion === "-1");
    
    };
    

    const handleChangeAddress = async () => {
        if (!addressInput.trim()) {
            return alert("Por favor, preencha um endereço válido.");
        }

        if (!selectedRegion || selectedRegion === "-1"){
            return alert("Selecione uma região!");
        }

        try {
            const region_updated = await firestoreService.updateUserAddress(
             addressInput,
             selectedRegion,
             complement
            );
            
            console.alert("Endereço atualizado!");

            setRegionError(false);
            setAddressError(false);
           
        } catch (error) {
            console.alert(error.message);
        }

    }

    return (
      <>
      <Container className="gap-2 mt-3 mb-3">
      <Row>
        <Col xs={6}>
        <p className="fw-bold fs-4">Endereço de Entrega</p>
        <Row>
        <Form.Group as={Col} xs={9}>
        <InputGroup hasValidation>
         <InputGroup.Text><FaMapMarkerAlt/></InputGroup.Text>
        <Form.Control
            type="text"
            name="address"
            id="address"
            onChange={handleInputChange}
            placeholder='Insira sua rua e número'
            isInvalid={addressError}
        />
         </InputGroup>
        <Form.Text className="m-1" id="passwordHelpBlock" muted>
         Deve seguir o formato: Rua (ou Avenida) de Tal, 111
        </Form.Text>
        <br></br>
        {   userData ?
        
        <Form.Text 
        className="fw-bold fs-6"
        id="address" muted> 
        Endereço atual: {userData.address} - {userRegion}</Form.Text>
        : " "

        }
        <Form.Control.Feedback type="invalid">
            Informe um endereço válido.
        </Form.Control.Feedback>
        </Form.Group>
        <Form.Group as={Col} xs={3}>
        <Form.Control
            type="text"
            name="complement"
            id="complement"
            onChange={(e) => setComplement(e.target.value)}
            placeholder='Apto e nº, Casa'
        />
        </Form.Group>
        </Row>
    
      <div className="gap-2 mt-2"> 
      <FloatingLabel controlId="floatingSelectPessoa" label="Região">
            <Form.Select 
                name = "regionId"
                aria-label="Floating label select"
                onChange={handleInputChange}
                required
                isInvalid={regionError}>
                <option name = "regionId" 
                        value={-1}>Selecione uma região</option>
                { regions.map((region) => (
                    <option name = "regionId"
                            key={region.id} 
                            value={region.id}>
                        {region.name}
                    </option>
                ))}
            <Form.Control.Feedback type="invalid">
              Selecione uma região!
            </Form.Control.Feedback>
            </Form.Select>
        </FloatingLabel>
        </div>
        <div className="d-flex gap-2 mt-2 mb-3">        
        <Button className="fw-bold fs-6"
                variant="warning"
                onClick={handleChangeAddress}
                disabled={validated}>
            Salvar Endereço
        </Button>
        </div>
        </Col>

        <Col>
        <div className="gap-2 mt-1 mb-3"> 
        <span className="fw-bold fs-4" >Informações de Entrega</span> 
        <ListGroup>
            { feePrice ? 
            <ListGroup.Item>Taxa de Entrega: <span className="fw-bold fs-6">R${feePrice}</span></ListGroup.Item>
            : " "} 
            <ListGroup.Item>Tempo de Entrega: <span className="fw-bold fs-6">{deliveryTime}</span></ListGroup.Item>
            <ListGroup.Item>Tempo de Preparo: <span className="fw-bold fs-6">{prepTimeString}</span></ListGroup.Item>
        </ListGroup>
        { feePrice ? 
        <></>
        : <p className="text-muted p-1">Você precisa selecionar uma região para que possamos informar o tempo de preparo, a taxa e o tempo de entrega!</p>}
        </div>
        </Col>
      </Row>
      </Container>
    </>
    );

}

export default TopPart;