import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { UserProvider } from './components/context/UserProvider';
import Login from './pages/Login';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import { CartProvider } from './components/context/CartProvider';
import DeliveryHistory from './pages/HistoryPage';
import CheckoutPage from './pages/CheckoutPage';
import SettingsPage from './pages/SettingsPage';
import DeliveryProgress from './pages/DeliveryProgressPage';
import CartPage from './components/CartModal';

function App() {
  return (
    <UserProvider>
      <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login/>}/>
          <Route path="signIn" element={<SignIn/>}/>
          <Route path="home" element={<Home/>}/>
          <Route path="history" element={<DeliveryHistory/>}/>
          <Route path="checkout" element={<CheckoutPage/>}/>
          <Route path="settings" element={<SettingsPage/>}/>
          <Route path="progress" element={<DeliveryProgress/>}/>
        </Routes>
      </Router>
      </CartProvider>
    </UserProvider>
  );
}

export default App;