import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from "../components/context/UserProvider"
import { Container, Row, Col } from 'react-bootstrap';
import CustomNavBar from '../components/NavBar';
import FoodPage from './FoodPage';
import TopPart from '../components/TopPart';
import FooterComponent from '../components/Footer';


const Home = () => {
  const navigate = useNavigate();
  const { user, userData } = useUser();

  useEffect(() => {
    console.log(user);
    console.log(userData)
  }, []);

    return (
      <>
      { user ?
      <>
      <CustomNavBar></CustomNavBar>
      <Container>
        <TopPart address={user.address}></TopPart>
        <FoodPage></FoodPage>
       </Container>
       <FooterComponent></FooterComponent>
       </>
       : navigate("/")}
       </>
    );
  };
  
  export default Home;