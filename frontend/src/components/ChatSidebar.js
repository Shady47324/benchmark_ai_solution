import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ChatSidebar({ currentChatId, onChatSelect }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newChatTitle, setNewChatTitle] = useState('');
  const [showNewChatForm, setShowNewChatForm] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchChats();
  }, []);

  // Rafraîchir les chats toutes les 5 secondes pour voir les nouveaux messages
  useEffect(() => {
    const interval = setInterval(() => {
      fetchChats();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/chats');
      setChats(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = async (e) => {
    e.preventDefault();
    if (!newChatTitle.trim()) return;

    try {
      const response = await axios.post('http://localhost:8080/api/chats', {
        title: newChatTitle
      });
      
      setChats(prev => [response.data, ...prev]);
      setNewChatTitle('');
      setShowNewChatForm(false);
      
      // Naviguer vers le nouveau chat
      navigate(`/chat/${response.data.id}`);
      if (onChatSelect) {
        onChatSelect(response.data);
      }
    } catch (error) {
      console.error('Erreur lors de la création du chat:', error);
    }
  };

  const deleteChat = async (chatId, e) => {
    e.stopPropagation();
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce chat ?')) return;

    try {
      await axios.delete(`http://localhost:8080/api/chats/${chatId}`);
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      
      // Si on supprime le chat actuel, naviguer vers la page d'accueil
      if (currentChatId === chatId) {
        navigate('/');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du chat:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Aujourd\'hui';
    } else if (diffDays === 2) {
      return 'Hier';
    } else if (diffDays <= 7) {
      return `Il y a ${diffDays - 1} jours`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  if (loading) {
    return (
      <div className={`${isCollapsed ? 'w-16' : 'w-80'} bg-gray-50 border-r border-gray-200 p-4 transition-all duration-300`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-80'} bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          {!isCollapsed && <h2 className="text-lg font-semibold text-gray-800">Mes Chats</h2>}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-gray-500 hover:text-gray-700 transition"
            title={isCollapsed ? "Développer" : "Réduire"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCollapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
            </svg>
          </button>
        </div>
        
        {!isCollapsed && (
          <>
            {!showNewChatForm ? (
              <button
                onClick={() => setShowNewChatForm(true)}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition"
              >
                + Nouveau Chat
              </button>
            ) : (
              <form onSubmit={createNewChat} className="space-y-2">
                <input
                  type="text"
                  value={newChatTitle}
                  onChange={(e) => setNewChatTitle(e.target.value)}
                  placeholder="Titre du chat"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition"
                  >
                    Créer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewChatForm(false);
                      setNewChatTitle('');
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>

      {/* Chat List */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-4">
          {chats.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>Aucun chat pour le moment</p>
              <p className="text-sm">Créez votre premier chat pour commencer</p>
            </div>
          ) : (
            <div className="space-y-2">
              {chats.map(chat => (
                <div
                  key={chat.id}
                  onClick={() => {
                    navigate(`/chat/${chat.id}`);
                    if (onChatSelect) {
                      onChatSelect(chat);
                    }
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition ${
                    currentChatId === chat.id
                      ? 'bg-orange-100 border border-orange-200'
                      : 'bg-white hover:bg-gray-100 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-800 truncate">
                        {chat.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          {formatDate(chat.updatedAt)}
                        </p>
                        {chat.messages && chat.messages.length > 0 && (
                          <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                            {chat.messages.length} message{chat.messages.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => deleteChat(chat.id, e)}
                      className="ml-2 p-1 text-gray-400 hover:text-red-500 transition"
                      title="Supprimer le chat"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ChatSidebar; 