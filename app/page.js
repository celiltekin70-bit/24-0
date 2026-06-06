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

// İstediğin renk paleti: S:Koyu Yeşil, A:Yeşil, B:Sarı, C:Turuncu, D:Kırmızı
const getTierColors = (tier) => {
  switch (tier) {
    case 'S': return 'bg-purple-900/50 text-emerald-400 border-emerald-500/50';
    case 'A': return 'bg-green-500/20 text-green-400 border-green-500/50';
    case 'B': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    case 'C': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
    case 'D': return 'bg-red-500/20 text-red-400 border-red-500/50';
    default: return 'bg-gray-800 text-gray-400 border-gray-700';
  }
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
        <div className="flex justify-between items-center border-b border-gray-800 pb-4 mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-red-500 tracking-wider">24 - 0</h1>
          <div className="bg-gray-900 border border-gray-800 px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] text-gray-400 uppercase font-bold">Streak</span>
            <span className="text-xl md:text-3xl font-black text-green-400 block">{streak} / 24</span>
          </div>
        </div>

        {gameState === 'DRAFT' && (
          <div>
            <div className="text-center mb-6">
              {!hasRolled && (
                <button onClick={handleRollDraft} className="w-full md:w-auto bg-red-600 hover:bg-red-700 py-4 px-8 rounded-xl font-bold uppercase tracking-wider">
                  Roll Draft
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
              {Object.keys(playerSelection).map((slot) => (
                <div key={slot} className="bg-gray-900 border border-dashed border-gray-800 p-3 rounded-xl text-center min-h-[100px] flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">{LABELS[slot]}</span>
                  {playerSelection[slot] ? (
                    <>
                      <span className={`text-[10px] px-2 py-0.5 rounded border font-black mt-1 ${getTierColors(playerSelection[slot].tier)}`}>
                        {playerSelection[slot].tier}
                      </span>
                      <p className="font-bold text-xs mt-1 text-gray-200">{playerSelection[slot].name || playerSelection[slot].team}</p>
                    </>
                  ) : <span className="text-gray-700 text-xs mt-1">Empty</span>}
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

        {gameState === 'RACING' && (
          <div className="flex flex-col md:grid md:grid-cols-3 gap-6">
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
              <h3 className="text-lg font-bold mb-4">Your Team</h3>
              <div className="space-y-2 text-sm">
                {Object.entries(playerSelection).map(([key, val]) => (
                  <p key={key}>
                    <span className="text-gray-500 block text-[10px] uppercase">{LABELS[key]}</span> 
                    {val.name || val.team}
                  </p>
                ))}
              </div>
              <button onClick={handleSimulateRace} className="w-full mt-6 bg-green-600 py-4 rounded-xl font-black uppercase">Simulate Race</button>
            </div>
            
            <div className="md:col-span-2 bg-gray-900 border border-gray-800 p-6 rounded-2xl">
              <h3 className="text-lg font-bold mb-4">Race Results</h3>
              {lastRaceResult?.allResults?.slice(0, 5).map((pos, i) => (
                <div key={i} className={`p-3 rounded-lg mb-2 flex justify-between ${pos.isPlayer ? 'bg-red-900/30 border border-red-500' : 'bg-gray-950'}`}>
                  <span>{i + 1}. {pos.isPlayer ? pos.name : "AI Driver"}</span>
                  <span className="text-gray-500 text-xs">{pos.team}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}