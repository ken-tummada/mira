// Gesture detection using MediaPipe Hands (CDN)
(function(){
  const video = document.getElementById('cam');
  if (!video) return;
  const overlay = document.createElement('canvas');
  overlay.id = 'gestureOverlay';
  overlay.width = video.clientWidth || 640;
  overlay.height = video.clientHeight || 480;
  document.getElementById('av').appendChild(overlay);
  const ctx = overlay.getContext('2d');
  function resizeCanvas(){ overlay.width = video.clientWidth || 640; overlay.height = video.clientHeight || 480; }
  window.addEventListener('resize', resizeCanvas);

  function isFingerExtended(lm, tip, pip, mcp){ return lm[tip].y < lm[pip].y && lm[pip].y < lm[mcp].y; }
  function classifyGesture(hand){
    const lm = hand.landmarks; if (!lm || lm.length < 21) return null;
    const fingers = {
      index: isFingerExtended(lm, 8, 6, 5),
      middle: isFingerExtended(lm, 12, 10, 9),
      ring: isFingerExtended(lm, 16, 14, 13),
      pinky: isFingerExtended(lm, 20, 18, 17)
    };
    const left = (hand.handedness && hand.handedness.toLowerCase().includes('left'));
    const thumbExtended = left ? (lm[4].x < lm[3].x) : (lm[4].x > lm[3].x);
    let count = 0; for (const k of Object.keys(fingers)) if (fingers[k]) count++;
    if (count===4 && thumbExtended) return 'open';
    if (count===0 && !thumbExtended) return 'fist';
    if (count===0 && thumbExtended) return 'thumbs_up';
    if (count===2 && fingers.index && fingers.middle) return 'two_fingers';
    return null;
  }
  function draw(hand){
    const lm = hand.landmarks; if (!lm) return;
    ctx.clearRect(0,0,overlay.width, overlay.height);
    ctx.fillStyle = 'rgba(94,234,212,0.9)';
    const w = overlay.width, h = overlay.height;
    for (const p of lm){ ctx.beginPath(); ctx.arc(p.x*w, p.y*h, 3, 0, Math.PI*2); ctx.fill(); }
  }
  let lastGesture=null,lastTime=0;
  function emitGesture(name){ const now=Date.now(); if(lastGesture===name && now-lastTime<800) return; lastGesture=name; lastTime=now; window.dispatchEvent(new CustomEvent('gesture:'+name)); }

  if (typeof Hands === 'undefined' || typeof Camera === 'undefined'){ console.warn('MediaPipe Hands not loaded; gestures disabled.'); return; }
  const hands = new Hands({ locateFile: (file)=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
  hands.setOptions({ maxNumHands:1, modelComplexity:0, minDetectionConfidence:0.6, minTrackingConfidence:0.6 });
  hands.onResults((results)=>{
    if (results.multiHandLandmarks && results.multiHandedness && results.multiHandLandmarks.length){
      const hand = { landmarks: results.multiHandLandmarks[0], handedness: results.multiHandedness[0].label };
      draw(hand);
      const g = classifyGesture(hand); if (g) emitGesture(g);
    } else { ctx.clearRect(0,0,overlay.width, overlay.height); }
  });
  const cam = new Camera(video, { onFrame: async()=>{ await hands.send({image: video}); }, width: 640, height: 480 });
  cam.start();

  // Actions
  // Actions: keep layout fixed; just dim or focus
let currentFocus = null; // 'calendar' | 'weather' | 'av' | 'notes' | null

function panel(id){ return document.getElementById(id); }
function dim(el, yes){ if (!el) return; el.classList.toggle('collapsed', !!yes); }
function focus(el){
  // remove previous focus
  [panel('calendar'), panel('weather'), panel('av'), panel('notes')].forEach(p => p?.classList.remove('focused'));
  if (el){ el.classList.add('focused'); }
}
function flash(msg){
  const t=document.getElementById('newsTicker');
  if(!t) return; const prev=t.textContent; t.textContent=msg; setTimeout(()=>t.textContent=prev, 1800);
}

// ✋ Open palm = reset (show all, clear focus)
window.addEventListener('gesture:open', ()=>{
  ['calendar','weather','av','notes'].forEach(id => dim(panel(id), false));
  focus(null);
  currentFocus = null;
  flash('OPEN → reset');
});

// ✊ Fist = focus Calendar (dim others)
window.addEventListener('gesture:fist', ()=>{
  currentFocus = 'calendar';
  dim(panel('calendar'), false);
  dim(panel('weather'), true);
  dim(panel('av'), true);
  dim(panel('notes'), true);
  focus(panel('calendar'));
  flash('FIST → calendar focus');
});

// 👍 Thumbs up = focus Weather
window.addEventListener('gesture:thumbs_up', ()=>{
  currentFocus = 'weather';
  dim(panel('calendar'), true);
  dim(panel('weather'), false);
  dim(panel('av'), true);
  dim(panel('notes'), true);
  focus(panel('weather'));
  flash('THUMBS UP → weather focus');
});

// ✌️ Two fingers = focus Camera/AV (or cycle focus)
window.addEventListener('gesture:two_fingers', ()=>{
  const order = ['av','notes','calendar','weather'];
  const next = order[(Math.max(0, order.indexOf(currentFocus)) + 1) % order.length];
  currentFocus = next;
  ['calendar','weather','av','notes'].forEach(id => dim(panel(id), id !== next));
  focus(panel(next));
  flash(`TWO FINGERS → ${next} focus`);
});

})(); 
