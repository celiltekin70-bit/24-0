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
    setDraftOptions({
      driver: playerSelection.driver ? [] : getWeightedRandom(database.drivers),
      car: playerSelection.car ? [] : getWeightedRandom(database.cars),
      principal: playerSelection.principal ? [] : getWeightedRandom(database.principals),
      engineer: playerSelection.engineer ? [] : getWeightedRandom(database.engineers),
      strategist: playerSelection.strategist ? [] : getWeightedRandom(database.strategists)
    });
    setHasRolled(true);
  };

  const handleSelectCard = (type, item) => {
    const updatedSelection = { ...playerSelection, [type]: item };
    setPlayerSelection(updatedSelection);
    
    // Tüm slotlar doldu mu kontrolü
    if (Object.values(updatedSelection).every(val => val !== null)) {
      setGameState('RACING');
      setHasRolled(false);
      setDraftOptions({ driver: [], car: [], principal: [], engineer: [], strategist: [] });
    } else {
      // Bir kart seçince o tipin seçeneklerini temizle ama draft modunda kal
      setDraftOptions(prev => ({ ...prev, [type]: [] }));
    }
  };

  const handleSimulateRace = () => {
    const result = runRace(playerSelection, database);
    setLastRaceResult(result);
    if (result.position === 1) {
      setStreak(prev => prev + 1);
      if (streak + 1 >= 24) setGameState('VICTORY');
    } else {
      setGameState('GAMEOVER');
    }
  };

  const handleResetForNextRace = () => {
    setPlayerSelection({ driver: null, car: null, principal: null, engineer: null, strategist: null });
    setLastRaceResult(null);
    setHasRolled(false);
    setGameState('DRAFT');
  };

  const handleResetGame = () => {
    setStreak(0);
    handleResetForNextRace();
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
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

        {gameState === 'DRAFT' && (
          <div>
            <button onClick={handleRollDraft} className="bg-red-600 hover:bg-red-700 p-4 rounded-xl font-bold uppercase mb-6 w-full transition-all">
              {hasRolled ? "Roll Again" : "Roll Draft"}
            </button>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
              {Object.keys(playerSelection).map((slot) => (
                <div key={slot} className="bg-gray-900 border border-gray-800 p-3 rounded-xl text-center">
                  <span className="text-[10px] text-gray-500 uppercase">{LABELS[slot]}</span>
                  {playerSelection[slot] ? (
                    <>
                      <span className={`block text-[10px] px-2 py-0.5 rounded border font-black mt-2 ${getTierColors(playerSelection[slot].tier)}`}>{playerSelection[slot].tier}</span>
                      <p className="font-bold text-xs mt-1">{playerSelection[slot].name || playerSelection[slot].team}</p>
                    </>
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
          <div className="space-y-6">
            {!lastRaceResult && <button onClick={handleSimulateRace} className="bg-green-600 w-full py-4 rounded-xl font-black uppercase text-lg hover:bg-green-700 transition-all">Simulate Race</button>}
            {lastRaceResult && (
              <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
                <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-red-500/30 text-center font-bold text-red-500 italic">"{getRaceMeme(lastRaceResult.position)}"</div>
                <h3 className="text-lg font-bold mb-4">Race Results</h3>
                {lastRaceResult.allResults?.slice(0, 5).map((pos, i) => (
                  <div key={i} className={`p-3 rounded-lg mb-2 flex justify-between ${pos.isPlayer ? 'bg-red-900/30 border border-red-500' : 'bg-gray-950'}`}>
                    <span>{i + 1}. {pos.isPlayer ? pos.name : "AI Driver"}</span>
                    <span className="text-gray-500 text-xs">{pos.team}</span>
                  </div>
                ))}
                <button onClick={handleResetForNextRace} className="mt-6 w-full py-2 bg-blue-600 rounded-lg font-bold hover:bg-blue-700">Next Race</button>
              </div>
            )}
          </div>
        )}

        {(gameState === 'GAMEOVER' || gameState === 'VICTORY') && (
          <div className={`text-center py-20 bg-gray-900 rounded-3xl border ${gameState === 'GAMEOVER' ? 'border-red-900' : 'border-yellow-500'}`}>
            <h2 className={`text-5xl font-black ${gameState === 'GAMEOVER' ? 'text-red-500' : 'text-yellow-500'} mb-4`}>
              {gameState === 'GAMEOVER' ? 'GAME OVER' : 'CHAMPION!'}
            </h2>
            <button onClick={handleResetGame} className="bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-gray-200">Restart Career</button>
          </div>
        )}
      </div>
    </main>
  );
}