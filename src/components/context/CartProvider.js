import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [ cart, setCart ] = useState([]);
  const [ prepTime, setMinTime ] = useState();
  const [ deliveryTime, setMaxTime ] = useState();
  const [ feePrice, setFeePrice ] = useState();
  const [ payment, setPayment ] = useState("");
  const [ currentOrder, setCurrentOrder ] = useState("");

  const addToCart = (item) => {
    setCart((prevCart) => {
      // creating unique ID based on the food id and addons
      const itemIdentifier = item.id + "-" + item.addons.map(addon => addon.name).join(",");
  
      const existingItemIndex = prevCart.findIndex(cartItem => 
        cartItem.id + "-" + cartItem.addons.map(addon => addon.name).join(",") === itemIdentifier
      );
  
      if (existingItemIndex !== -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += item.quantity;
        return updatedCart;
      }
  
      return [...prevCart, item];
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const setDeliveryTime = (prepTime, deliveryTime) => {
    setMinTime(prepTime);
    setMaxTime(deliveryTime);
  }

  const clearCart = () => {
    setCart([]);
  };

  const clearOrderCache = () => {
    setCurrentOrder("");
  }


  return (
    <CartContext.Provider value={{ feePrice, prepTime, deliveryTime, cart, payment, setPayment, setFeePrice, currentOrder, setCurrentOrder, setDeliveryTime, addToCart, removeFromCart, clearCart, clearOrderCache}}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de um CartProvider");
  }
  return context;
};
