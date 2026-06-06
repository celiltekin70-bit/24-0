"use client";
import { useState } from 'react';
import database from '../driversAndCars.json';
import { runRace } from '../simulation';

// Sabitleri ve Yardımcı Fonksiyonları Bileşenin Dışına Alıyoruz
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

// Bileşenin Kendisi
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

  const handleResetGame = () => {
    setPlayerSelection({ driver: null, car: null, principal: null, engineer: null, strategist: null });
    setDraftOptions({ driver: [], car: [], principal: [], engineer: [], strategist: [] });
    setHasRolled(false);
    setStreak(0);
    setLastRaceResult(null);
    setGameState('DRAFT');
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Skor Tablosu */}
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

        {/* EKRANLAR (Draft, Racing, GameOver, Victory) buraya gelecek */}
        {/* Kodun geri kalanı buraya eklenecek... */}
      </div>
    </main>
  );
}