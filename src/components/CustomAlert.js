import React from 'react';
import {Alert } from 'react-bootstrap';

function CustomAlert(props) {
    const {title, variant, body, show, setShow } = props;

    return (
      <Alert
      className="custom-alert" 
      variant={variant} 
      show={show} 
      onClose={() => setShow(false)} 
      dismissible>
        <Alert.Heading>{title}</Alert.Heading>
        <p>
          {body}
        </p>
      </Alert>

    );
  
}

export default CustomAlert;