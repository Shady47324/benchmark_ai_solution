import React, { useState } from 'react';
import axios from 'axios';

function PromptForm({ onResponse, chatId }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

 

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);

  const fullPrompt = prompt;

    try {
      // 3. Envoi du prompt complet à l'API
      const response = await axios.post('http://localhost:8080/api/llama', {
        prompt: fullPrompt,
        chatId,
      });

      onResponse({ output: response.data.output, prompt });
      setPrompt('');
    } catch (error) {
      console.error("Erreur d'envoi :", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <textarea
        rows="5"
        placeholder="Écris ton prompt ici..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full mt-4 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition"
      >
        {loading ? 'Chargement...' : 'Envoyer'}
      </button>
    </form>
  );
}

export default PromptForm;
