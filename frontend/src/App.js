import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import History from './components/History';
import ChatView from './components/ChatView';
import ChatList from './components/ChatList';
import PromptForm from './components/PromptForm';
import Result from './components/Result';
import Dashboard from './components/Dashboard';
import ChatSidebar from './components/ChatSidebar';

function App() {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <ChatSidebar 
          currentChatId={selectedChat?.id} 
          onChatSelect={setSelectedChat}
        />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <div className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/History" element={<History />} />
              <Route path="/chat/:chatId" element={<ChatView />} />
              <Route path="/chats" element={<ChatList chats={[]} />} />
              <Route path="/prompt-form" element={<PromptForm />} />
              <Route path="/result" element={<Result />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
