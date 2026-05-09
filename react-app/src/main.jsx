import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import StopPage from './pages/StopPage';
import MapWalkPage from './pages/MapWalkPage';
import IntroPage from './pages/IntroPage';
import './styles/main.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/stop/:id" element={<StopPage />} />
          <Route path="/map" element={<MapWalkPage />} />
          <Route path="/intro" element={<IntroPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
