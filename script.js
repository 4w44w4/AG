const TRACKS = [
  { num: "01", title: "The Return",      feat: "",                dur: "3:47" },
  { num: "02", title: "Eze Onyiko",      feat: "feat. Davido",   dur: "4:12" },
  { num: "03", title: "Crown Eternal",   feat: "",                dur: "3:55" },
  { num: "04", title: "Kingdom Come",    feat: "feat. Burna Boy", dur: "4:33" },
  { num: "05", title: "Sacred Fire",     feat: "",                dur: "3:21" },
  { num: "06", title: "Ancestral Call",  feat: "feat. Wizkid",   dur: "5:02" },
  { num: "07", title: "Lion's Throne",   feat: "",                dur: "3:44" },
  { num: "08", title: "Blood & Gold",    feat: "feat. Asake",    dur: "4:18" },
  { num: "09", title: "The Oath",        feat: "",                dur: "3:59" },
  { num: "10", title: "Homecoming",      feat: "",                dur: "6:14" },
];

const WAVEFORM_HEIGHTS = [18,28,14,36,24,10,30,20,40,16,32,22,12,38,26,8,34,18,28,14,36,24,10,30,20,40,16,32,22,12,38,26,8,34,18,28];

let activeTrack = 0;
let playing = false;
let expanded = false;
let progress = 0;
let progressInterval = null;

function formatTime(pct, trackDur) {
  const parts = trackDur.split(":");
  const totalSec = parseInt(parts[0]) * 60 + parseInt(parts[1]);
  const elapsed = Math.floor((pct / 100) * totalSec);
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return m + ":" + String(s).padStart(2, "0");
}

function buildVault() {
  const vault = document.getElementById("vault-door");
  vault.innerHTML = "";

  for (let i = 0; i < 8; i++) {
    const spoke = document.createElement("div");
    spoke.className = "vault-spoke";
    const angle = i * 45;
    spoke.style.transform = `translateX(-50%) translateY(-100%) rotate(${angle}deg)`;
    spoke.style.transformOrigin = "50% 100%";
    vault.appendChild(spoke);
  }

  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * 360;
    const rad = (angle * Math.PI) / 180;
    const r = 42;
    const cx = 50 + r * Math.sin(rad);
    const cy = 50 - r * Math.cos(rad);
    const bolt = document.createElement("div");
    bolt.className = "vault-bolt";
    bolt.style.transform = `translate(calc(${cx}% - 50%), calc(${cy}% - 50%))`;
    vault.appendChild(bolt);
  }

  vault.innerHTML += `
    <div class="vault-inner">
      <div class="vault-center-ring"></div>
      <div class="vault-center-ring-2"></div>
      <div class="vault-inner-glow"></div>
      <div class="vault-inner-text">
        <span class="vault-inner-label">EZE ONYIKO</span>
      </div>
    </div>
    <div class="vault-outer-ring-1"></div>
    <div class="vault-outer-ring-2"></div>
  `;

  setTimeout(() => {
    vault.classList.add("unlocking");
  }, 1200);
}

function buildWaveform() {
  const wrap = document.getElementById("waveform-wrap");
  wrap.innerHTML = "";
  WAVEFORM_HEIGHTS.forEach((h, i) => {
    const bar = document.createElement("div");
    bar.className = "waveform-bar";
    bar.style.height = h + "px";
    bar.dataset.index = i;
    wrap.appendChild(bar);
  });
}

function updateWaveform() {
  const bars = document.querySelectorAll(".waveform-bar");
  bars.forEach((bar, i) => {
    const pct = (i / bars.length) * 100;
    if (playing && pct < progress) {
      bar.classList.add("active");
    } else {
      bar.classList.remove("active");
    }
  });
}

function updateNowPlaying() {
  const track = TRACKS[activeTrack];
  document.getElementById("now-playing-title").textContent = track.title;

  const featEl = document.getElementById("now-playing-feat");
  if (track.feat) {
    featEl.textContent = track.feat;
    featEl.style.display = "";
  } else {
    featEl.style.display = "none";
  }

  document.getElementById("now-playing-meta").textContent =
    `Track ${track.num} \u00a0·\u00a0 The Return`;

  document.getElementById("progress-time-current").textContent =
    formatTime(progress, track.dur);
  document.getElementById("progress-time-total").textContent = track.dur;
}

function updatePlayButton() {
  const btn = document.getElementById("btn-play");
  if (playing) {
    btn.classList.add("playing");
    btn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
    </svg>`;
  } else {
    btn.classList.remove("playing");
    btn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>`;
  }
}

function startProgress() {
  if (progressInterval) clearInterval(progressInterval);
  progressInterval = setInterval(() => {
    progress = progress >= 100 ? 0 : progress + 0.15;
    updateProgress();
  }, 100);
}

function stopProgress() {
  if (progressInterval) clearInterval(progressInterval);
  progressInterval = null;
}

function updateProgress() {
  const fill = document.getElementById("progress-fill");
  fill.style.width = progress + "%";
  document.getElementById("progress-time-current").textContent =
    formatTime(progress, TRACKS[activeTrack].dur);
  updateWaveform();
}

function renderTracklist() {
  const list = document.getElementById("track-list");
  const visibleTracks = expanded ? TRACKS : TRACKS.slice(0, 5);
  list.innerHTML = "";

  visibleTracks.forEach((track, i) => {
    const li = document.createElement("li");
    li.className = "track-item" +
      (i === activeTrack ? " active" : "") +
      (playing && i === activeTrack ? "" : " paused");

    let numHtml;
    if (i === activeTrack) {
      numHtml = `<div class="track-playing-indicator">
        <div class="bar-ani"></div>
        <div class="bar-ani"></div>
        <div class="bar-ani"></div>
      </div>`;
    } else {
      numHtml = track.num;
    }

    li.innerHTML = `
      <div class="track-num">${numHtml}</div>
      <div>
        <div class="track-name">${track.title}</div>
        ${track.feat ? `<span class="track-feat-small">${track.feat}</span>` : ""}
      </div>
      <div class="track-dur">${track.dur}</div>
    `;

    li.addEventListener("click", () => {
      activeTrack = i;
      progress = 0;
      if (playing) {
        stopProgress();
        startProgress();
      }
      updateNowPlaying();
      updatePlayButton();
      renderTracklist();
      updateWaveform();
    });

    list.appendChild(li);
  });

  const toggle = document.getElementById("tracklist-toggle");
  const icon = toggle.querySelector(".tracklist-toggle-icon");
  if (expanded) {
    toggle.classList.add("open");
    toggle.querySelector(".toggle-label").textContent = "Show Less";
  } else {
    toggle.classList.remove("open");
    toggle.querySelector(".toggle-label").textContent = `Show All ${TRACKS.length} Tracks`;
  }
}

function init() {
  buildVault();
  buildWaveform();
  updateNowPlaying();
  updatePlayButton();
  renderTracklist();

  document.getElementById("scroll-cue").addEventListener("click", () => {
    document.getElementById("shrine").scrollIntoView({ behavior: "smooth" });
  });

  document.getElementById("btn-play").addEventListener("click", () => {
    playing = !playing;
    if (playing) {
      startProgress();
    } else {
      stopProgress();
    }
    updatePlayButton();
    renderTracklist();
  });

  document.getElementById("btn-prev").addEventListener("click", () => {
    activeTrack = (activeTrack - 1 + TRACKS.length) % TRACKS.length;
    progress = 0;
    if (playing) { stopProgress(); startProgress(); }
    updateNowPlaying();
    renderTracklist();
    updateWaveform();
  });

  document.getElementById("btn-next").addEventListener("click", () => {
    activeTrack = (activeTrack + 1) % TRACKS.length;
    progress = 0;
    if (playing) { stopProgress(); startProgress(); }
    updateNowPlaying();
    renderTracklist();
    updateWaveform();
  });

  document.getElementById("btn-shuffle").addEventListener("click", () => {
    activeTrack = Math.floor(Math.random() * TRACKS.length);
    progress = 0;
    if (playing) { stopProgress(); startProgress(); }
    updateNowPlaying();
    renderTracklist();
    updateWaveform();
  });

  document.getElementById("progress-rail").addEventListener("click", (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    progress = ((e.clientX - rect.left) / rect.width) * 100;
    updateProgress();
    updateNowPlaying();
  });

  document.getElementById("tracklist-toggle").addEventListener("click", () => {
    expanded = !expanded;
    renderTracklist();
  });
}

document.addEventListener("DOMContentLoaded", init);
