import React, { useEffect, useState } from "react";
import { Button, Row, Col } from "react-bootstrap";
import FirestoreService from "../services/firestore";
import { useUser } from "../components/context/UserProvider";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";

const firestoreService = new FirestoreService();

const ItemFeedback = (props) => {
    const { orderId, foodId } = props;
    const { user } = useUser();
    const [ feedbackExists, setFeedbackExists] = useState(false);
    const [ hoverRating, setHoverRating ] = useState(0);

    useEffect(() => {
        const fetchFeedback = async () => {
            if (user) {
                const userFeedback = await firestoreService.getOrderFeedback(foodId, orderId);
                if (userFeedback?.orderId){
                    setFeedbackExists(true);
                }
            }
        };
          
        fetchFeedback();
          
    }, [feedbackExists, foodId, orderId, user]);

    const [ formFeedback, setFormFeedback ] = useState({
        rate: 5,
        feedback: "",
        orderId: orderId
    })

    const renderStars = () => {
        const ratingToDisplay = hoverRating || formFeedback.rate;
        const stars = [];
    
        for (let i = 1; i <= 5; i++) {
          if (ratingToDisplay >= i) {
            stars.push(
              <FaStar
                key={i}
                className="text-warning star"
                onMouseMove={(e) => handleMouseMove(e, i)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleRating(i)}
              />
            );
          } else if (ratingToDisplay >= i - 0.5) {
            stars.push(
              <FaStarHalfAlt
                key={i}
                className="text-warning star"
                onMouseMove={(e) => handleMouseMove(e, i)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleRating(i - 0.5)}
              />
            );
          } else {
            stars.push(
              <FaRegStar
                key={i}
                className="text-warning star"
                onMouseMove={(e) => handleMouseMove(e, i)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleRating(i)}
              />
            );
          }
        }
        return stars;
      };

    const handleRating = (newRating) => {
        setFormFeedback((prev) => ({ ...prev, rate: newRating }));
    };

    const handleMouseMove = (event, index) => {
        const { clientX, target } = event;
        const rect = target.getBoundingClientRect();
        const isHalf = clientX - rect.left < rect.width / 2;
    
        setHoverRating(isHalf ? index - 0.5 : index);
      };
    
    const handleMouseLeave = () => {
        setHoverRating(0);
      };

    const handleSubmit = async () => {
        try {
            const feedbackRef = await firestoreService.sendFeedback(foodId, formFeedback);
            alert("Obrigado pela sua avaliação!");
            setFeedbackExists(true);

        } catch (e) {
            console.error(e.message);

        }

    }


  return (
    <>
    <Row>
    <div className="d-flex justify-content-center">
        {renderStars()}
    </div>
    <div className="d-flex mb-1">
    <textarea
        className="form-control mt-3"
        placeholder="Deixe seu comentário..."
        value={formFeedback.feedback}
        onChange={(e) => setFormFeedback((prev) => ({ ...prev, feedback: e.target.value }))}
    />
    </div>
    <div className="d-flex gap-3 mt-2 justify-content-end align-items-center">
        { feedbackExists ?
            <span className="text-muted">Você já avaliou esse item.</span>
        : " "}
    <Button variant="warning" onClick={handleSubmit} disabled={feedbackExists}>
        Enviar Avaliação
    </Button>
    </div>
    </Row>
    </>
  );
};

export default ItemFeedback;
