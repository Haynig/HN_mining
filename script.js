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
const gameContainer = document.getElementById('game-container');

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
    updateUI();
  }
}

// UI ni yangilash
function updateUI() {
  energyElement.textContent = `Energiya: ${energy}`;
  hnBalanceElement.textContent = `HN Balans: ${hnBalance.toFixed(5)}`;
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
    // Animatsiya
    gameContainer.classList.add('ripple');
    setTimeout(() => {
      gameContainer.classList.remove('ripple');
    }, 200);
    checkStageCompletion();
    saveGameState();
  } else {
    messageElement.textContent = 'Energiya yetarli emas!';
  }
}

// Bosqichlarni tekshirish
function checkStageCompletion() {
  if (stage === 1 && hnBalance >= 100) {
    stage = 2;
    hnReward = 0.005;
    messageElement.textContent = '2-bosqich ochildi!';
  } else if (stage === 2 && hnBalance >= 500) {
    stage = 3;
    hnReward = 0.0075;
    messageElement.textContent = '3-bosqich ochildi!';
  } else if (stage === 3 && hnBalance >= 750) {
    stage = 4;
    hnReward = 0.01;
    messageElement.textContent = '4-bosqich ochildi!';
  } else if (stage === 4 && hnBalance >= 1000) {
    stage = 5;
    hnReward = 0.1;
    messageElement.textContent = '5-bosqich ochildi! Cheksiz!';
  }
  saveGameState();
}

// Energiyani sotib olish
async function buyEnergy() {
  if (!walletAddress) {
    messageElement.textContent = 'Avvalo hamyon bilan ulaning!';
    return;
  }
  try {
    const tx = {
      validUntil: Math.floor(Date.now() / 1000) + 300, // 5 daqiqa
      messages: [
        {
          address: 'EQCkRmK7SA68DL_0wtzynZ7ODmaaUH0zEL4xRQ40PGgQ0snt', // Sizning qabul qiluvchi manzilingiz
          amount: '20000000' // 0.02 TON (nol soni bilan)
        }
      ]
    };
    const result = await tonConnect.sendTransaction(tx);
    console.log('Transaksiya yuborildi:', result);
    messageElement.textContent = 'Energiya sotib olindi! Balansingiz yangilanadi.';
    // Energiya miqdorini yangilash
    energy += 1000; // yoki kerakli miqdor
    updateUI();
    saveGameState();
  } catch (e) {
    console.error('Transaksiya xatosi:', e);
    messageElement.textContent = 'Transaksiya muvaffaqiyatsiz bo‘ldi.';
  }
}

// Tugmalarga eventlar
document.getElementById('mining-button').addEventListener('click', mineHN);
document.getElementById('withdraw-button').addEventListener('click', buyEnergy);
walletAddressElement.addEventListener('click', connectWallet);

// Holatni yuklash
loadGameState();
