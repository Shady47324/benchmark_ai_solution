import React, { useEffect, useState } from 'react';
import { useNotification } from './Notification';
import { useConfirmationModal } from './ConfirmationModal';

function History() {
  const [history, setHistory] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const { showNotification, NotificationComponent } = useNotification();
  const { showConfirmation, ConfirmationModalComponent } = useConfirmationModal();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = () => {
    fetch('http://localhost:8080/api/history')
      .then(res => res.json())
      .then(data => setHistory(data))
      .catch(error => {
        console.error('Erreur lors du chargement de l’historique :', error);
      });
  };

  const handleDelete = async (id) => {
    const item = history.find(h => h.id === id);
    const promptPreview = item?.prompt?.substring(0, 80) + (item?.prompt?.length > 80 ? '...' : '');
    const outputPreview = item?.output?.substring(0, 100) + (item?.output?.length > 100 ? '...' : '');
    const timestamp = item?.timestamp ? new Date(item.timestamp).toLocaleString() : 'Date inconnue';
    
    // Utilisation de la modale de confirmation élégante
    const confirmed = await showConfirmation({
      title: 'Supprimer le prompt',
      message: `Êtes-vous sûr de vouloir supprimer ce prompt de l'historique ?\n\n📝 Prompt :\n"${promptPreview}"\n\n🤖 Réponse :\n"${outputPreview}"\n\n📅 Date : ${timestamp}\n\nCette action est irréversible et ne peut pas être annulée.`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      type: 'danger'
    });

    if (!confirmed) return;

    setDeletingId(id);
    
    try {
      const response = await fetch(`http://localhost:8080/api/history/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      setHistory(history.filter(item => item.id !== id));
      showNotification('success', 'Prompt supprimé avec succès', 4000);
    } catch (error) {
      console.error('Erreur de suppression :', error);
      
      let errorMessage = 'Erreur lors de la suppression du prompt';
      if (error.message.includes('404')) {
        errorMessage = 'Prompt introuvable ou déjà supprimé';
      } else if (error.message.includes('403')) {
        errorMessage = 'Vous n\'avez pas les permissions pour supprimer ce prompt';
      } else if (error.message.includes('500')) {
        errorMessage = 'Erreur serveur. Veuillez réessayer plus tard';
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet';
      }
      
      showNotification('error', errorMessage, 6000);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <NotificationComponent />
      <ConfirmationModalComponent />
      <div className="max-w-5xl mx-auto mt-6 p-6 bg-white dark:bg-gray-800 rounded shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-orange-600 dark:text-orange-400">🕘 Historique des Prompts</h2>
      <table className="w-full table-auto border-collapse border border-gray-300 text-sm">
        <thead className="bg-orange-100 dark:bg-orange-900 text-gray-700 dark:text-gray-200">
          <tr>
            <th className="border px-3 py-2">ID</th>
            <th className="border px-3 py-2">Prompt</th>
            <th className="border px-3 py-2">Output</th>
            <th className="border px-3 py-2">Date</th>
            <th className="border px-3 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item) => (
            <tr key={item.id} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
              <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-center text-gray-900 dark:text-gray-100">{item.id}</td>
              <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 whitespace-pre-wrap max-w-xs text-gray-900 dark:text-gray-100">{item.prompt}</td>
              <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 whitespace-pre-wrap max-w-md text-gray-900 dark:text-gray-100">{item.output}</td>
              <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-center text-gray-900 dark:text-gray-100">
                {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-center">
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className={`text-sm font-medium px-3 py-1 rounded shadow transition ${
                    deletingId === item.id
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                  title={deletingId === item.id ? "Suppression en cours..." : "Supprimer ce prompt"}
                >
                  {deletingId === item.id ? (
                    <span className="flex items-center">
                      <svg className="w-3 h-3 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Suppression...
                    </span>
                  ) : (
                    'Supprimer'
                  )}
                </button>
              </td>
            </tr>
          ))}
          {history.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center py-4 text-gray-500 dark:text-gray-400">Aucune donnée pour le moment.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    </>
  );
}

export default History;
