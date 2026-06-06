"use client";
import { useState } from 'react';
import database from '../driversAndCars.json';
import { runRace } from '../simulation';

const LABELS = {
  driver: "Driver",
  car: "Car",
  principal: "Team Principal",
  engineer: "Engineer",
  strategist: "Strategist"
};

// Renkleri tier değerine göre belirleyen yardımcı fonksiyon
const getTierColors = (tier) => {
  switch (tier) {
    case 'S': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    case 'A': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
    case 'B': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    case 'C': return 'bg-green-500/20 text-green-400 border-green-500/50';
    case 'D': return 'bg-red-500/20 text-red-400 border-red-500/50';
    default: return 'bg-gray-800 text-gray-400 border-gray-700';
  }
};

export default function Home() {
  // ... (diğer state'ler aynı kalıyor)

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Üst Başlık (Kodunuzun geri kalanı aynı) */}
        
        {/* DRAFT EKRANI */}
        {gameState === 'DRAFT' && (
          <div>
            {/* ... Roll Draft butonu ... */}

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
              {Object.keys(playerSelection).map((slot) => (
                <div key={slot} className="bg-gray-900 border border-dashed border-gray-800 p-3 rounded-xl text-center min-h-[100px] flex flex-col justify-center items-center">
                  <span className="text-[10px] font-bold text-gray-500 uppercase mb-2">{LABELS[slot]}</span>
                  {playerSelection[slot] ? (
                    <>
                      <span className={`text-[10px] px-2 py-0.5 rounded border font-black mb-2 ${getTierColors(playerSelection[slot].tier)}`}>
                        {playerSelection[slot].tier}
                      </span>
                      <p className="font-bold text-xs text-gray-200">{playerSelection[slot].name || playerSelection[slot].team}</p>
                    </>
                  ) : <span className="text-gray-700 text-xs">Empty</span>}
                </div>
              ))}
            </div>

            {hasRolled && (
              <div className="space-y-6">
                {Object.keys(draftOptions).map((type) => (
                  draftOptions[type].length > 0 && (
                    <div key={type} className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                      <h4 className="text-xs font-black text-gray-400 uppercase mb-3">{LABELS[type]} Options</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {draftOptions[type].map((item) => (
                          <button key={item.id} onClick={() => handleSelectCard(type, item)} 
                            className="bg-gray-950 hover:border-red-500 border border-gray-700 p-4 rounded-lg text-left flex justify-between items-center transition-all">
                            <span className="font-bold text-sm">{item.name || item.team}</span>
                            {/* Renkli Tier Etiketi */}
                            <span className={`text-[10px] px-2 py-1 rounded border font-black ${getTierColors(item.tier)}`}>
                              {item.tier}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        )}

        {/* Yarış ekranı ve diğer kısımları yukarıdaki mantıkla güncelleyebilirsin... */}
      </div>
    </main>
  );
}