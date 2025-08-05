import React, { useState } from 'react';
import axios from 'axios';

function PromptForm({ onResponse, chatId }) {
  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() && !code.trim()) return;

    setLoading(true);

    try {
      // Envoi du prompt et du code à l'API
      const requestBody = {
        prompt: prompt || 'Analyse et corrige ce code',
        code: code,
      };
      
      // N'ajouter chatId que s'il est défini (pas sur la page d'accueil)
      if (chatId) {
        requestBody.chatId = chatId;
      }
      
      const response = await axios.post('http://localhost:8080/api/prompts', requestBody);

      onResponse(response.data);
      setPrompt('');
      setCode('');
    } catch (error) {
      console.error("Erreur d'envoi :", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prompt (optionnel)
          </label>
          <textarea
            rows="3"
            placeholder="Décris ce que tu veux faire avec le code..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Code à analyser
          </label>
          <textarea
            rows="8"
            placeholder="Colle ton code ici..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full mt-4 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition"
      >
        {loading ? 'Analyse en cours...' : 'Analyser le code'}
      </button>
    </form>
  );
}

export default PromptForm;
