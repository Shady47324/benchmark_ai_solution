import React, { useEffect, useState } from 'react';

function History() {
  const [history, setHistory] = useState([]);

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

  const handleDelete = (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce prompt ?')) {
      fetch(`http://localhost:8080/api/history/${id}`, {
        method: 'DELETE',
      })
        .then(() => {
          setHistory(history.filter(item => item.id !== id));
        })
        .catch(err => console.error('Erreur de suppression :', err));
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-6 p-6 bg-white rounded shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-orange-600">🕘 Historique des Prompts</h2>
      <table className="w-full table-auto border-collapse border border-gray-300 text-sm">
        <thead className="bg-orange-100 text-gray-700">
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
            <tr key={item.id} className="hover:bg-gray-100 transition-all">
              <td className="border px-2 py-2 text-center">{item.id}</td>
              <td className="border px-2 py-2 whitespace-pre-wrap max-w-xs">{item.prompt}</td>
              <td className="border px-2 py-2 whitespace-pre-wrap max-w-md">{item.output}</td>
              <td className="border px-2 py-2 text-center">
                {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}
              </td>
              <td className="border px-2 py-2 text-center">
                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-3 py-1 rounded shadow"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
          {history.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center py-4 text-gray-500">Aucune donnée pour le moment.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default History;
