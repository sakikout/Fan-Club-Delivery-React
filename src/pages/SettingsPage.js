import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from "../components/context/UserProvider"
import { Container, Row, Col } from 'react-bootstrap';
import CustomNavBar from '../components/NavBar';


const SettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();

    return (
      <>
      <CustomNavBar></CustomNavBar>
      <Container className="gap-2 mt-3 mb-3">

        
      </Container>
       </>
    );
  };
  
  export default SettingsPage;