const manifestUrl = 'https://your-dapp.com/tonconnect-manifest.json'; // Manifest faylingizning URL manzili
const tonConnect = new TonConnectSDK.TonConnect({ manifestUrl });

// Elementlarni olish
const gameContainer = document.getElementById('game-container');
const energyElement = document.getElementById('energy');
const hnBalanceElement = document.getElementById('hn-balance');
const miningButton = document.getElementById('mining-button');
const withdrawButton = document.getElementById('withdraw-button');
const messageElement = document.getElementById('message');
const walletAddressElement = document.getElementById('wallet-address');

// O'yin o'zgaruvchilari
let energy = 100;
let hnBalance = 0;
let stage = 1;
const energyCost = 1;
let hnReward = 0.001;

// Hamyonni ulash
async function connectWallet() {
  try {
    const wallet = await tonConnect.connectWallet();
    walletAddressElement.textContent = `Hamyon manzili: ${wallet.account.address}`;
    energy += 100; // Hamyon ulanganda 100 energiya bonus berish
    energyElement.textContent = `Energiya: ${energy}`;
    saveGameState(); // O'yin holatini saqlash
  } catch (e) {
    console.error(e);
    messageElement.textContent = 'Hamyonni ulashda xatolik.';
  }
}

// Har bir bosishda sodir bo'ladigan amallar
function mineHN() {
  if (energy >= energyCost) {
    energy -= energyCost;
    hnBalance += hnReward;
    energyElement.textContent = `Energiya: ${energy}`;
    hnBalanceElement.textContent = `HN Balans: ${hnBalance.toFixed(5)}`;
    messageElement.textContent = '';

    // Fon to'lqinlanishi
    gameContainer.classList.add('ripple');
    setTimeout(() => {
      gameContainer.classList.remove('ripple');
    }, 200);

    checkStageCompletion();
    saveGameState(); // O'yin holatini saqlash
  } else {
    messageElement.textContent = 'Energiya yetarli emas!';
  }
}

// O'yin bosqichini tekshirish
function checkStageCompletion() {
  if (stage === 1 && hnBalance >= 100) {
    stage = 2;
    gameContainer.className = 'stage-2';
    hnReward = 0.005;
    messageElement.textContent = '2-bosqich ochildi!';
  } else if (stage === 2 && hnBalance >= 500) {
    stage = 3;
    gameContainer.className = 'stage-3';
    hnReward = 0.0075;
    messageElement.textContent = '3-bosqich ochildi!';
  } else if (stage === 3 && hnBalance >= 750) {
    stage = 4;
    gameContainer.className = 'stage-4';
    hnReward = 0.01;
    messageElement.textContent = '4-bosqich ochildi!';
  } else if (stage === 4 && hnBalance >= 1000) {
    stage = 5;
    gameContainer.className = 'stage-5';
    hnReward = 0.1;
    messageElement.textContent = '5-bosqich ochildi! Cheksiz!';
  }
}

// O'yin holatini saqlash
function saveGameState() {
  const gameState = {
    energy: energy,
    hnBalance: hnBalance,
    stage: stage
  };
  localStorage.setItem('gameState', JSON.stringify(gameState));
}

// O'yin holatini yuklash
function loadGameState() {
  const storedGameState = localStorage.getItem('gameState');
  if (storedGameState) {
    const gameState = JSON.parse(storedGameState);
    energy = gameState.energy;
    hnBalance = gameState.hnBalance;
    stage = gameState.stage;

    energyElement.textContent = `Energiya: ${energy}`;
    hnBalanceElement.textContent = `HN Balans: ${hnBalance.toFixed(5)}`;
    checkStageCompletion();
    // Load stage color
    gameContainer.className = `stage-${stage}`;
  }
}

// Energiya sotib olish (TON Connect bilan integratsiya)
async function buyEnergy() {
    try {
        // Hamyon ulanganligini tekshirish
        if (!tonConnect.wallet) {
            const wallet = await tonConnect.connectWallet();
            walletAddressElement.textContent = `Hamyon manzili: ${wallet.account.address}`;
        }

        // Hamyon manzili
        const walletAddress = tonConnect.wallet.account.address;

        const tx = {
            validUntil: Date.now() + 5 × 60 × 1000, // 5 daqiqa
            messages: [
                {
                    address: 'EQCkRmK7SA68DL_0wtzynZ7ODmaaUH0zEL4xRQ40PGgQ0snt', // Qabul qiluvchi hamyon
                    amount: '20000000', // 0.02 TON (8 nol qo'shiladi)
                }
            ]
        };

        try {
            const result = await tonConnect.sendTransaction(tx);
            console.log('Tranzaksiya yuborildi:', result);
            messageElement.textContent = 'Energiya sotib olindi! Balansingiz yangilanadi.';
            energy += 1000;
            energyElement.textContent = `Energiya: ${energy}`;
            saveGameState();
        } catch (e) {
            console.error('Tranzaksiya xatolik:', e);
            messageElement.textContent = `Tranzaksiya xatolik: ${e}`;
        }
    } catch (e) {
        console.error('Hamyon xatolik:', e);
        messageElement.textContent = `Hamyon xatolik: ${e}`;
    }
}

// Hodisalarni ulash
miningButton.addEventListener('click', mineHN);
withdrawButton.addEventListener('click', buyEnergy);

// Avvalgi holatni yuklash
loadGameState();

// Avtomatik ulanishni tiklash
async function restoreConnection() {
  try {
    const wallet = await tonConnect.restoreConnection();
    if (wallet) {
      walletAddressElement.textContent = `Hamyon manzili: ${wallet.account.address}`;
    }
  } catch (e) {
    console.error(e);
  }
}

restoreConnection();
