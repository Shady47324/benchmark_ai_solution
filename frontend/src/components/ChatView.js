import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PromptForm from './PromptForm';
import Result from './Result';
import axios from 'axios';

function ChatView() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [isCode, setIsCode] = useState(false);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/chats/${chatId}`);
        setMessages(res.data.messages || []);
      } catch (error) {
        console.error('Erreur récupération chat:', error);
      }
    };
    fetchChat();
  }, [chatId]);

  const handleNewResponse = async (responseData) => {
    const newMsg = {
      prompt: responseData.originalCode,
      output: responseData.correctedCode,
      resultData: responseData
    };
    setMessages((prev) => [...prev, newMsg]);
    setIsCode(true);
  };

  return (
    <div className="p-4">
      <PromptForm chatId={chatId} onResponse={handleNewResponse} />
      {messages.map((msg, index) => (
        <Result key={index} resultData={msg.resultData} />
      ))}
    </div>
  );
}

export default ChatView;
