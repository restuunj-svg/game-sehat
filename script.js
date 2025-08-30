/***********************
 * CONFIG SPREADSHEET
 ***********************/
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxNbwUNazDKQ49OB2jUx4iQTMKs4MtCTMDzoYac6Q14drYXWsIYYfdK_vypT-b0yF0I/exec";

/***********************
 * DOM
 ***********************/
const slide1 = document.getElementById("slide1");
const slide2 = document.getElementById("slide2");
const userForm = document.getElementById("userForm");
const starField = document.getElementById("starField");
const backsound = document.getElementById("backsound");
const clickSound = document.getElementById("clickSound");
const winSound = document.getElementById("winSound");
const loseSound = document.getElementById("loseSound");
const gameContainer = document.getElementById("gameContainer");
const gameArea = document.getElementById("gameArea");
const character = document.getElementById("character");
const route = document.getElementById("route");
const arrowBtn = document.getElementById("arrowBtn");
const resetBtn = document.getElementById("resetBtn");
const scoreText = document.getElementById("scoreText");
const cpText = document.getElementById("cpText");
const choicePopup = document.getElementById("choicePopup");
const choiceTitle = document.getElementById("choiceTitle");
const choiceLeft = document.getElementById("choiceLeft");
const choiceRight = document.getElementById("choiceRight");
const resultPopup = document.getElementById("resultPopup");
const resultEmote = document.getElementById("resultEmote");
const resultText = document.getElementById("resultText");
const flowerBox = document.getElementById("flowerBox");
const okResult = document.getElementById("okResult");
const confirmPopup = document.getElementById("confirmPopup");
const noReset = document.getElementById("noReset");
const yesReset = document.getElementById("yesReset");
const rainLayer = document.getElementById("rainLayer");

/***********************
 * UTIL: stars on slide1
 ***********************/
(function createStars(){
  const total = 90;
  for(let i=0;i<total;i++){
    const s = document.createElement("div");
    s.className = "star";
    s.style.left = Math.random()*100+"vw";
    s.style.animationDuration = 4 + Math.random()*3 + "s";
    s.style.animationDelay = Math.random()*4 + "s";
    starField.appendChild(s);
  }
})();

/***********************
 * AUDIO control
 ***********************/
function playClick(){ // semua tombol kecuali panah
  try{ clickSound.currentTime = 0; clickSound.play(); }catch{}
}
function playExclusive(effectAudio){
  try{
    backsound.pause();
    effectAudio.currentTime = 0;
    effectAudio.play();
    effectAudio.onended = () => {
      backsound.play().catch(()=>{});
    };
  }catch{}
}

/***********************
 * STATE
 ***********************/
let player = { nama: "", tanggal: "", makanan: "", minuman: "" };
let currentCP = 0;
let score = 0;
let answered = new Array(10).fill(false);
let gameOver = false;

// 🔥 tambahan state recap
let userChoices = [];

const correctSide = ["L","L","L","R","R","L","R","R","L","L"];
const cpData = [
  {type:"food", healthy:"Salad sayur segar", unhealthy:"Gorengan"},
  {type:"food", healthy:"Nasi merah + lauk panggang", unhealthy:"Mi instan"},
  {type:"food", healthy:"Ikan kukus + sayur", unhealthy:"Burger keju jumbo"},
  {type:"food", healthy:"Buah potong", unhealthy:"Kol goreng"},
  {type:"food", healthy:"Oatmeal + pisang", unhealthy:"Donat gula glaze"},
  {type:"drink", healthy:"Air putih", unhealthy:"Minuman bersoda manis"},
  {type:"drink", healthy:"Susu rendah lemak", unhealthy:"Teh manis"},
  {type:"drink", healthy:"Jus buah tanpa gula", unhealthy:"Minuman energi gula tinggi"},
  {type:"drink", healthy:"Air kelapa", unhealthy:"Boba extra sugar"},
  {type:"finish",healthy:"Tidur teratur & aktif bergerak", unhealthy:"Begadang & mager seharian"}
];

// 🔥 alasan tiap pilihan
const reasons = {
  "Salad sayur segar": "Banyak serat dan vitamin, rendah kalori—baik untuk pencernaan & kenyang lebih lama.",
  "Gorengan": "Tinggi lemak jenuh/trans dan kalori; proses penggorengan berulang kurang baik untuk kesehatan.",
  "Nasi merah + lauk panggang": "Lebih tinggi serat & indeks glikemik lebih rendah; dipanggang = lebih sedikit minyak.",
  "Mi instan": "Tinggi natrium, rendah serat & gizi; bumbu dan minyak menambah beban kalori.",
  "Ikan kukus + sayur": "Protein tinggi & lemak sehat; dikukus tanpa minyak menjaga nutrisi.",
  "Burger keju jumbo": "Kalori, lemak jenuh, dan garam tinggi; porsi jumbo menambah risiko kelebihan kalori.",
  "Buah potong": "Vitamin, mineral, dan serat alami tanpa gula tambahan—baik untuk metabolisme.",
  "Kol goreng": "Menyerap banyak minyak saat digoreng; gizi sayur jadi kurang optimal.",
  "Oatmeal + pisang": "Serat larut (beta-glukan) bantu kenyang & jaga kolesterol; pisang menambah kalium.",
  "Donat gula glaze": "Tinggi gula & lemak; sedikit serat/protein sehingga cepat lapar lagi.",
  "Air putih": "Hidrasi optimal tanpa kalori & gula; pilihan terbaik untuk keseharian.",
  "Minuman bersoda manis": "Sangat tinggi gula; berisiko obesitas & masalah gigi bila sering dikonsumsi.",
  "Susu rendah lemak": "Protein & kalsium tetap tinggi dengan lemak jenuh lebih rendah.",
  "Teh manis": "Tambahan gula menaikkan kalori; lebih baik tanpa/kurang gula.",
  "Jus buah tanpa gula": "Vitamin & antioksidan; tanpa gula tambahan lebih sehat (tetap batasi porsi).",
  "Minuman energi gula tinggi": "Gula & kafein tinggi; berisiko bila sering diminum, apalagi tanpa aktivitas fisik berat.",
  "Air kelapa": "Elektrolit alami (kalium, magnesium) & relatif rendah kalori—baik setelah aktivitas.",
  "Boba extra sugar": "Gula sangat tinggi; topping tapioka tinggi kalori & rendah gizi.",
  "Tidur teratur & aktif bergerak": "Tidur cukup & aktif bantu pemulihan, metabolisme, dan kesehatan jantung.",
  "Begadang & mager seharian": "Ganggu hormon lapar/kenyang, turunkan imunitas & tingkatkan risiko metabolik."
};

/***********************
 * FORM submit
 ***********************/
userForm.addEventListener("submit", async (e)=>{
  e.preventDefault();
  playClick();
  player.nama = document.getElementById("namaLengkap").value.trim();
  player.tanggal = document.getElementById("tanggalLahir").value;
  player.makanan = document.getElementById("makananFavorit").value.trim();
  player.minuman = document.getElementById("minumanFavorit").value.trim();

  // kirim ke Google Spreadsheet (data awal)
  try {
    const formData = new FormData();
    formData.append("nama", player.nama);
    formData.append("tanggal", player.tanggal);
    formData.append("makanan", player.makanan);
    formData.append("minuman", player.minuman);
    formData.append("hasilGame", "Belum main"); // default

    await fetch(SCRIPT_URL, { method: "POST", body: formData })
      .then(res => res.text())
      .then(data => console.log("Sukses kirim:", data))
      .catch(err => console.error("Gagal kirim:", err));

  } catch(err) {
    console.warn("Gagal kirim ke spreadsheet:", err);
  }

  slide1.classList.remove("slide--active");
  slide2.classList.add("slide--active");
  try{ backsound.volume = 0.5; backsound.play(); }catch{}
  updateHUD();
  setTimeout(()=> character.classList.remove("waving"), 2500);
});


/***********************
 * MOVE & QUESTION
 ***********************/
function updateHUD(){
  scoreText.textContent = score;
  cpText.textContent = `${currentCP}/${10}`;
}
function getCPElement(index){
  return document.getElementById(`cp${index}`);
}
function jumpToCP(nextIndex){
  if(gameOver) return;
  if(nextIndex < 1 || nextIndex > 10) return;
  currentCP = nextIndex;
  const cpEl = getCPElement(currentCP);
  if(!cpEl) return;
  const x = cpEl.offsetLeft + route.offsetLeft - 30;
  character.src = "assets/character/char_walk.png";
  character.style.left = `${x}px`;
  const base = 160;
  character.style.bottom = (base + 50) + "px";
  setTimeout(()=> character.style.bottom = base + "px", 250);
  const centerX = cpEl.offsetLeft - (gameContainer.clientWidth/2) + cpEl.clientWidth/2 + route.offsetLeft;
  gameContainer.scrollTo({ left: Math.max(0, centerX), behavior: "smooth" });
  setTimeout(()=> character.src = "assets/character/char_idle.png", 380);
  setTimeout(()=>{
    if(!answered[currentCP-1]){
      showQuestion(currentCP);
    }else{
      if(currentCP === 10) finishGame();
    }
    updateHUD();
  }, 400);
}
arrowBtn.addEventListener("click", ()=>{
  if(gameOver) return;
  if(currentCP === 10 && answered[9]) return;
  const next = Math.min(10, currentCP + 1);
  jumpToCP(next);
});
resetBtn.addEventListener("click", ()=>{
  playClick();
  confirmPopup.classList.add("show");
});
noReset.addEventListener("click", ()=>{
  playClick();
  confirmPopup.classList.remove("show");
});
yesReset.addEventListener("click", ()=>{
  playClick();
  confirmPopup.classList.remove("show");
  hardReset();
});
function hardReset(){
  score = 0;
  currentCP = 0;
  answered = new Array(10).fill(false);
  gameOver = false;
  character.src = "assets/character/char_idle.png";
  character.classList.add("waving");
  character.style.left = "40px";
  arrowBtn.disabled = false;
  gameContainer.scrollTo({left:0, behavior:"smooth"});
  updateHUD();
  // 🔥 reset recap
  userChoices = [];
  const oldList = document.querySelector(".result-list");
  if(oldList) oldList.remove();
}

/***********************
 * POPUP QUESTION
 ***********************/
function showQuestion(idx){
  const data = cpData[idx-1];
  const isFinish = data.type === "finish";
  const healthyOnLeft = (correctSide[idx-1] === "L");
  const leftLabel = healthyOnLeft ? data.healthy : data.unhealthy;
  const rightLabel = healthyOnLeft ? data.unhealthy : data.healthy;
  choiceTitle.textContent = isFinish ? "Terakhir! Pilih kebiasaan yang kamu terapkan 🎯" : (data.type === "food" ? "Pilih makanan!" : "Pilih minuman!");
  choiceLeft.querySelector(".choice-label").textContent = leftLabel;
  choiceLeft.querySelector(".choice-score").textContent = "";
  choiceRight.querySelector(".choice-label").textContent = rightLabel;
  choiceRight.querySelector(".choice-score").textContent = "";
  choiceLeft.onclick = ()=> handleChoice(idx, healthyOnLeft ? "healthy" : "unhealthy");
  choiceRight.onclick= ()=> handleChoice(idx, healthyOnLeft ? "unhealthy" : "healthy");
  choicePopup.classList.add("show");
}

/***********************
 * HANDLE CHOICE
 ***********************/
function handleChoice(idx, kind){
  playClick();
  const data = cpData[idx-1];
  const isHealthy = (kind === "healthy");
  const point = isHealthy ? 10 : 5;
  score += point;
  answered[idx-1] = true;
  // 🔥 simpan recap
  const chosenLabel = isHealthy ? data.healthy : data.unhealthy;
  const chosenReason = reasons[chosenLabel] || (isHealthy ? "Pilihan lebih sehat." : "Pilihan kurang sehat.");
  userChoices.push({ index: idx, label: chosenLabel, point: point, reason: chosenReason });
  updateHUD();
  choicePopup.classList.remove("show");
  if(idx === 10){ finishGame(isHealthy); }
}

/***********************
 * FINISH
 ***********************/
function finishGame(lastHealthy=true){
  if(gameOver) return;
  gameOver = true;
  arrowBtn.disabled = true;
  const win = (score >= 100);
  backsound.pause();
  if(win){
    character.src = "assets/character/char_win.png";
    playExclusive(winSound);
    rainEmote(["assets/icons/star.png","assets/icons/love.png"], 36);
    resultEmote.innerHTML = "🌟💖";
    resultText.textContent = "Wihh! Kamu berhasil mencapai 100 poin! Gaya hidup sehat ini yang harus kamu lakuin ya! 🎉";
    flowerBox.classList.toggle("hidden", !lastHealthy);
  }else{
    character.src = "assets/character/char_lose.png";
    playExclusive(loseSound);
    rainEmote(["assets/icons/heart-broken.png"], 36); // pastikan sesuai nama file kamu
    resultEmote.innerHTML = "☠️";
    resultText.textContent = "Yah.. poin kamu belum 100 nih. Jaga pola makan & minum ya. Coba kurangi gula/lemak berlebih, perbanyak sayur & air putih. Kamu pasti bisa! 😢";
    flowerBox.classList.add("hidden");
  }

  // 🔥 render recap list
  const oldList = document.querySelector(".result-list");
  if(oldList) oldList.remove();
  let listHTML = "<ul class='result-list'>";
  userChoices.sort((a,b)=> a.index - b.index).forEach((c,i)=>{
    listHTML += `<li><span class="num">${i+1}.</span> ${c.label} → <b>+${c.point}</b><br/><small>${c.reason}</small></li>`;
  });
  listHTML += "</ul>";
  resultText.insertAdjacentHTML("afterend", listHTML);
  // 🔥 update hasil ke spreadsheet
  try {
    const formData = new FormData();
    formData.append("nama", player.nama);
    formData.append("tanggal", player.tanggal);
    formData.append("makanan", player.makanan);
    formData.append("minuman", player.minuman);
    formData.append("hasilGame", win ? "Menang" : "Kalah");

    fetch(SCRIPT_URL, { method: "POST", body: formData })
      .then(res => res.text())
      .then(data => console.log("Update hasil game:", data))
      .catch(err => console.error("Gagal update hasil:", err));
  } catch(err) {
    console.warn("Tidak bisa update hasil game:", err);
  }

  setTimeout(()=> resultPopup.classList.add("show"), 500);
}
okResult.addEventListener("click", ()=>{
  playClick();
  resultPopup.classList.remove("show");
});

/***********************
 * RAIN EMOTE
 ***********************/
function rainEmote(srcList, count=24){
  for(let i=0;i<count;i++){
    const img = document.createElement("img");
    img.className = "rain-item";
    img.src = srcList[Math.floor(Math.random()*srcList.length)];
    img.style.left = Math.random()*100 + "vw";
    img.style.animationDuration = (1.5 + Math.random()*1.2) + "s";
    rainLayer.appendChild(img);
    img.addEventListener("animationend", ()=> img.remove());
  }
}

/***********************
 * START STATE
 ***********************/
updateHUD();
if(currentCP === 0){
  arrowBtn.addEventListener("click", ()=>{
    if(currentCP===0) jumpToCP(1);
  }, {once:true});
}
