// Manifest URL manzili
const manifestUrl = 'https://github.com/HN_mining/tonconnect-manifest.json'; // O'zingizning URL
const tonConnect = new TonConnectSDK.TonConnect({ manifestUrl });

// Elementlar
const energyElement = document.getElementById('energy');
const hnBalanceElement = document.getElementById('hn-balance');
const miningButton = document.getElementById('mining-button');
const withdrawButton = document.getElementById('withdraw-button');
const messageElement = document.getElementById('message');
const walletAddressElement = document.getElementById('wallet-address');

let energy = 100;
let hnBalance = 0;
let stage = 1;
let hnReward = 0.001;
const energyCost = 1;
let walletAddress = '';

// Holatlarni saqlash
function saveGameState() {
  const gameState = {
    energy,
    hnBalance,
    stage
  };
  localStorage.setItem('gameState', JSON.stringify(gameState));
}

// Holatlarni yuklash
function loadGameState() {
  const state = localStorage.getItem('gameState');
  if (state) {
    const data = JSON.parse(state);
    energy = data.energy;
    hnBalance = data.hnBalance;
    stage = data.stage;
  }
  updateUI();
}

// UI ni yangilash va tugma ko‘rinishini boshqarish
function updateUI() {
  energyElement.textContent = `Energiya: ${energy}`;
  hnBalanceElement.textContent = `HN Balans: ${hnBalance.toFixed(5)}`;

  // Energiya sotib olish tugmasi faqat energiya 1 dan kam bo‘lsa ko‘rinadi
  if (energy < 1) {
    document.getElementById('withdraw-button').style.display = 'block';
  } else {
    document.getElementById('withdraw-button').style.display = 'none';
  }
}

// Hamyon bilan ulash
async function connectWallet() {
  try {
    const wallet = await tonConnect.connectWallet();
    walletAddress = wallet.account.address;
    walletAddressElement.textContent = `Hamyon manzili: ${walletAddress}`;
    // Bonus energiya
    energy += 100;
    updateUI();
    saveGameState();
  } catch (e) {
    console.error(e);
    messageElement.textContent = 'Hamyonni ulashda xatolik.';
  }
}

// Qazish funksiyasi
function mineHN() {
  if (energy >= energyCost) {
    energy -= energyCost;
    hnBalance += hnReward;
    updateUI();
    // Animatsiya (kiritilgan)
    document.getElementById('game-container').classList.add('ripple');
    setTimeout(() => {
      document.getElementById('game-container').classList.remove('ripple');
    }, 200);
    checkStageCompletion();
    saveGameState();
  } else {
