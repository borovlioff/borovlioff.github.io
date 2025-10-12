import './main.css'


// Указываем, что canvas точно существует
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

function resizeCanvas(): void {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- Particle class ---
class Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  angle: number;
  speed: number;
  distance: number;
  size: number;
  opacity: number;

  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.baseX = this.x;
    this.baseY = this.y;
    this.angle = Math.random() * Math.PI * 2;
    this.speed = Math.random() * 0.5 + 0.1;
    this.distance = Math.random() * 100 + 50;
    this.size = Math.random() * 3 + 1;
    this.opacity = Math.random() * 0.5 + 0.1;
  }

  update(): void {
    this.angle += this.speed * 0.02;
    this.x = this.baseX + Math.cos(this.angle) * this.distance;
    this.y = this.baseY + Math.sin(this.angle) * this.distance;

    if (this.x > canvas.width) this.x = 0;
    if (this.x < 0) this.x = canvas.width;
    if (this.y > canvas.height) this.y = 0;
    if (this.y < 0) this.y = canvas.height;
  }

  draw(): void {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 165, 0, ${this.opacity})`;
    ctx.fill();
  }

  repel(x: number, y: number, force: number = 20): void {
    const dx = this.x - x;
    const dy = this.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 200 && dist > 0) {
      const angle = Math.atan2(dy, dx);
      const push = ((200 - dist) / 200) * force;
      this.baseX += Math.cos(angle) * push;
      this.baseY += Math.sin(angle) * push;

      this.baseX = Math.max(50, Math.min(canvas.width - 50, this.baseX));
      this.baseY = Math.max(50, Math.min(canvas.height - 50, this.baseY));
    }
  }
}

// --- Particles array ---
const particles: Particle[] = [];
const particleCount = 80;

for (let i = 0; i < particleCount; i++) {
  particles.push(new Particle());
}

// --- Connect particles ---
function connectParticles(): void {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 165, 0, ${0.15 * (1 - dist / 120)})`;
        ctx.lineWidth = 0.8;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

// --- Ripple effect ---
function createRipple(x: number, y: number): void {
  const ripple = document.createElement('div');
  ripple.className = 'ripple';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  document.body.appendChild(ripple);
  setTimeout(() => {
    ripple.remove();
  }, 1000);
}

// --- Handle interaction ---
function handleClick(x: number, y: number): void {
  createRipple(x, y);
  particles.forEach(p => p.repel(x, y, 25));
}

document.addEventListener('click', (e: MouseEvent) => {
  handleClick(e.clientX, e.clientY);
});

document.addEventListener('touchstart', (e: TouchEvent) => {
  const touch = e.touches[0];
  handleClick(touch.clientX, touch.clientY);
});

// --- Device orientation ---
let beta = 0;
let gamma = 0;

function handleTilt(e: DeviceOrientationEvent): void {
  beta = e.beta ?? 0;
  gamma = e.gamma ?? 0;
}

// Проверка поддержки DeviceOrientationEvent с разрешением (iOS)
if (typeof DeviceOrientationEvent !== 'undefined' && 'requestPermission' in DeviceOrientationEvent) {
  document.addEventListener('click', () => {
    (DeviceOrientationEvent as any).requestPermission()
      .then((permission: string) => {
        if (permission === 'granted') {
          window.addEventListener('deviceorientation', handleTilt);
        }
      })
      .catch(console.error);
  }, { once: true });
} else {
  window.addEventListener('deviceorientation', handleTilt);
}

// --- Animation loop ---
function animate(): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const tiltForceX = gamma * 0.8;
  const tiltForceY = beta * 0.8;

  particles.forEach(p => {
    p.baseX += tiltForceX * 0.02;
    p.baseY += tiltForceY * 0.02;
    p.baseX = Math.max(50, Math.min(canvas.width - 50, p.baseX));
    p.baseY = Math.max(50, Math.min(canvas.height - 50, p.baseY));
  });

  particles.forEach(p => {
    p.update();
    p.draw();
  });

  connectParticles();

  requestAnimationFrame(animate);
}

animate();


// console.log(import.meta.env.PROD)