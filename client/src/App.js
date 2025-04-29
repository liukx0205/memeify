import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import MemeGenerator from './components/MemeGenerator';
import ResultPage from './pages/ResultPage'; 

function App() {
  return (
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<MemeGenerator />} />
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </div>
  );
}

export default App;
