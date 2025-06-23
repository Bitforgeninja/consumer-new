import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Homepage';
import AddFunds from './pages/AddFunds';
import MarketPlay from './pages/MarketPlay';
import SingleDigit from './pages/SingleDigit';
import JodiDigit from './pages/JodiDigit';
import SinglePana from './pages/SinglePana';
import DoublePana from './pages/DoublePana';
import TriplePana from './pages/TriplePana';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import Header from './components/Header';
import BetsHistory from './pages/BetsHistory';
import WinHistory from './pages/WinHistory';
import CoinSettlements from './pages/CoinSettlements';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import Wallet from './pages/Wallet';
import Help from './pages/Help';
import GameRates from './pages/GameRates';
import PrivacyPolicy from './pages/PrivacyPolicy';
import MarketChart from './pages/MarketChart';
import HalfSangam from './pages/HalfSangam';
import FullSangam from './pages/FullSangam';
import ResetPasswordPage from './pages/ResetPassword';
import ForgotPassword from "./pages/ForgotPassword";
import Plays from './pages/Plays';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <>
              {/* Header likely contains the app name, updated to D7 Matka */}
              <Header />
              <HomePage />
            </>
          }
        />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Private Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/add-funds" element={<AddFunds />} />
          <Route path="/play/:marketName" element={<MarketPlay />} />
          <Route path="/market-chart" element={<MarketChart />} />
          <Route path="/bets-history" element={<BetsHistory />} />
          <Route path="/single-digit" element={<SingleDigit />} />
          <Route path="/jodi-digit" element={<JodiDigit />} />
          <Route path="/single-pana" element={<SinglePana />} />
          <Route path="/double-pana" element={<DoublePana />} />
          <Route path="/triple-pana" element={<TriplePana />} />
          <Route path="/win-history" element={<WinHistory />} />
          <Route path="/coin-settlements" element={<CoinSettlements />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/help" element={<Help />} />
          <Route path="/game-rates" element={<GameRates />} />
          <Route path="/half-sangam" element={<HalfSangam />} />
          <Route path="/full-sangam" element={<FullSangam />} />
          <Route path="/plays" element={<Plays />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
