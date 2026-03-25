// wave.js cafe25 v.1.2
window.WaveformVisualizer = (() => {
  const BAR_COUNT = 64;
  const HEIGHT_SCALE = 0.45;
  const PULSE_SPEED = 0.003;
  const PULSE_STRENGTH = 0.15;
  // const barColor = 'rgba(178, 178, 178, 0.9)';
  const barColor = 'rgba(128, 128, 255, 0.8)';

  let canvas, ctx;
  let offsets, speeds;
  let analyser = null, dataArray = null;
  let running = false;
  let groupPattern = new Array(BAR_COUNT);
  const kickThreshold = 0.4;

  function init({ canvasEl, analyser: extAnalyser }) {
    canvas = canvasEl;
    ctx = canvas.getContext("2d");
    offsets = Array.from({ length: BAR_COUNT }, () => Math.random() * Math.PI * 2);
    speeds = Array.from({ length: BAR_COUNT }, () => 0.02 + Math.random() * 0.05);
    analyser = extAnalyser;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    generateGroups();
    resizeCanvas();
    drawStatic();
    window.addEventListener("resize", () => {
      resizeCanvas();
      drawStatic();
    });
  }

  function resizeCanvas() {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  function generateGroups() {
    let i = 0;
    const groupSizes = [6,6,6], gapSize = 5;
    for(let g=0; g<3; g++){
      for(let j=0;j<groupSizes[g]&&i<BAR_COUNT;j++,i++) groupPattern[i]=0.5+Math.random()*0.5;
      for(let j=0;j<gapSize&&i<BAR_COUNT;j++,i++) groupPattern[i]=0.1;
    }
    for(;i<BAR_COUNT;i++) groupPattern[i]=0.05+Math.random()*0.15;
  }

  function drawStatic(){
    if(!canvas) return;
    const w=canvas.clientWidth, h=canvas.clientHeight, centerY=h/2, barW=w/BAR_COUNT;
    ctx.clearRect(0,0,w,h);
    const time = Date.now()*0.002;
    for(let i=0;i<BAR_COUNT;i++){
      offsets[i]+=speeds[i];
      const t=Math.abs(i/(BAR_COUNT-1)-0.5)*2;
      const shape=Math.pow(1-t,2.6);
      const wave=(Math.sin(offsets[i]+time)+1)/2;
      const amplitude=shape*wave*h*HEIGHT_SCALE*groupPattern[i];
      const x=i*barW+barW*0.15;
      const y=centerY-amplitude;
      const width=barW*0.7, height=amplitude*2, radius=Math.min(width/2,height/2);
      ctx.fillStyle=barColor;
      drawRoundedBar(x,y,width,height,radius);
    }
    requestAnimationFrame(drawStatic);
  }

  function draw(){
    if(!running) return;
    analyser.getByteFrequencyData(dataArray);
    const w=canvas.clientWidth,h=canvas.clientHeight,centerY=h/2,barW=w/BAR_COUNT;
    const bass=dataArray.slice(0,Math.floor(dataArray.length*0.15));
    const bassAvg=bass.reduce((s,v)=>s+v,0)/bass.length/255;
    const kickLevel=bassAvg>kickThreshold?1:0;
    const mid=dataArray.slice(Math.floor(dataArray.length*0.15),Math.floor(dataArray.length*0.5));
    const midAvg=mid.reduce((s,v)=>s+v,0)/mid.length/255;
    const pulse=1+PULSE_STRENGTH*Math.sin(Date.now()*PULSE_SPEED);
    for(let i=0;i<BAR_COUNT;i++){
      offsets[i]+=speeds[i];
      const t=Math.abs(i/(BAR_COUNT-1)-0.5)*2;
      const shape=Math.pow(1-t,2.6);
      const freqIndex=Math.floor(t*(dataArray.length-1));
      const audioAmp=dataArray[freqIndex]/255;
      const centerBoost=1+(1-t)*kickLevel*1.5;
      const sideBoost=0.6+midAvg*(1-t);
      const wave=(Math.sin(offsets[i])+1)/2;
      const amplitude=shape*wave*audioAmp*h*HEIGHT_SCALE*pulse*centerBoost*sideBoost*groupPattern[i];
      const x=i*barW+barW*0.15;
      const y=centerY-amplitude;
      const width=barW*0.7,height=amplitude*2,radius=Math.min(width/2,height/2);
      ctx.fillStyle=barColor;
      drawRoundedBar(x,y,width,height,radius);
    }
    requestAnimationFrame(draw);
  }

  function drawRoundedBar(x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
    ctx.fill();
  }

  function start(){ if(!running){ running=true; requestAnimationFrame(draw); } }
  function stop(){ running=false; drawStatic(); }

  return { init, resizeCanvas, drawStatic, start, stop };
})();