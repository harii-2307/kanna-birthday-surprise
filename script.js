/* ======================================================================
   PERSONALIZE EVERYTHING HERE 👇
   - name        : his name / nickname shown on intro & greeting screens
   - reasons     : one balloon is created per reason. Keep the LAST one
                   as the "infinite reasons" line, or edit freely.
   - memories    : one photo card per entry. Put your images inside the
                   "images" folder next to this file, named exactly like
                   the "src" values below (1.jpg, 2.jpg, ...). If an image
                   is missing, a placeholder card is shown automatically,
                   so you can preview the site before adding photos.
   - letter      : the personalised letter, typed out on the last page.
                   Use \n for a line break / new paragraph.
   ====================================================================== */
const CONFIG = {
  name: "Kanna",

  reasons: [
    "Your presence makes me alive.",
    "Your heart gives meaning to my heart.",
    "You are my world and everything.",
    "...and a thousand other reasons more, kanna. ♾️"
  ],

  memories: [
    { src: "images/1.jpg", caption: "naa pranam" },
    { src: "images/2.jpg", caption: "my whole world" }
  ],

  letter: `Hi kannamma,

Wishing you a very happy birthday, be healthy and happy always, i love u so much always forever and ever.

Thanks for being there always, i experienced what true love is from u and i am forever grateful for this, will together cherish every little second of us forever, no matter of all our fights, every second with u is so so special for me.

Forgive me for all the mistakes i did, i love u always kanna.

i love being with u, looking into ur eyes, touching u and playing with u every little thing. as uk seeing u just staring at u and feeling ur presence became my most fav thing in recent days, this can never beat anything.

idk wat even to say, how much ever i express it is always lesss, i love u more n more.

Be happy always, only if u will i will be. take care of ur health. i wish for ur happiness for every second, my heart is with u, take care very much care of it.

A very happy birthday kanna.

- with love,
your kutty 💗`
};

/* ====================================================================== */

/* ================= Lock screen =================
   Not real security (it's all client-side, static hosting) — just keeps
   casual/randoms out since a public link is otherwise guessable. Password
   is stored as a SHA-256 hash so it isn't sitting in plain text here. */
const LOCK_PASSWORD_HASH = "b49a71c4c83e72174f553cd8e8278fce4ab27cdc618faf462bf78f939bd169a0";
const LOCK_STORAGE_KEY = "bday-unlocked";

async function sha256Hex(text){
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

if(localStorage.getItem(LOCK_STORAGE_KEY) === "true"){
  document.getElementById("lock-screen").classList.add("hidden");
} else {
  const lockInput = document.getElementById("lock-input");
  const lockError = document.getElementById("lock-error");
  const lockCard = document.querySelector("#lock-screen .glass-card");

  async function tryUnlock(){
    const value = lockInput.value.trim();
    if(!value) return;
    const hash = await sha256Hex(value);
    if(hash === LOCK_PASSWORD_HASH){
      document.getElementById("lock-screen").classList.add("hidden");
      localStorage.setItem(LOCK_STORAGE_KEY, "true");
    } else {
      lockError.classList.remove("hidden");
      lockCard.classList.remove("lock-shake");
      void lockCard.offsetWidth; // restart animation
      lockCard.classList.add("lock-shake");
      lockInput.value = "";
      lockInput.focus();
    }
  }

  document.getElementById("lock-submit").addEventListener("click", tryUnlock);
  lockInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter") tryUnlock();
  });
}

const scenes = [
  "scene-intro","scene-sticker","scene-greeting","scene-gift",
  "scene-tree","scene-bake","scene-balloons","scene-memory",
  "scene-letter","scene-final"
];

function buildProgressDots(){
  const wrap = document.getElementById("progress-dots");
  scenes.forEach(() => {
    const dot = document.createElement("span");
    wrap.appendChild(dot);
  });
}

function goToScene(id){
  scenes.forEach(s => document.getElementById(s).classList.remove("active"));
  document.getElementById(id).classList.add("active");

  const idx = scenes.indexOf(id);
  document.querySelectorAll("#progress-dots span").forEach((dot, i) => {
    dot.classList.toggle("done", i <= idx);
  });

  sceneEnterHooks[id] && sceneEnterHooks[id]();
}

/* ---------------- Ambient floating hearts (whole site) ---------------- */
function spawnAmbientHeart(){
  const el = document.createElement("span");
  el.className = "floaty";
  el.textContent = ["💗","💕","💖","🤍","✨"][Math.floor(Math.random()*5)];
  el.style.left = Math.random()*100 + "vw";
  const duration = 6 + Math.random()*6;
  el.style.animationDuration = duration + "s";
  el.style.fontSize = (1 + Math.random()*1.2) + "rem";
  document.getElementById("ambient-hearts").appendChild(el);
  setTimeout(() => el.remove(), duration*1000);
}
setInterval(spawnAmbientHeart, 700);

/* ---------------- Generic particle burst helper ---------------- */
function burstParticles(x, y, emojis, count = 18){
  for(let i=0;i<count;i++){
    const p = document.createElement("span");
    p.className = "particle";
    p.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    p.style.left = x + "px";
    p.style.top = y + "px";
    const angle = Math.random()*Math.PI*2;
    const dist = 60 + Math.random()*140;
    p.style.setProperty("--px", Math.cos(angle)*dist + "px");
    p.style.setProperty("--py", Math.sin(angle)*dist + "px");
    p.style.setProperty("--pr", (Math.random()*360-180) + "deg");
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 950);
  }
}

/* ================= SCENE: intro ================= */
document.getElementById("name-title").textContent = CONFIG.name;
document.getElementById("name-title-2").textContent = CONFIG.name;

document.getElementById("btn-intro").addEventListener("click", () => {
  goToScene("scene-sticker");
});

/* ================= SCENE: sticker tease ================= */
document.getElementById("btn-sticker-1").addEventListener("click", (e) => {
  document.getElementById("sticker-line-1").classList.add("hidden");
  document.getElementById("sticker-line-2").classList.remove("hidden");
  e.target.classList.add("hidden");
  document.getElementById("btn-sticker-2").classList.remove("hidden");
});
document.getElementById("btn-sticker-2").addEventListener("click", () => {
  goToScene("scene-greeting");
});

/* ================= SCENE: flower burst greeting ================= */
function burstFlowers(){
  const origin = document.getElementById("flower-burst");
  origin.innerHTML = "";
  const flowers = ["🌸","🌺","🌷","🌹","💮","🏵️"];
  for(let i=0;i<26;i++){
    const p = document.createElement("span");
    p.className = "petal";
    p.textContent = flowers[Math.floor(Math.random()*flowers.length)];
    const angle = Math.random()*Math.PI*2;
    const dist = 120 + Math.random()*220;
    p.style.setProperty("--tx", Math.cos(angle)*dist + "px");
    p.style.setProperty("--ty", Math.sin(angle)*dist + "px");
    p.style.setProperty("--rot", (Math.random()*720-360) + "deg");
    p.style.animationDelay = (Math.random()*0.3) + "s";
    origin.appendChild(p);
  }
}
document.getElementById("btn-greeting").addEventListener("click", () => {
  goToScene("scene-gift");
});

/* ================= SCENE: gift -> heart -> arrow -> wish ================= */
const giftBox = document.getElementById("gift-box");
giftBox.addEventListener("click", () => {
  if(giftBox.classList.contains("opened")) return;
  giftBox.classList.add("opened");
  document.getElementById("gift-hint").textContent = "unwrapping...";

  setTimeout(() => {
    document.getElementById("gift-wrap").classList.add("hidden");
    document.getElementById("heart-arrow-stage").classList.remove("hidden");
    const rect = document.getElementById("heart-target").getBoundingClientRect();
    burstParticles(rect.left+rect.width/2, rect.top+rect.height/2, ["🎉","✨","💗"], 20);
  }, 650);
});

document.getElementById("bow-btn").addEventListener("click", (e) => {
  const bow = e.currentTarget;
  if(bow.classList.contains("release")) return;
  bow.classList.add("release");
  setTimeout(() => bow.classList.remove("release"), 350);

  const heart = document.getElementById("heart-target");
  const bowRect = bow.getBoundingClientRect();
  const heartRect = heart.getBoundingClientRect();
  const startX = bowRect.left + bowRect.width/2;
  const startY = bowRect.top + bowRect.height/2;
  const endX = heartRect.left + heartRect.width/2;
  const endY = heartRect.top + heartRect.height/2;
  const dx = endX - startX;
  const dy = endY - startY;
  const angle = Math.atan2(dy, dx) * (180/Math.PI) + "deg";

  const arrow = document.createElement("span");
  arrow.className = "arrow-projectile";
  arrow.textContent = "➤";
  arrow.style.left = startX + "px";
  arrow.style.top = startY + "px";
  arrow.style.setProperty("--dx", dx + "px");
  arrow.style.setProperty("--dy", dy + "px");
  arrow.style.setProperty("--angle", angle);
  document.body.appendChild(arrow);

  setTimeout(() => {
    arrow.remove();
    heart.classList.add("hit");
    burstParticles(endX, endY, ["💥","💖","💕","✨"], 26);

    setTimeout(() => {
      document.getElementById("heart-arrow-stage").classList.add("hidden");
      document.getElementById("wish-block").classList.remove("hidden");
    }, 500);
  }, 450);
});

document.getElementById("btn-wish").addEventListener("click", () => {
  goToScene("scene-tree");
});

/* ================= SCENE: tree of hearts ================= */
function growHeartTree(){
  const foliage = document.getElementById("tree-foliage");
  foliage.innerHTML = "";
  const positions = [];
  for(let i=0;i<22;i++){
    positions.push({
      left: 10 + Math.random()*80,
      top: 5 + Math.random()*75,
      delay: i*0.09
    });
  }
  positions.forEach(pos => {
    const h = document.createElement("span");
    h.className = "leaf-heart";
    h.textContent = ["💗","💕","❤️","💖"][Math.floor(Math.random()*4)];
    h.style.left = pos.left + "%";
    h.style.top = pos.top + "%";
    h.style.animationDelay = pos.delay + "s";
    foliage.appendChild(h);
  });

  const totalDelay = positions.length*90 + 500;
  setTimeout(() => {
    document.getElementById("tree-message-wrap").classList.remove("hidden");
  }, totalDelay);
}
document.getElementById("btn-tree").addEventListener("click", () => {
  goToScene("scene-bake");
});

/* ================= SCENE: bake cake / chocolates / flowers ================= */
function runBakeScene(){
  const steamLayer = document.getElementById("steam-layer");
  const fallLayer = document.getElementById("fall-layer");
  const bloomLayer = document.getElementById("bloom-layer");
  steamLayer.innerHTML = ""; fallLayer.innerHTML = ""; bloomLayer.innerHTML = "";

  // steam rising from cake
  for(let i=0;i<6;i++){
    const s = document.createElement("span");
    s.className = "steam";
    s.textContent = "〰️";
    s.style.left = (40 + Math.random()*20) + "%";
    s.style.animationDelay = (0.4 + i*0.3) + "s";
    steamLayer.appendChild(s);
  }

  // chocolates falling
  setTimeout(() => {
    for(let i=0;i<14;i++){
      const c = document.createElement("span");
      c.className = "falling";
      c.textContent = "🍫";
      c.style.left = Math.random()*100 + "%";
      c.style.animationDelay = (Math.random()*1.2) + "s";
      fallLayer.appendChild(c);
    }
  }, 500);

  // flowers blooming around
  setTimeout(() => {
    const flowerEmojis = ["🌸","🌷","🌼"];
    for(let i=0;i<10;i++){
      const b = document.createElement("span");
      b.className = "bloom";
      b.textContent = flowerEmojis[Math.floor(Math.random()*flowerEmojis.length)];
      const angle = (i/10)*Math.PI*2;
      const dist = 95;
      b.style.left = `calc(50% + ${Math.cos(angle)*dist}px)`;
      b.style.top = `calc(50% + ${Math.sin(angle)*dist}px)`;
      b.style.animationDelay = (i*0.08) + "s";
      bloomLayer.appendChild(b);
    }
  }, 1200);

  setTimeout(() => {
    document.getElementById("bake-message-wrap").classList.remove("hidden");
  }, 2400);
}
document.getElementById("btn-bake").addEventListener("click", () => {
  goToScene("scene-balloons");
});

/* ================= SCENE: balloons with reasons ================= */
function buildBalloons(){
  const field = document.getElementById("balloon-field");
  field.innerHTML = "";

  // twinkling stars background
  for(let i=0;i<40;i++){
    const star = document.createElement("span");
    star.className = "star";
    star.style.left = Math.random()*100 + "%";
    star.style.top = Math.random()*100 + "%";
    star.style.animationDelay = (Math.random()*2) + "s";
    field.appendChild(star);
  }

  const colors = ["#ff6f91","#ffb3c6","#ffd27f","#84d2f6","#c9a0ff","#7be0b0","#ff8f70"];
  const count = CONFIG.reasons.length;

  CONFIG.reasons.forEach((reason, i) => {
    const balloon = document.createElement("div");
    balloon.className = "balloon";
    balloon.style.left = (5 + (i * (90/count)) + Math.random()*4) + "%";
    balloon.style.bottom = (Math.random()*46) + "%";
    const scale = 0.9 + Math.random()*0.5;
    balloon.style.width = Math.round(56*scale) + "px";
    balloon.style.height = Math.round(70*scale) + "px";
    balloon.style.background = colors[i % colors.length];
    balloon.style.animationDelay = (Math.random()*1.4) + "s";
    balloon.dataset.reason = reason;
    balloon.dataset.last = (i === count-1) ? "true" : "false";
    balloon.addEventListener("click", onBalloonPop);
    field.appendChild(balloon);
  });
}

let balloonsPopped = 0;
function onBalloonPop(e){
  const balloon = e.currentTarget;
  if(balloon.classList.contains("popped")) return;
  balloon.classList.add("popped");
  balloonsPopped++;

  const rect = balloon.getBoundingClientRect();
  burstParticles(rect.left+rect.width/2, rect.top+rect.height/2, ["🎈","✨","💥"], 14);

  const card = document.getElementById("reason-card");
  document.getElementById("reason-text").textContent = balloon.dataset.reason;
  card.classList.remove("hidden");

  if(balloonsPopped === CONFIG.reasons.length){
    document.getElementById("btn-balloons").classList.remove("hidden");
  }
}
document.getElementById("btn-close-reason").addEventListener("click", () => {
  document.getElementById("reason-card").classList.add("hidden");
});
document.getElementById("btn-balloons").addEventListener("click", () => {
  goToScene("scene-memory");
});

/* ================= SCENE: memory lane ================= */
function buildMemoryGallery(){
  const gallery = document.getElementById("memory-gallery");
  gallery.innerHTML = "";

  CONFIG.memories.forEach((mem, i) => {
    const card = document.createElement("figure");
    card.className = "polaroid";
    card.style.setProperty("--tilt", (i % 2 === 0 ? -4 : 4) + "deg");

    const img = document.createElement("img");
    img.alt = mem.caption;
    img.src = mem.src;
    img.onerror = () => {
      img.replaceWith(Object.assign(document.createElement("div"), {
        className: "placeholder-photo",
        textContent: `📷 Add "${mem.src.split("/").pop()}" to the images folder`
      }));
    };
    card.appendChild(img);

    const caption = document.createElement("figcaption");
    caption.textContent = mem.caption;
    card.appendChild(caption);

    gallery.appendChild(card);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) entry.target.classList.add("in-view");
    });
  }, { threshold: 0.2 });
  document.querySelectorAll(".polaroid").forEach(el => observer.observe(el));
}
document.getElementById("btn-memory").addEventListener("click", () => {
  goToScene("scene-letter");
});

/* ================= SCENE: letter (typewriter) ================= */
function typeLetter(){
  const el = document.getElementById("letter-text");
  const btn = document.getElementById("btn-letter");
  el.textContent = "";
  btn.classList.add("hidden");

  const text = CONFIG.letter;
  let i = 0;
  function typeChar(){
    if(i < text.length){
      el.textContent += text.charAt(i);
      i++;
      el.parentElement.scrollTop = el.parentElement.scrollHeight;
      setTimeout(typeChar, 16);
    } else {
      btn.classList.remove("hidden");
    }
  }
  typeChar();
}
document.getElementById("btn-letter").addEventListener("click", () => {
  goToScene("scene-final");
});

/* ================= SCENE: final ================= */
function runFinalHearts(){
  const layer = document.getElementById("final-hearts");
  layer.innerHTML = "";
  function drop(){
    const h = document.createElement("span");
    h.className = "floaty";
    h.textContent = ["💖","💕","💗","🎉","✨"][Math.floor(Math.random()*5)];
    h.style.left = Math.random()*100 + "%";
    h.style.bottom = "-40px";
    h.style.position = "absolute";
    h.style.fontSize = (1.2 + Math.random()*1.4) + "rem";
    const duration = 5 + Math.random()*5;
    h.style.animationDuration = duration + "s";
    layer.appendChild(h);
    setTimeout(() => h.remove(), duration*1000);
  }
  for(let i=0;i<12;i++) setTimeout(drop, i*180);
  if(!runFinalHearts.interval){
    runFinalHearts.interval = setInterval(drop, 350);
  }
}
document.getElementById("btn-replay").addEventListener("click", resetExperience);

/* ---------------- full reset (used by "Watch again", avoids relying on location.reload()
   which can misbehave inside some in-app browsers like WhatsApp/Instagram webviews) ---------------- */
function resetExperience(){
  if(runFinalHearts.interval){
    clearInterval(runFinalHearts.interval);
    runFinalHearts.interval = null;
  }

  document.getElementById("sticker-line-1").classList.remove("hidden");
  document.getElementById("sticker-line-2").classList.add("hidden");
  document.getElementById("btn-sticker-1").classList.remove("hidden");
  document.getElementById("btn-sticker-2").classList.add("hidden");

  document.getElementById("gift-wrap").classList.remove("hidden");
  document.getElementById("gift-box").classList.remove("opened");
  document.getElementById("gift-hint").textContent = "click the gift to unwrap";
  document.getElementById("heart-arrow-stage").classList.add("hidden");
  document.getElementById("heart-target").classList.remove("hit");
  document.getElementById("bow-btn").classList.remove("release");
  document.querySelectorAll(".arrow-projectile").forEach(a => a.remove());
  document.getElementById("wish-block").classList.add("hidden");

  document.getElementById("tree-message-wrap").classList.add("hidden");
  document.getElementById("bake-message-wrap").classList.add("hidden");

  balloonsPopped = 0;
  document.getElementById("reason-card").classList.add("hidden");
  document.getElementById("btn-balloons").classList.add("hidden");

  window.scrollTo(0, 0);
  goToScene("scene-intro");
}

/* ---------------- hooks that run each time a scene becomes active ---------------- */
const sceneEnterHooks = {
  "scene-greeting": burstFlowers,
  "scene-tree": growHeartTree,
  "scene-bake": runBakeScene,
  "scene-balloons": buildBalloons,
  "scene-memory": buildMemoryGallery,
  "scene-letter": typeLetter,
  "scene-final": runFinalHearts
};

buildProgressDots();
goToScene("scene-intro");
