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

const getTierColors = (tier) => {
  switch (tier) {
    case 'S': return 'bg-purple-900/50 text-purple-400 border-purple-500/50';
    case 'A': return 'bg-green-500/20 text-green-400 border-green-500/50';
    case 'B': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    case 'C': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
    case 'D': return 'bg-red-500/20 text-red-400 border-red-500/50';
    default: return 'bg-gray-800 text-gray-400 border-gray-700';
  }
};

const getRaceMeme = (position) => {
  if (position === 1) return "P1! Simply Lovely! 🏆";
  if (position <= 3) return "Podium! Not bad, not bad at all. 🍾";
  if (position <= 10) return "Points finish! Solid drive. 🏎️";
  if (position > 15) return "Box, box! We need to talk about that performance... 🤡";
  return "What just happened? GP2 engine! GP2! 📻";
};

export default function Home() {
  const [gameState, setGameState] = useState('DRAFT');
  const [playerSelection, setPlayerSelection] = useState({
    driver: null, car: null, principal: null, engineer: null, strategist: null
  });
  const [draftOptions, setDraftOptions] = useState({
    driver: [], car: [], principal: [], engineer: [], strategist: []
  });
  const [hasRolled, setHasRolled] = useState(false);
  const [streak, setStreak] = useState(0);
  const [lastRaceResult, setLastRaceResult] = useState(null);

  const getRandomThree = (array) => [...array].sort(() => 0.5 - Math.random()).slice(0, 3);

  const handleRollDraft = () => {
    setDraftOptions({
      driver: playerSelection.driver ? [] : getRandomThree(database.drivers),
      car: playerSelection.car ? [] : getRandomThree(database.cars),
      principal: playerSelection.principal ? [] : getRandomThree(database.principals),
      engineer: playerSelection.engineer ? [] : getRandomThree(database.engineers),
      strategist: playerSelection.strategist ? [] : getRandomThree(database.strategists)
    });
    setHasRolled(true);
  };

  const handleSelectCard = (type, item) => {
    const updatedSelection = { ...playerSelection, [type]: item };
    setPlayerSelection(updatedSelection);
    setHasRolled(false);
    setDraftOptions({ driver: [], car: [], principal: [], engineer: [], strategist: [] });

    if (Object.values(updatedSelection).every(val => val !== null)) {
      setGameState('RACING');
      setStreak(0);
      setLastRaceResult(null);
    }
  };

  const handleSimulateRace = () => {
    const result = runRace(playerSelection, database);
    setLastRaceResult(result);
    if (result.position === 1) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak === 24) setGameState('VICTORY');
    } else {
      setGameState('GAMEOVER');
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Modern Streak Skor Tabelası */}
        <div className="flex justify-between items-end border-b border-gray-800 pb-6 mb-8">
          <div>
            <h2 className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Current Session</h2>
            <h1 className="text-4xl font-black text-white italic tracking-tighter">24 - 0</h1>
          </div>
          
          <div className="text-right">
            <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Race Streak</span>
            <div className="bg-green-900/20 border border-green-500/50 px-6 py-2 rounded-lg">
              <span className="text-3xl font-black text-green-400">{streak}</span>
              <span className="text-green-600 font-bold ml-1">/ 24</span>
            </div>
          </div>
        </div>
        
        {/* DRAFT EKRANI */}
        {gameState === 'DRAFT' && (
          <div>
            {!hasRolled && <button onClick={handleRollDraft} className="bg-red-600 hover:bg-red-700 p-4 rounded-xl font-bold uppercase mb-6 w-full">Roll Draft</button>}
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
              {Object.keys(playerSelection).map((slot) => (
                <div key={slot} className="bg-gray-900 border border-gray-800 p-3 rounded-xl text-center">
                  <span className="text-[10px] text-gray-500 uppercase">{LABELS[slot]}</span>
                  {playerSelection[slot] ? (
                    <>
                      <span className={`block text-[10px] px-2 py-0.5 rounded border font-black mt-2 ${getTierColors(playerSelection[slot].tier)}`}>
                        {playerSelection[slot].tier}
                      </span>
                      <p className="font-bold text-xs mt-1">{playerSelection[slot].name || playerSelection[slot].team}</p>
                    </>
                  ) : <p className="text-gray-700 text-xs mt-2">Empty</p>}
                </div>
              ))}
            </div>

            {hasRolled && (
              <div className="space-y-6">
                {Object.keys(draftOptions).map((type) => (
                  draftOptions[type].length > 0 && (
                    <div key={type} className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                      <h4 className="text-xs font-black text-gray-400 mb-3">{LABELS[type]} Options</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {draftOptions[type].map((item) => (
                          <button key={item.id} onClick={() => handleSelectCard(type, item)} className="bg-gray-950 border border-gray-700 p-4 rounded-lg flex justify-between items-center hover:border-red-500">
                            <span className="font-bold text-sm">{item.name || item.team}</span>
                            <span className={`text-[10px] px-2 py-1 rounded border font-black ${getTierColors(item.tier)}`}>{item.tier}</span>
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
        
        {/* YARIŞ SONUÇLARI */}
        {gameState === 'RACING' && (
          <div className="space-y-6">
            <button onClick={handleSimulateRace} className="bg-green-600 hover:bg-green-700 w-full py-4 rounded-xl font-black uppercase text-lg">Simulate Race</button>
            
            {lastRaceResult && (
              <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
                <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-red-500/30 text-center font-bold text-red-500 italic">
                  "{getRaceMeme(lastRaceResult.position)}"
                </div>
                
                <h3 className="text-lg font-bold mb-4">Race Results</h3>
                {lastRaceResult.allResults?.slice(0, 5).map((pos, i) => (
                  <div key={i} className={`p-3 rounded-lg mb-2 flex justify-between ${pos.isPlayer ? 'bg-red-900/30 border border-red-500' : 'bg-gray-950'}`}>
                    <span>{i + 1}. {pos.isPlayer ? pos.name : "AI Driver"}</span>
                    <span className="text-gray-500 text-xs">{pos.team}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}