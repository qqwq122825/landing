(() => {
 'use strict';
 function initVideos() {
  document.querySelectorAll('#main-layer video').forEach(v => {
   v.muted = true;
   const play = () => v.play().then(() => v.parentElement.classList.add('v-ready')).catch(() => {});
   if (v.readyState >= 2) play();
   else v.addEventListener('loadeddata', play, {once: true});
  });
 }
 function startHeartAnim() {
  const canvas = document.getElementById('heartCanvas');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0;
  const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
  window.addEventListener('resize', resize);
  resize();
  class Heart {
   constructor() { this.reset(true); }
   reset(initial) {
    this.x = Math.random() * w;
    this.y = initial ? Math.random() * h : h + 20;
    this.size = Math.random() * 10 + 5;
    this.speed = Math.random() * 2 + 1;
    this.opacity = Math.random() * 0.5 + 0.2;
   }
   draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = '#ff2d55';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-this.size / 2, -this.size / 2, -this.size, this.size / 3, 0, this.size);
    ctx.bezierCurveTo(this.size, this.size / 3, this.size / 2, -this.size / 2, 0, 0);
    ctx.fill();
    ctx.restore();
   }
   update() {
    this.y -= this.speed;
    if (this.y < -50) this.reset(false);
   }
  }
  const hearts = Array.from({length: 15}, () => new Heart());
  const loop = () => {
   ctx.clearRect(0, 0, w, h);
   hearts.forEach(item => { item.update(); item.draw(); });
   requestAnimationFrame(loop);
  };
  loop();
 }
 document.addEventListener('DOMContentLoaded', () => {
  const main = document.getElementById('main-layer');
  if (main) {
   main.style.opacity = '1';
   main.style.pointerEvents = 'auto';
  }
  initVideos();
  startHeartAnim();
 });
})();
