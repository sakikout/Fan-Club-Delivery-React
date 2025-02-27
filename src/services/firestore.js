import { getFirestore, collection, addDoc, 
        getDocs, doc, getDoc, updateDoc, deleteDoc, setDoc,
        query, where, orderBy, arrayUnion } from 'firebase/firestore';
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

    const orderRef = await addDoc(ordersRef, {
      userId: user.uid,
      data: new Date().toISOString(),
      estimatedDeliveryTime: new Date(Date.now() + (prepTime + deliveryTime) * 60000).toISOString(),
      order: receipt,
      status: "Recebendo pedido"
    });
    return orderRef;
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

    const ordersRef = collection(this.db, 'orders');
    const q = query(ordersRef, where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async updateOrderStatus(orderId, newStatus) {
    const orderRef = doc(this.db, 'orders', orderId);
    await updateDoc(orderRef, { status: newStatus });

    const orderDoc = await getDoc(orderRef);
    const userId = orderDoc.data().user;
    this.sendNotification(userId, "Atualização de Pedido", `Seu pedido agora está ${newStatus}!`);
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

    await updateDoc(doc(this.db, 'users', user.uid), { name: newName, lastName:  newLastName, displayName: newName + " " + newLastName});
    console.log("Nome atualizado com sucesso!");
  }

  async updateUserEmail(newEmail) {
    const user = this.auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    await updateDoc(doc(this.db, 'users', user.uid), { email: newEmail });
    console.log("E-mail atualizado com sucesso!");
  }

  async updateUserPassword(newPassword) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error("Usuário não autenticado.");
  
      await updatePassword(user, newPassword);
      alert("Senha atualizada com sucesso!");
  
    } catch (error) {
      console.error("Erro ao atualizar senha:", error);
      alert("Erro ao atualizar a senha. Faça login novamente e tente outra vez.");
    }
  };
  


  async updateUserAddress(newAddress, regionSelected) {
    const user = this.auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    await updateDoc(doc(this.db, 'users', user.uid), { address: newAddress, regionId: regionSelected });
    console.log("Endereço atualizado com sucesso!");
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
      console.error("Erro ao deletar conta:", e);
    }
  }

  async getRegionsFromDatabase() {
    try {
      const regionsRef = collection(this.db, 'regions');
      const querySnapshot = await getDocs(regionsRef);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error("Erro ao buscar regiões no catálogo:", e);
      return [];
    }
  }

}

export default FirestoreService;
