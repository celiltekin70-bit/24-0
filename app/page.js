"use client";
import { useState } from 'react';
import database from '../driversAndCars.json';
import { runRace } from '../simulation';

// Kelimelerin ekranda düzgün ve İngilizce görünmesi için sözlük
const LABELS = {
  driver: "Driver",
  car: "Car",
  principal: "Team Principal",
  engineer: "Engineer",
  strategist: "Strategist"
};

export default function Home() {
  // Oyunun genel aşaması: 'DRAFT', 'RACING', 'GAMEOVER', 'VICTORY'
  const [gameState, setGameState] = useState('DRAFT');
  
  // Oyuncunun seçtiği 5'li kadro
  const [playerSelection, setPlayerSelection] = useState({
    driver: null,
    car: null,
    principal: null,
    engineer: null,
    strategist: null
  });

  // O anki kura turunda ekrana gelen 3'er adet seçenekler
  const [draftOptions, setDraftOptions] = useState({
    driver: [],
    car: [],
    principal: [],
    engineer: [],
    strategist: []
  });

  const [hasRolled, setHasRolled] = useState(false);
  const [streak, setStreak] = useState(0);
  const [lastRaceResult, setLastRaceResult] = useState(null);

  // Havuzdan rastgele 3 benzersiz eleman seçen yardımcı fonksiyon
  const getRandomThree = (array) => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  // Kalan boş slotlar için kura çekme fonksiyonu
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

  // Ekrana gelen kartlardan birine tıklandığında çalışan fonksiyon
  const handleSelectCard = (type, item) => {
    const updatedSelection = { ...playerSelection, [type]: item };
    setPlayerSelection(updatedSelection);
    setHasRolled(false);
    setDraftOptions({ driver: [], car: [], principal: [], engineer: [], strategist: [] });

    // Eğer 5 slot da dolduysa yarış aşamasına geç
    if (
      updatedSelection.driver &&
      updatedSelection.car &&
      updatedSelection.principal &&
      updatedSelection.engineer &&
      updatedSelection.strategist
    ) {
      setGameState('RACING');
      setStreak(0);
      setLastRaceResult(null);
    }
  };

  // Yarışı simüle etme buotnu
  const handleSimulateRace = () => {
    const result = runRace(playerSelection, database);
    setLastRaceResult(result);

    if (result.position === 1) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak === 24) {
        setGameState('VICTORY');
      }
    } else {
      setGameState('GAMEOVER');
    }
  };

  // Oyunu tamamen sıfırlayıp baştan başlama
  const handleResetGame = () => {
    setPlayerSelection({ driver: null, car: null, principal: null, engineer: null, strategist: null });
    setDraftOptions({ driver: [], car: [], principal: [], engineer: [], strategist: [] });
    setHasRolled(false);
    setStreak(0);
    setLastRaceResult(null);
    setGameState('DRAFT');
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8 font-sans selection:bg-red-600">
      <div className="max-w-6xl mx-auto">
        {/* Üst Başlık ve Skor Tablosu */}
        <div className="flex justify-between items-center border-b border-gray-800 pb-6 mb-8">
          <h1 className="text-4xl font-extrabold tracking-wider text-red-500">24 - 0</h1>
          <div className="bg-gray-900 border border-gray-800 px-6 py-3 rounded-xl text-center">
            <span className="text-xs text-gray-400 block uppercase font-bold tracking-widest">Current Streak</span>
            <span className="text-3xl font-black text-green-400">{streak} / 24</span>
          </div>
        </div>

        {/* 1. KURA ÇEKME EKRANI (DRAFT) */}
        {gameState === 'DRAFT' && (
          <div>
            <div className="text-center mb-8">
              <p className="text-gray-400 text-lg mb-4">You must build the perfect team to win all 24 races.</p>
              {!hasRolled && (
                <button 
                  onClick={handleRollDraft}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg transition-all text-xl uppercase tracking-wider"
                >
                  Roll Draft
                </button>
              )}
            </div>

            {/* Seçilen Mevcut Takım Slotları */}
            <div className="grid grid-cols-5 gap-4 mb-12">
              {Object.keys(playerSelection).map((slot) => (
                <div key={slot} className="bg-gray-900 border-2 border-dashed border-gray-800 p-4 rounded-xl text-center min-h-[120px] flex flex-col justify-center items-center">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{LABELS[slot]}</span>
                  {playerSelection[slot] ? (
                    <div>
                      <span className="bg-red-500/10 text-red-400 text-xs px-2 py-1 rounded font-black mr-1">{playerSelection[slot].tier}</span>
                      <p className="font-bold text-sm text-gray-200 mt-1">{playerSelection[slot].name || playerSelection[slot].team}</p>
                    </div>
                  ) : (
                    <span className="text-gray-600 text-sm">Empty</span>
                  )}
                </div>
              ))}
            </div>

            {/* Kura Sonucu Ekrana Gelen Kartlar */}
            {hasRolled && (
              <div className="space-y-8 animate-fade-in">
                <h3 className="text-xl font-bold text-center text-yellow-400">You can choose ONLY ONE of the following options:</h3>
                {Object.keys(draftOptions).map((type) => (
                  draftOptions[type].length > 0 && (
                    <div key={type} className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                      <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">{LABELS[type]} Options</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {draftOptions[type].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleSelectCard(type, item)}
                            className="bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-red-500 p-5 rounded-xl text-left transition-all group flex justify-between items-center"
                          >
                            <div>
                              <p className="font-extrabold group-hover:text-red-400 transition-colors">{item.name || item.team}</p>
                            </div>
                            <span className={`text-xl font-black px-3 py-1 rounded-lg ${
                              item.tier === 'S' ? 'bg-yellow-500/20 text-yellow-400' :
                              item.tier === 'A' ? 'bg-purple-500/20 text-purple-400' :
                              item.tier === 'B' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                            }`}>{item.tier}</span>
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

        {/* 2. YARIŞ SİMÜLASYON EKRANI */}
        {gameState === 'RACING' && (
          <div className="grid grid-cols-3 gap-8">
            {/* Sol Taraf: Takım Detayları */}
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl h-fit">
              <h3 className="text-xl font-bold text-gray-400 mb-4 uppercase tracking-wider">Your Team</h3>
              <div className="space-y-3">
                <p><strong className="text-xs text-gray-500 uppercase block">Driver</strong> {playerSelection.driver.name} ({playerSelection.driver.tier})</p>
                <p><strong className="text-xs text-gray-500 uppercase block">Car</strong> {playerSelection.car.team} ({playerSelection.car.tier})</p>
                <p><strong className="text-xs text-gray-500 uppercase block">Principal</strong> {playerSelection.principal.name} ({playerSelection.principal.tier})</p>
                <p><strong className="text-xs text-gray-500 uppercase block">Engineer</strong> {playerSelection.engineer.name} ({playerSelection.engineer.tier})</p>
                <p><strong className="text-xs text-gray-500 uppercase block">Strategist</strong> {playerSelection.strategist.name} ({playerSelection.strategist.tier})</p>
              </div>
              <button 
                onClick={handleSimulateRace}
                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-xl text-lg uppercase tracking-widest transition-all shadow-lg"
              >
                Simulate Race {streak + 1}
              </button>
            </div>

            {/* Sağ Taraf: Canlı Yarış Sonuçları */}
            <div className="col-span-2 bg-gray-900 border border-gray-800 p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-gray-400 mb-4 uppercase tracking-wider">Race Leaderboard</h3>
              {lastRaceResult ? (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  {lastRaceResult.allResults.slice(0, 5).map((pos, index) => (
                    <div 
                      key={index} 
                      className={`flex justify-between items-center px-4 py-2.5 rounded-lg border ${
                        pos.isPlayer 
                          ? 'bg-red-950/40 border-red-500 text-red-300 font-bold' 
                          : 'bg-gray-950 border-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 w-5 font-black">{index + 1}.</span>
                        <span>{pos.isPlayer ? pos.name : "AI - ░░░░░░░░░░"}</span>
                      </div>
                      <span className="text-xs text-gray-500">{pos.team}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 text-gray-600 font-medium">
                  Press the button on the left to start the race.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. GAME OVER EKRANI */}
        {gameState === 'GAMEOVER' && (
          <div className="text-center py-16 bg-gray-900 border border-red-950 rounded-3xl max-w-2xl mx-auto border-2">
            <h2 className="text-5xl font-black text-red-500 mb-2">STREAK BROKEN!</h2>
            <p className="text-gray-400 mb-8 text-lg">You couldn't maintain the perfect streak. You are eliminated.</p>
            <div className="bg-gray-950 p-4 rounded-xl inline-block mb-8 text-left border border-gray-800">
              <p className="text-sm text-gray-400">Your Last Race Position: <span className="text-red-400 font-bold">P{lastRaceResult?.position}</span></p>
              <p className="text-sm text-gray-400">Total Races Won: <span className="text-green-400 font-bold">{streak}</span></p>
            </div>
            <div>
              <button 
                onClick={handleResetGame}
                className="bg-white text-gray-950 font-black px-8 py-4 rounded-xl text-lg uppercase tracking-wider hover:bg-gray-200 transition-all"
              >
                Start Over with New Draft
              </button>
            </div>
          </div>
        )}

        {/* 4. ZAFER EKRANI (24/24) */}
        {gameState === 'VICTORY' && (
          <div className="text-center py-16 bg-gray-900 border border-yellow-500 max-w-2xl mx-auto border-2 rounded-3xl">
            <h2 className="text-6xl font-black text-yellow-400 mb-2">LEGENDARY ACHIEVEMENT!</h2>
            <p className="text-xl font-bold text-white mb-4">YOU WENT 24 FOR 24!</p>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">By picking the right personnel at the right time, you achieved the most flawless and impossible championship in F1 history.</p>
            <button 
              onClick={handleResetGame}
              className="bg-yellow-500 text-gray-950 font-black px-8 py-4 rounded-xl text-lg uppercase tracking-wider hover:bg-yellow-400 transition-all"
            >
              Challenge Again
            </button>
          </div>
        )}
      </div>
    </main>
  );
}