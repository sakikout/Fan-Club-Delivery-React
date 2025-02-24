import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

class AuthService {
  constructor() {
    this.auth = getAuth();
    this.db = getFirestore();
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }

  async signInWithEmailAndPassword(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      const userDoc = await getDoc(doc(this.db, "users", user.uid));

      if (userDoc.exists()) {
        return { uid: user.uid, email: user.email, ...userDoc.data() };
      } else {
        throw new Error("Usuário não encontrado no banco de dados.");
      }


    } catch (error) {
      throw new Error(error.code);

    }
  }

  async signUpWithEmailAndPassword (email, password, nome, sobrenome) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      const displayName = nome + " " + sobrenome;

      await setDoc(doc(this.db, "users", user.uid), {
        name: nome,
        lastName: sobrenome,
        displayName: displayName,
        email: email,
        creditCards: [],
        createdAt: new Date(Date.now()).toISOString(),
        address: " ",
        regionId: -1
      });
  
      return user;


    } catch (error) {

      throw new Error(error.code);

    }
  }

  async signOut() {
    try {
      await signOut(this.auth);
    } catch (error) {
      throw new Error(error.code);
    }
  }
}

export default AuthService;
