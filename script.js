let count = 0;
let hit = 0;

const countEl = document.getElementById("count");
const hitEl = document.getElementById("hit");
const result = document.getElementById("result");
const photo = document.getElementById("photo");
const rateEl = document.getElementById("todayRate");

const flash = document.getElementById("flash");
const shockwave = document.getElementById("shockwave");
const fire = document.getElementById("fire");
const mushroom = document.getElementById("mushroom");
const lightning = document.getElementById("lightning");

// 曜日別の大爆発確率
// 50% = 0.5、0.3% = 0.003、0.0002% = 0.000002
const rates = [
  { day:"日曜日", rate:0.5,      text:"50%" },
  { day:"月曜日", rate:0.003,    text:"0.3%" },
  { day:"火曜日", rate:0.000002, text:"0.0002%" },
  { day:"水曜日", rate:0.00001,  text:"0.001%" },
  { day:"木曜日", rate:0.000005, text:"0.0005%" },
  { day:"金曜日", rate:0.000002, text:"0.0002%" },
  { day:"土曜日", rate:0.00001,  text:"0.001%" }
];

const today = rates[new Date().getDay()];
rateEl.textContent = today.day + "の大爆発確率：" + today.text;

function noiseBuffer(ctx, seconds){
  const rate = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, rate * seconds, rate);
  const data = buffer.getChannelData(0);
  for(let i=0;i<data.length;i++){
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function playExplosionAndThunder(){
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const master = ctx.createGain();
    master.gain.value = 0.92;
    master.connect(ctx.destination);

    // 低音ドォォン
    const boom = ctx.createOscillator();
    const boomGain = ctx.createGain();
    boom.type = "sawtooth";
    boom.frequency.setValueAtTime(95, ctx.currentTime);
    boom.frequency.exponentialRampToValueAtTime(14, ctx.currentTime + 2.3);
    boomGain.gain.setValueAtTime(0.95, ctx.currentTime);
    boomGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.3);
    boom.connect(boomGain);
    boomGain.connect(master);
    boom.start();
    boom.stop(ctx.currentTime + 2.3);

    // 爆風ノイズ
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx, 2.8);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(700, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 2.8);
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.75, ctx.currentTime);
    ng.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.8);
    src.connect(filter);
    filter.connect(ng);
    ng.connect(master);
    src.start();

    // 雷っぽいバリバリ音
    for(let k=0;k<5;k++){
      const t = ctx.currentTime + 0.15 + k * 0.18;
      const crack = ctx.createBufferSource();
      crack.buffer = noiseBuffer(ctx, 0.12);
      const cg = ctx.createGain();
      cg.gain.setValueAtTime(0.45, t);
      cg.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 1200;
      crack.connect(hp);
      hp.connect(cg);
      cg.connect(master);
      crack.start(t);
    }
  }catch(e){}
}

function speak(){
  try{
    speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance("ワッハッハッハッ。大爆発だ。また挑戦してみよう。");
    msg.lang = "ja-JP";
    msg.rate = 0.9;
    msg.pitch = 0.65;
    msg.volume = 1.0;
    speechSynthesis.speak(msg);
  }catch(e){}
}

function animateExplosion(){
  [flash, shockwave, fire, mushroom, lightning].forEach(el => {
    el.className = "";
    void el.offsetWidth;
  });
  document.body.classList.remove("bigShake");
  void document.body.offsetWidth;

  flash.classList.add("flashAnim");
  shockwave.classList.add("shockAnim");
  fire.classList.add("fireAnim");
  mushroom.classList.add("mushroomAnim");
  lightning.classList.add("lightningAnim");
  document.body.classList.add("bigShake");

  if(navigator.vibrate){
    navigator.vibrate([500,120,350,100,700,100,250]);
  }
}

function explode(){
  hit++;
  hitEl.textContent = hit;

  animateExplosion();
  playExplosionAndThunder();
  setTimeout(speak, 800);

  const n = Math.floor(Math.random() * 36) + 1;
  photo.classList.remove("fade");
  void photo.offsetWidth;
  photo.src = "photos/photo" + n + ".jpg";

  photo.onerror = () => {
    photo.style.display = "none";
    result.innerHTML = "💥 大爆発！！ 💥<br>photos/photo" + n + ".jpg はまだ入っていません。";
  };

  photo.onload = () => {
    photo.style.display = "inline-block";
    photo.classList.add("fade");
    result.innerHTML = "💥 大爆発！！ 💥<br>photo" + n + ".jpg";
  };
}

document.getElementById("btn").onclick = () => {
  count++;
  countEl.textContent = count;

  if(Math.random() < today.rate){
    explode();
  }else{
    result.innerHTML = "……不発。<br>試行回数：" + count;
  }
};
