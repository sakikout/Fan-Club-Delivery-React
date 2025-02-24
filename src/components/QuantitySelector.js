import React from 'react';
import { Container, Row } from 'react-bootstrap';
import { FaMinus, FaPlus } from "react-icons/fa";
import '../App.css';

function QuantitySelector(props){
    const { quantity, plusfunction, minusfunction } = props;

    return (
    <>
    <Container className="gap-3">
        <FaMinus className='pure_icon' onClick={minusfunction}></FaMinus>
        <span className="m-4">{ quantity }</span>
        <FaPlus className='pure_icon' onClick={plusfunction}></FaPlus>
    </Container>
    </>
    );

}

export default QuantitySelector;