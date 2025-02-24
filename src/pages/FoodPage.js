import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Tab, Tabs, Container, Row, Col } from "react-bootstrap";
import FoodTile from "../components/FoodTile";

const FoodPage = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "foods"));
        const foodList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFoods(foodList);

        const uniqueCategories = [...new Set(foodList.map((food) => food.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Erro ao buscar comidas:", error);
      }
    };

    fetchFoods();
  }, [foods]);

  return (
    <Container>
      <Tabs 
      defaultActiveKey={categories[0]} 
      className="mb-3 fw-bold fs-5">
        {categories.map((category) => (
          <Tab 
          eventKey={category} 
          title={category} 
          key={category}>
            <Row>
              {foods
                .filter((food) => food.category === category)
                .map((food) => (
                  <Col key={food.id} md={4} className="mb-3">
                    <FoodTile
                        key={food.id}
                        id={food.id}
                        name={food.name} 
                        description={food.description} 
                        price={food.price} 
                        imagepath={food.imagePath} 
                        availableaddons={food.availableAddons}
                        > 
                    </FoodTile>
                  </Col>
                ))}
            </Row>
          </Tab>
        ))}
      </Tabs>
    </Container>
  );
};

export default FoodPage;
