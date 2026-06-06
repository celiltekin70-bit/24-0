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
  const [jokerCount, setJokerCount] = useState(3);
  const [streak, setStreak] = useState(0);
  const [lastRaceResult, setLastRaceResult] = useState(null);

  const getWeightedRandom = (array) => {
    const weights = { 'S': 5, 'A': 15, 'B': 25, 'C': 30, 'D': 25 };
    const weightedPool = [];
    array.forEach(item => {
      const weight = weights[item.tier] || 10;
      for (let i = 0; i < weight; i++) weightedPool.push(item);
    });
    return [weightedPool[Math.floor(Math.random() * weightedPool.length)]];
  };

  const handleRollDraft = () => {
    if (hasRolled && jokerCount <= 0) return;
    setDraftOptions({
      driver: playerSelection.driver ? [] : getWeightedRandom(database.drivers),
      car: playerSelection.car ? [] : getWeightedRandom(database.cars),
      principal: playerSelection.principal ? [] : getWeightedRandom(database.principals),
      engineer: playerSelection.engineer ? [] : getWeightedRandom(database.engineers),
      strategist: playerSelection.strategist ? [] : getWeightedRandom(database.strategists)
    });
    if (hasRolled) setJokerCount(prev => prev - 1);
    setHasRolled(true);
  };

  const handleSelectCard = (type, item) => {
    const updatedSelection = { ...playerSelection, [type]: item };
    setPlayerSelection(updatedSelection);
    let nextDraftOptions = { ...draftOptions, [type]: [] };
    const allFilled = Object.values(updatedSelection).every(val => val !== null);

    if (allFilled) {
      setDraftOptions({ driver: [], car: [], principal: [], engineer: [], strategist: [] });
      setGameState('RACING');
    } else {
      Object.keys(nextDraftOptions).forEach(key => {
        if (!updatedSelection[key]) nextDraftOptions[key] = getWeightedRandom(database[key + 's'] || database[key]);
      });
      setDraftOptions(nextDraftOptions);
    }
  };

  const handleRestartDraft = () => {
    setPlayerSelection({ driver: null, car: null, principal: null, engineer: null, strategist: null });
    setDraftOptions({ driver: [], car: [], principal: [], engineer: [], strategist: [] });
    setHasRolled(false);
    setJokerCount(3);
  };

  const handleSimulateRace = () => {
    let result = runRace(playerSelection, database);
    const luckFactor = Math.random();
    if (streak < 5 && luckFactor > 0.4) result.position = 1;

    setLastRaceResult(result);
    if (result.position !== 1) setGameState('GAMEOVER');
    else setStreak(prev => prev + 1);
  };

  const handleNextRace = () => {
    if (streak >= 24) setGameState('VICTORY');
    else handleSimulateRace();
  };

  const handleResetGame = () => {
    setStreak(0);
    setPlayerSelection({ driver: null, car: null, principal: null, engineer: null, strategist: null });
    setLastRaceResult(null);
    setHasRolled(false);
    setJokerCount(3);
    setDraftOptions({ driver: [], car: [], principal: [], engineer: [], strategist: [] });
    setGameState('DRAFT');
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end border-b border-gray-800 pb-6 mb-8">
          {/* YENİ SADE BAŞLIK */}
          <div>
            <h1 className="text-5xl font-black text-white italic tracking-tighter">24 - 0</h1>
          </div>
          
          <div className="text-right">
            <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Current Streak</span>
            <div className="bg-green-900/20 border border-green-500/50 px-6 py-2 rounded-lg">
              <span className="text-3xl font-black text-green-400">{streak}</span>
              <span className="text-green-600 font-bold ml-1">/ 24</span>
            </div>
          </div>
        </div>

        {gameState === 'DRAFT' && (
          <div className="animate-in fade-in duration-300">
             <div className="flex gap-2 mb-6">
              <button onClick={handleRollDraft} disabled={hasRolled && jokerCount <= 0} className={`flex-1 p-4 rounded-xl font-bold uppercase transition-all ${hasRolled && jokerCount <= 0 ? 'bg-gray-800 text-gray-500' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {!hasRolled ? "Initial Roll" : (jokerCount > 0 ? `Use Joker (${jokerCount})` : "No Jokers!")}
              </button>
              <button onClick={handleRestartDraft} className="p-4 rounded-xl bg-red-900/30 border border-red-500/50 text-red-400 font-bold hover:bg-red-900/50">Restart</button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
              {Object.keys(playerSelection).map((slot) => (
                <div key={slot} className="bg-gray-900 border border-gray-800 p-3 rounded-xl text-center">
                  <span className="text-[10px] text-gray-500 uppercase">{LABELS[slot]}</span>
                  {playerSelection[slot] ? (
                    <><span className={`block text-[10px] px-2 py-0.5 rounded border font-black mt-2 ${getTierColors(playerSelection[slot].tier)}`}>{playerSelection[slot].tier}</span><p className="font-bold text-xs mt-1">{playerSelection[slot].name || playerSelection[slot].team}</p></>
                  ) : <p className="text-gray-700 text-xs mt-2">Empty</p>}
                </div>
              ))}
            </div>
            
            {hasRolled && (
              <div className="space-y-4">
                {Object.keys(draftOptions).map((type) => (
                  draftOptions[type].length > 0 && (
                    <button key={type} onClick={() => handleSelectCard(type, draftOptions[type][0])} className="w-full bg-gray-900 p-4 rounded-xl border border-gray-700 flex justify-between items-center hover:border-red-500 transition-all">
                      <span className="font-bold text-sm text-gray-400">{LABELS[type]}: {draftOptions[type][0].name || draftOptions[type][0].team}</span>
                      <span className={`text-[10px] px-2 py-1 rounded border font-black ${getTierColors(draftOptions[type][0].tier)}`}>{draftOptions[type][0].tier}</span>
                    </button>
                  )
                ))}
              </div>
            )}
          </div>
        )}
        
        {gameState === 'RACING' && (
          <div className="animate-in fade-in duration-300">
            {!lastRaceResult ? (
              <button onClick={handleSimulateRace} className="bg-green-600 w-full py-8 rounded-2xl font-black uppercase text-2xl hover:bg-green-500 transition-all">Start Race</button>
            ) : (
              <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl">
                <div className="mb-6 p-6 bg-gray-800 rounded-2xl border border-red-500/30 text-center font-black text-xl text-red-500 italic">
                  "{getRaceMeme(lastRaceResult.position)}"
                </div>
                <button onClick={handleNextRace} className="w-full py-4 bg-blue-600 rounded-xl font-bold hover:bg-blue-500">Next Race 🏁</button>
              </div>
            )}
          </div>
        )}

        {(gameState === 'GAMEOVER' || gameState === 'VICTORY') && (
          <div className="text-center py-20 bg-gray-900 rounded-3xl border border-red-900">
            <h2 className="text-5xl font-black text-white mb-4">
               {gameState === 'GAMEOVER' ? 'GAME OVER' : 'CHAMPION!'}
            </h2>
            <p className="text-gray-400 mb-8 font-bold text-xl uppercase tracking-widest">
               Race Streak: {streak} / 24
            </p>
            <button onClick={handleResetGame} className="bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-gray-200">Restart Career</button>
          </div>
        )}
      </div>
    </main>
  );
}