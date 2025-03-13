import { getFirestore, collection, addDoc, 
        getDocs, doc, getDoc, updateDoc, deleteDoc, setDoc,
        query, where, orderBy, arrayUnion, onSnapshot } from 'firebase/firestore';
import { getAuth, updatePassword } from 'firebase/auth';

class FirestoreService {
  constructor() {
    this.db = getFirestore();
    this.auth = getAuth();
  }

  async addFoodsToDatabase(foodList) {
    const foodsRef = collection(this.db, 'foods');
    for (const food of foodList) {
      await addDoc(foodsRef, food.toMap());
    }
    console.log("Todas as comidas foram adicionadas!");
  }

  async getFoodsFromDatabase() {
    try {
      const foodsRef = collection(this.db, 'foods');
      const querySnapshot = await getDocs(foodsRef);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error("Erro ao buscar comidas no catálogo:", e);
      return [];
    }
  }

  async saveOrderToDatabase(receipt, prepTime, deliveryTime) {
    const ordersRef = collection(this.db, 'orders');
    const user = this.auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    try {
      const orderRef = await addDoc(ordersRef, {
        userId: user.uid,
        data: new Date().toISOString(),
        estimatedDeliveryTime: new Date(Date.now() + (prepTime + deliveryTime) * 60000).toISOString(),
        order: receipt,
        status: "Recebendo pedido"
      });
      return orderRef;

    } catch(e) {
      console.error("Erro ao salvar pedido: ", e);
      return {};
    }

  }

  async getOrderById(orderId) {
    const user = this.auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    const orderRef = doc(this.db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);

    if (orderSnap.exists()) {
        const orderData = orderSnap.data();
        return orderData;
      } else {
        console.log("Pedido não encontrado.");
        return [];
      }
  }

  async getUserOrders() {
    const user = this.auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    try {
      const ordersRef = collection(this.db, 'orders');
      const q = query(ordersRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
  
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    } catch (e) {
      console.error("Erro ao buscar pedidos do usuário:", e);
      return [];
    }

  }

  async updateOrderStatus(orderId, newStatus) {
    const orderRef = doc(this.db, 'orders', orderId);

    try {
    await updateDoc(orderRef, { status: newStatus });

    const orderDoc = await getDoc(orderRef);
    const userId = orderDoc.data().user;
    this.sendNotification(userId, "Atualização de Pedido", `Seu pedido agora está ${newStatus}!`);

    } catch (e) {
      console.error("Erro ao atualizar status do pedido:", e);

    }
  
  }

  async getUserCards() {
    try {
        const user = this.auth.currentUser;
        if (!user) return [];
    
        const userRef = doc(this.db, "users", user.uid);
        const userSnap = await getDoc(userRef);
    
        if (userSnap.exists()) {
          const userData = userSnap.data();
          return userData.creditCards || [];
        } else {
          console.log("Usuário não encontrado.");
          return [];
        }
      } catch (error) {
        console.error("Erro ao buscar cartões:", error);
        return [];
      }
  };

  
  async getCardById(cardNumber) {
    try {
        const user = this.auth.currentUser;
        if (!user) return [];
    
        const userRef = doc(this.db, "users", user.uid);
        const userSnap = await getDoc(userRef);
    
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const existingCards = userData.creditCards || [];
      
          const cardSelected = existingCards.filter(card => card.cardNumber === cardNumber);

          return cardSelected;

        } else {
          console.log("Usuário não encontrado.");
          return [];
        }
      } catch (error) {
        console.error("Erro ao buscar cartão:", error);
        return [];
      }
  };

  async addCreditCard(cardData) {
    try {
      const user = this.auth.currentUser;
      if (!user || !cardData) {
        throw new Error("Usuário ou dados do cartão inválidos.");
      }
  
      const userRef = doc(this.db, "users", user.uid);
      const userSnap = await getDoc(userRef);
  
      if (!userSnap.exists()) {
        await setDoc(userRef, { creditCards: [cardData] });
        
      } else {
        await updateDoc(userRef, {
          creditCards: arrayUnion(cardData),
        });
      }
  
      console.log("Cartão adicionado com sucesso!");
      return true;
    } catch (error) {
      console.error("Erro ao adicionar cartão:", error);
      return false;
    }
  }

  async deleteCreditCard(cardNumber) {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        throw new Error("Usuário não autenticado.");
      }
  
      const userRef = doc(this.db, "users", user.uid);
      const userSnap = await getDoc(userRef);
  
      if (!userSnap.exists()) {
        throw new Error("Usuário não encontrado.");
      }
  
      const userData = userSnap.data();
      const existingCards = userData.creditCards || [];
  
      const updatedCards = existingCards.filter(card => card.cardNumber !== cardNumber);
  
      await updateDoc(userRef, { creditCards: updatedCards });
  
      console.log("Cartão removido com sucesso!");
      return true;
    } catch (error) {
      console.error("Erro ao remover cartão:", error);
      return false;
    }
  }

  async updateUserNameLastName(newName, newLastName) {
    const user = this.auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    try {
      await updateDoc(doc(this.db, 'users', user.uid), { name: newName, lastName:  newLastName, displayName: newName + " " + newLastName});
      console.log("Nome atualizado com sucesso!");

    } catch(e) {
      console.error("Erro ao atualizar nome: ", e);

    }
  }

  async updateUserEmail(newEmail) {
    const user = this.auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    try {
      await updateDoc(doc(this.db, 'users', user.uid), { email: newEmail });
      console.log("E-mail atualizado com sucesso!");

    } catch (e) {
      console.error("Erro ao atualizar e-mail: ", e);
    }
    
  }

  async updateUserPassword(newPassword) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error("Usuário não autenticado.");
  
      await updatePassword(user, newPassword);
      alert("Senha atualizada com sucesso!");
  
    } catch (error) {
      console.error("Erro ao atualizar senha: ", error);
      alert("Erro ao atualizar a senha. Faça login novamente e tente outra vez.");
    }
  };
  


  async updateUserAddress(newAddress, regionSelected, complement) {
    const user = this.auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    try {
      await updateDoc(doc(this.db, 'users', user.uid), { address: newAddress, regionId: regionSelected, complement: complement });
      console.log("Endereço atualizado com sucesso!");

    } catch (error) {
      console.error("Erro ao atualizar endereço: ", error);

    }
    
  }


  async deleteUserAccount() {
    const user = this.auth.currentUser;
    if (!user) return;
    const userRef = doc(this.db, 'users', user.uid);
    
    try {
      await deleteDoc(userRef);
      await user.delete();
      console.log("Conta deletada com sucesso!");

    } catch (e) {
      console.error("Erro ao deletar conta: ", e);
    }
  }

  async getRegionsFromDatabase() {
    try {
      const regionsRef = collection(this.db, 'regions');
      const querySnapshot = await getDocs(regionsRef);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    } catch (e) {
      console.error("Erro ao buscar regiões no catálogo: ", e);
      return [];

    }
  }

  getMessages(orderId, callback) {
    if (!orderId) throw new Error("Pedido não foi informado.");

    const user = this.auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");
    
    try {
    const messagesRef = collection(this.db, "chats", orderId, "messages");
    const q = query(messagesRef, orderBy("timestamp"));

    return onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(messages);
    });
    } catch (e) {
      console.error("Erro ao buscar mensagens: ", e);
      return [];
    }
    
  }

  async sendMessage(orderId, text, sender) {
    if (!orderId || !text) throw new Error("Pedido não foi informado ou mensagem está vazia.");

    const user = this.auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    try {
      const messagesRef = collection(this.db, "chats", orderId, "messages");
      await addDoc(messagesRef, {
        userId: user.uid,
        text,
        sender,
        timestamp: Date.now()
      });
    } catch (e) {
      console.error("Erro ao enviar mensagem: ", e);
    }

  }

  async sendFeedback(foodId, feedbackData){
    const user = this.auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    try {
      const foodRef = collection(this.db, "foods", foodId, "feedbacks");
      await addDoc(foodRef, feedbackData);

      console.log("Avaliação enviada com sucesso!");
    
    } catch (e) {
      console.error("Erro ao enviar avaliação: ", e);
    }

  }

  getFeedbacks(foodId, callback) {
    if (!foodId) throw new Error("Item não foi informado.");

    const user = this.auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");
    
    try {
    const feedbacksRef = collection(this.db, "foods", foodId, "feedbacks");
    const q = query(feedbacksRef, orderBy("timestamp"));

    return onSnapshot(q, (querySnapshot) => {
      const feedbacks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(feedbacks);
    });
    } catch (e) {
      console.error("Erro ao buscar feedbacks: ", e);
      return [];
    }
    
  }

  async getUserFeedback(foodId) {
    if (!foodId) throw new Error("Item não foi informado.");

    const user = this.auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");
    
    try {
    const feedbacksRef = collection(this.db, "foods", foodId, "feedbacks");
    const q = query(feedbacksRef,  where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.exists()) {
      const queryData = querySnapshot.data();
      return queryData;
    } else {
      return null;
    }

    } catch (e) {
      console.error("Erro ao buscar feedbacks: ", e);
      return [];
    }
    
  }


}

export default FirestoreService;
