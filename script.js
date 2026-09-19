/* ======================================================================
   PERSONALIZE EVERYTHING 👇
   The personal content (name, reasons, memories, letter) is AES-256-GCM
   encrypted at rest — VAULT below only contains ciphertext, so it can't
   be read by just viewing this file's source. To change the content,
   edit tools/encrypt-config.cjs and re-run `node tools/encrypt-config.cjs`,
   then paste the printed values in here.
   ====================================================================== */
const VAULT = {
  salt: "9UUqkPvWUcjUm9B8UxOLvg==",
  iv: "QmGyBS31cEhoSSoU",
  iterations: 150000,
  data: "U3fMYNrwudgHkewhCezJDh9K3UW5L7D0iraBpGH62oxkoZCzUHXJqQ1nctulihog3Ktc1gH0In47mf9A66EjIbQLHqRXSUPSDYlDG8dGJFjSWc9kAzeWGICqAA/BxH/qhuvC5uXwz4+iu77xNEF1bbiWg9bWGaG/JVb+I3wP+ofMIeHLAFJw+GNiX++K7PDmSF5pVSFIyreACEg/Zsz7WHxNwDZQAITw7eHUoQ8Bf5Nbus658KnwGTTnI940qZah+hBVtrJRLBRIqAMQAtmwUlprjwDQOUz3WUxmsd1b2jyeF4ATu3bwy+SHPH/96lj5U3Py5hClh+pWC++aFOJ7g6yA6qfgC/m7lnC6eqUUDzd562KNs/ie3srtcOd9RkaKsIgSJ25JsBJE/mo+nYTllOfJFmQkhTliE92kuAOYxafaQBCU/QRgi/wIV+jykPLHMFLkuzVABfyp706Ne3emnJBYSUpCcmsNMTOEYh+KBRhEV2M6VEUtWFFB/4AXlItcpSHo5mnpbveK/0HzrETpwmPYjv5UiCVSVcLbOOlX2FBTK8kkgxJx1mdl8HPUNIA9ITu+LTXzfjT+5ahH/q+AnHbN8/Qiwbzwweticdz31sB4A1X2hXl8YvNd97ibhaCq6Hg+u8wUgLTZvIc5CvCH+LnkRXISjwlwZZE3jCJJ+L+geY9XcQkdqkP3NTNC73tsSDrA3ZfQ7gGZqWl7GlHV1NiHAMTEJD9U2299+9tan9VmDqPkKa+IdoKtNq4/fMVhoMWfY1fxZsjAmGELUqs/d6OifJ4IYlcj4yCRnvX+c4xaaeOIv8yHVNDL2bWGUPaJxPLD4hAWxXPexqx5zGB4GfZuJOFLX59+JlsUm4sbWAITZZtMMKda3n0MtWqYZR9GKkWRnWnp4cewknLHQ1thFSfdTiv5w7KPXtoAzwczC1AUWW/LioeUMh5nXlDWO2369jMTeN/Uf+tRwEdK8HslJCOaDcek1pqXNj04vThqzXc3SxGTNws/0MO98QvCkHbSc7SRZHouXMPpqTnwrEb6fL/QawpjjAF6VC58bPI941pyiItEB6HYzqhkjsV5OO0CnaCkAMfmyXOhUODrCfbdsVbvUUDysVGHOqzpv/T5uZU1M2lktNexMOdV6I3D3rvjZ/g9Am5pb9eRLcbwJdmrLP35eSVTZZpArIMBSeHTNy3Asnk1EjhLMJOfx3goU022ZNnwt4G1kIem9Qjo39RvGQCaYpg5lSNub7WYQfTELGTifQ1aomcIJtR7PT+VlSBkV1uIUXymM2LCgIJ05PyHFTELPUBQjF7iTYtDu3QOmxBWhJog1t5BhHLUTOPj2h6y7ugu0qoExilLSunXZqOQTUBCS/wuq1iiLKvj9iVAuDCbNgqIp/jUmBZAqFxmZqkn9Na8VTg4iQEHI/ztkeIZ7VE2CdVqbl/V2Ybos3T996yrSb0ImpV3clOq1MxTxuLf60ovGK3JwMzEvKH9tb+g16z/1q+9XSncn5GRW1g4+mFauVxmOhjs4m908IGEoGyEgvsSSmM8DVw1dpsgfzKt4eql5cD55eNXfbPOC9Q5wtxBL0lhaiFS6UyGMTHkCQzf6fVqHgDFefmmXt6C802TE7+Ji7o+IVzrC5OnowzIRIxASUi7j8QDRpgctNZUu/v1xjGfNBxgHYTQQyiuhYCBY27/KwQNnfFO55Ci1B10Et1pJl049w+QNe7DZb0Ln5k="
};

let CONFIG = null;

/* ====================================================================== */

/* ================= Lock screen (real encryption, not just hidden UI) =================
   Not truly "unbreakable" (it's all client-side, static hosting — a
   determined attacker could still brute-force offline), but unlike a
   plain hidden div, the personal content is genuinely AES-256-GCM
   encrypted and only ever decrypted, in-memory, after the correct
   password is entered. Viewing this file's source only shows ciphertext. */
const SESSION_KEY_STORAGE = "bday-key";

function b64ToBytes(b64){
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

async function deriveKey(password, saltBytes){
  const baseKey = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: saltBytes, iterations: VAULT.iterations, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["decrypt"]
  );
}

async function decryptVault(key){
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: b64ToBytes(VAULT.iv) },
    key,
    b64ToBytes(VAULT.data)
  );
  return JSON.parse(new TextDecoder().decode(plaintext));
}

async function unlockWithKey(key){
  CONFIG = await decryptVault(key); // throws if the key/password is wrong
  document.getElementById("name-title").textContent = CONFIG.name;
  document.getElementById("name-title-2").textContent = CONFIG.name;
  document.getElementById("lock-screen").classList.add("hidden");
  startExperience();
}

(async function initLock(){
  // if this tab already unlocked once this session, skip the prompt
  const cachedKeyB64 = sessionStorage.getItem(SESSION_KEY_STORAGE);
  if(cachedKeyB64){
    try {
      const rawKey = b64ToBytes(cachedKeyB64);
      const key = await crypto.subtle.importKey("raw", rawKey, "AES-GCM", true, ["decrypt"]);
      await unlockWithKey(key);
      return;
    } catch(e){
      sessionStorage.removeItem(SESSION_KEY_STORAGE);
    }
  }

  const lockInput = document.getElementById("lock-input");
  const lockError = document.getElementById("lock-error");
  const lockCard = document.querySelector("#lock-screen .glass-card");

  async function tryUnlock(){
    const value = lockInput.value.trim();
    if(!value) return;
    try {
      const key = await deriveKey(value, b64ToBytes(VAULT.salt));
      await unlockWithKey(key);
      const rawKey = await crypto.subtle.exportKey("raw", key);
      sessionStorage.setItem(SESSION_KEY_STORAGE, btoa(String.fromCharCode(...new Uint8Array(rawKey))));
    } catch(e){
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
})();

function startExperience(){

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

}
