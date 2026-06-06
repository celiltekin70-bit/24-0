const TIER_POWER = {
  "S": 95,
  "A": 85,
  "B": 75,
  "C": 65,
  "D": 55
};

export function runRace(playerSelection, database) {
  let gridResults = [];

  // 1. Oyuncu gücünü hesapla
  const playerBasePower = 
    TIER_POWER[playerSelection.driver.tier] +
    TIER_POWER[playerSelection.car.tier] +
    TIER_POWER[playerSelection.principal.tier] +
    TIER_POWER[playerSelection.engineer.tier] +
    TIER_POWER[playerSelection.strategist.tier];

  // STRATEJİST BONUSU: 
  // Eğer strategist S ise, şans aralığına +10 puan ekleyebilir (Düşük puanlıyı kurtarmak için)
  const strategistBonus = (playerSelection.strategist.tier === 'S') ? 15 : 
                          (playerSelection.strategist.tier === 'A') ? 8 : 0;

  // DÜŞÜK PUANLILARA ŞANS: 
  // Base power düşükse (örn: 300'ün altı), rastgelelik aralığını genişletiyoruz
  const luckModifier = playerBasePower < 300 ? 15 : 0; 
  
  // Rastgele şans: Artık düşük puanlılar için daha yüksek bonus gelme ihtimali var
  const playerRng = Math.floor(Math.random() * (16 + luckModifier)) - 10;
  const playerTotalScore = playerBasePower + playerRng + strategistBonus;

  gridResults.push({
    name: playerSelection.driver.name,
    team: playerSelection.car.team,
    score: playerTotalScore,
    isPlayer: true
  });

  // 2. 19 Yapay Zeka rakibi
  for (let i = 0; i < 19; i++) {
    const aiDriver = database.drivers[Math.floor(Math.random() * database.drivers.length)];
    const aiCar = database.cars[Math.floor(Math.random() * database.cars.length)];
    const aiPrincipal = database.principals[Math.floor(Math.random() * database.principals.length)];
    const aiEngineer = database.engineers[Math.floor(Math.random() * database.engineers.length)];
    const aiStrategist = database.strategists[Math.floor(Math.random() * database.strategists.length)];

    const aiBasePower = 
      TIER_POWER[aiDriver.tier] +
      TIER_POWER[aiCar.tier] +
      TIER_POWER[aiPrincipal.tier] +
      TIER_POWER[aiEngineer.tier] +
      TIER_POWER[aiStrategist.tier];

    // AI için sabit şans
    const aiRng = Math.floor(Math.random() * 16) - 10;
    const aiTotalScore = aiBasePower + aiRng;

    gridResults.push({
      name: `AI - ${aiDriver.name}`,
      team: aiCar.team,
      score: aiTotalScore,
      isPlayer: false
    });
  }

  // 3. Sıralama
  gridResults.sort((a, b) => b.score - a.score);
  
  const playerPosition = gridResults.findIndex(p => p.isPlayer) + 1;

  return {
    position: playerPosition,
    winner: gridResults[0],
    allResults: gridResults
  };
}