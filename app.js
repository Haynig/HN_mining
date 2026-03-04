const API =
  window.location.hostname === "localhost"
    ? "http://localhost:10000/api"
    : "https://hn-wallet-backend.onrender.com/api";

// PAGE SWITCH
function showPage(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// TOKEN
function saveToken(token){ localStorage.setItem("token", token); }
function getToken(){ return localStorage.getItem("token"); }
function authHeader(){
  return { Authorization: "Bearer " + getToken() }
}

// NAVIGATION
goRegister.onclick = ()=> showPage("registerPage");
goLogin.onclick = ()=> showPage("loginPage");
homeNav.onclick = ()=> showPage("homePage");
depositNav.onclick = ()=> showPage("depositPage");
withdrawNav.onclick = ()=> showPage("withdrawPage");
monitorNav.onclick = ()=>{ showPage("monitorPage"); loadTransactions(); }
logoutNav.onclick = logout;

// REGISTER
registerBtn.onclick = async ()=>{
  const username = regUsername.value;
  const password = regPassword.value;

  const res = await fetch(API+"/user/register",{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({ username,password })
  });

  const data = await res.json();
  alert(data.message);
  if(res.ok) showPage("loginPage");
};

// LOGIN
loginBtn.onclick = async ()=>{
  const foydalanuvchi_nomi = loginUsername.value;
  const parol = loginPassword.value;

  const res = await fetch(API+"/user/login",{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({ foydalanuvchi_nomi,parol })
  });

  const data = await res.json();

  if(res.ok){
    saveToken(data.token);
    menu.style.display="flex";
    showPage("homePage");
    loadProfile();
  } else {
    alert(data.message);
  }
};

// PROFILE
async function loadProfile(){
  const res = await fetch(API+"/user/me",{ headers:authHeader() });
  const data = await res.json();
  somBalance.innerText = data.somBalance || 0;
  hnBalance.innerText = data.hnBalance || 0;
}

// DEPOSIT
depositBtn.onclick = async ()=>{
  const amount = depositAmount.value;
  const type = depositType.value;

  const res = await fetch(API+"/wallet/deposit",{
    method:"POST",
    headers:{ "Content-Type":"application/json", ...authHeader() },
    body:JSON.stringify({ amount,type })
  });

  const data = await res.json();
  alert(data.message);
  loadProfile();
};

// WITHDRAW
withdrawBtn.onclick = async ()=>{
  const amount = withdrawAmount.value;
  const type = withdrawType.value;

  const res = await fetch(API+"/wallet/withdraw",{
    method:"POST",
    headers:{ "Content-Type":"application/json", ...authHeader() },
    body:JSON.stringify({ amount,type })
  });

  const data = await res.json();
  alert(data.message);
  loadProfile();
};

// TRANSACTIONS
async function loadTransactions(){
  const res = await fetch(API+"/wallet/transactions",{ headers:authHeader() });
  const data = await res.json();

  transactions.innerHTML="";
  data.forEach(t=>{
    transactions.innerHTML+=`
      <div class="card">
      ${t.type} - ${t.amount}<br>
      ${new Date(t.createdAt).toLocaleString()}
      </div>
    `;
  });
}

function logout(){
  localStorage.removeItem("token");
  location.reload();
}
