(async function(){
  // Config
  const cfg = await fetch('/api/config').then(r=>r.json()).catch(()=>({}));

  // Clock & Date
  function updateClock(){
    const now = new Date();
    const h = now.getHours();
    const H = ((h+11)%12)+1;
    const m = now.getMinutes().toString().padStart(2,'0');
    const ampm = h>=12 ? 'PM':'AM';
    document.getElementById('clock').textContent = `${H}:${m} ${ampm}`;
    document.getElementById('date').textContent = now.toLocaleDateString(undefined, { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  }
  updateClock(); setInterval(updateClock, 1000*15);

  // Weather
  async function updateWeather(){
    const panel = document.getElementById('weather');
    if (!cfg.hasWeatherKey && panel) { panel.classList.add('hidden'); return; }
    try{
      const data = await fetch('/api/weather').then(r=>r.json());
      if (data && data.disabled) { panel.classList.add('hidden'); return; }
      const temp = Math.round(data.main.temp);
      const desc = data.weather?.[0]?.description ?? '—';
      document.querySelector('#weather .temp').textContent = `${temp}°`;
      document.querySelector('#weather .desc').textContent = desc;
      document.querySelector('#weather .city').textContent = data.name || cfg.city || 'City';
    }catch(e){
      document.querySelector('#weather .desc').textContent = 'Weather unavailable';
    }
  }
  updateWeather(); setInterval(updateWeather, 1000*60*10);

  // Forecast
  async function updateForecast(){
    try{
      const data = await fetch('/api/forecast').then(r=>r.json());
      const box = document.getElementById('forecast');
      if (!box) return;
      if (data && data.disabled) { box.innerHTML = ''; return; }
      const days = data.days || [];
      if (!days.length) { box.innerHTML = ''; return; }
      box.innerHTML = days.map(d => `<div class="day"><div class="label">${d.label}</div><div class="temps"><span class="max">${d.tmax}°</span> / <span class="min">${d.tmin}°</span></div></div>`).join('');
    }catch(e){ /* silent */ }
  }
  updateForecast(); setInterval(updateForecast, 1000*60*30);

  // Calendar
  async function loadCalendar(){
    const list = document.getElementById('events');
    list.innerHTML = '';
    try{
      const data = await fetch('/api/calendar').then(r=>r.json());
      const events = data.events || [];
      if(!events.length){ list.innerHTML = '<li>No upcoming events.</li>'; }
      else{
        for(const ev of events){
          const li = document.createElement('li');
          li.textContent = `${ev.whenText} — ${ev.title}` + (ev.location ? ` @ ${ev.location}` : '');
          list.appendChild(li);
        }
      }
    }catch(e){
      list.innerHTML = '<li>Calendar unavailable.</li>';
    }
  }
  loadCalendar(); setInterval(loadCalendar, 1000*60*15);

  // Camera & Mic
  async function initAV(){
    const cam = document.getElementById('cam');
    const micBar = document.getElementById('micBar');
    try{
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      cam.srcObject = stream;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      function tick(){
        analyser.getByteTimeDomainData(dataArray);
        let sum=0;
        for (let i=0;i<dataArray.length;i++){ const v = (dataArray[i]-128)/128; sum += v*v; }
        const rms = Math.sqrt(sum/dataArray.length);
        const pct = Math.min(100, Math.max(2, Math.round(rms*200)));
        micBar.style.width = pct + '%';
        requestAnimationFrame(tick);
      }
      tick();
    }catch(e){
      document.getElementById('avHelp').textContent = 'Camera/Mic not permitted. Open once in normal browser and click “Allow”.';
    }
  }
  initAV();

  // News
  async function updateNews(){
    try{
      const data = await fetch('/api/news').then(r=>r.json());
      const items = data.items || [];
      const ticker = document.getElementById('newsTicker');
      if (!ticker) return;
      if (!items.length) { ticker.textContent = 'No news available.'; return; }
      let i = 0;
      function showNext(){ const it = items[i % items.length]; ticker.textContent = `[${it.source}] ${it.title}`; i++; }
      showNext(); setInterval(showNext, 8000);
    }catch(e){
      const ticker = document.getElementById('newsTicker'); if (ticker) ticker.textContent = 'News unavailable.';
    }
  }
  updateNews();

  // Notes
  const LS_KEY = 'mirror_notes_v1';
  function loadNotes(){ try { return JSON.parse(localStorage.getItem(LS_KEY)||'[]'); } catch { return []; } }
  function saveNotes(arr){ localStorage.setItem(LS_KEY, JSON.stringify(arr)); }
  function renderNotes(){
    const box = document.getElementById('notesList'); if (!box) return;
    const notes = loadNotes(); box.innerHTML = '';
    notes.forEach((n, idx) => {
      const row = document.createElement('div'); row.className='note';
      const span = document.createElement('div'); span.className='text'; span.textContent = n;
      const del = document.createElement('button'); del.textContent='Done'; del.onclick = ()=>{ const arr = loadNotes(); arr.splice(idx,1); saveNotes(arr); renderNotes(); };
      row.appendChild(span); row.appendChild(del); box.appendChild(row);
    });
  }
  function setupNotesInput(){
    const input = document.getElementById('noteInput'); if (!input) return;
    input.addEventListener('keydown', (e)=>{
      if (e.key === 'Enter'){ const v = input.value.trim(); if (!v) return; const arr = loadNotes(); arr.push(v); saveNotes(arr); input.value=''; renderNotes(); }
    });
  }
  renderNotes(); setupNotesInput();
})(); 
