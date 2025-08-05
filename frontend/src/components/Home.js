import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PromptForm from './PromptForm';
import Result from './Result';



function Home() {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [resultData, setResultData] = useState(null); // Stocke l'objet complet
  const navigate = useNavigate();

  // On reçoit maintenant tout l'objet { output, language, errors, corrections }
  const handleResponse = (response) => {
    setPrompt(response.prompt); // Tu peux garder le prompt pour l'afficher
    setResultData(response);    // Stocke tout : output, language, etc.
    
    // Si un nouveau chat a été créé, naviguer vers ce chat
    if (response.chatId) {
      navigate(`/chat/${response.chatId}`);
    }
  };

 return (
  <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">

    <main className="flex-1 p-6 overflow-y-auto max-h-screen relative">
      <div className="max-w-4xl mx-auto w-full">
        <PromptForm onResponse={handleResponse} chatId={selectedChatId} />

        {/* Bloc Prompt */}
        {prompt && (
          <section className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow p-4">
            <h3 className="text-gray-700 dark:text-gray-200 font-semibold mb-2">🧠 Prompt :</h3>
            <pre className="text-sm whitespace-pre-wrap font-mono text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
              {prompt}
            </pre>
          </section>
        )}

        {/* Bloc Résultat IA */}
        {resultData && (
          <section
            className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow p-4 overflow-y-auto max-h-[70vh]"
            aria-label="Réponse IA"
          >
            <h3 className="text-indigo-600 dark:text-indigo-400 font-semibold mb-2">🤖 Réponse IA :</h3>
            <Result resultData={resultData} />
          </section>
        )}
      </div>
    </main>
  </div>
);
}
export default Home;
