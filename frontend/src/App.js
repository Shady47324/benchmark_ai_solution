import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import History from './components/History';
import ChatView from './components/ChatView';
import ChatList from './components/ChatList';
import PromptForm from './components/PromptForm';
import Result from './components/Result';
import Dashboard from './components/Dashboard';

function App() {
  return (
        
    <Router>
      
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/History" element={<History />} />
        <Route path="/chat/:chatId" element={<ChatView />} />
        <Route path="/chats" element={<ChatList chats={[]} />} />
        <Route path="/prompt-form" element={<PromptForm />} />
        <Route path="/result" element={<Result />} />
        
      </Routes>
    </Router>
  );
}

export default App;
