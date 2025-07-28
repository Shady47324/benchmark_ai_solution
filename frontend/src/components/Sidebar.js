import React from 'react';

function Sidebar({ onChatSelect }) {
  return (
    <div className="w-64 bg-gray-100 p-4 border-r">
      <h2 className="text-lg font-bold mb-4">💬 Vos Conversations</h2>
      <button
        className="w-full bg-orange-500 text-white py-2 rounded mb-4 hover:bg-orange-600"
        onClick={() => onChatSelect(null)}
      >
        + Nouveau Chat
      </button>

      {/* Chat List - remplacé dynamiquement plus tard */}
      <ul className="space-y-2">
        <li>
          <button onClick={() => onChatSelect(1)} className="w-full text-left p-2 rounded hover:bg-orange-100">
            🔸 Chat #1
          </button>
        </li>
        <li>
          <button onClick={() => onChatSelect(2)} className="w-full text-left p-2 rounded hover:bg-orange-100">
            🔹 Chat #2
          </button>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
