/* ============================================
   GameZone Priv - Link in Bio
   3D Particle System + Interactive Effects
   ============================================ */

// ============================================
// 3D Particle Mesh System
// ============================================
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.connections = [];
        this.mouse = { x: null, y: null, radius: 150 };
        this.animationId = null;

        this.init();
    }

    init() {
        this.resize();
        this.createParticles();
        this.addEventListeners();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // Recalculate particle count based on screen size (mobile optimized)
        const area = this.canvas.width * this.canvas.height;
        this.particleCount = Math.min(Math.floor(area / 12000), 80);
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(new Particle(this.canvas.width, this.canvas.height));
        }
    }

    addEventListeners() {
        window.addEventListener('resize', () => {
            this.resize();
            this.createParticles();
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });

        window.addEventListener('mouseout', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });

        // Touch support for mobile
        window.addEventListener('touchmove', (e) => {
            this.mouse.x = e.touches[0].clientX;
            this.mouse.y = e.touches[0].clientY;
        });

        window.addEventListener('touchend', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw particles
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].update(this.canvas.width, this.canvas.height, this.mouse);
            this.particles[i].draw(this.ctx);
        }

        // Draw connections between nearby particles
        this.drawConnections();

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    drawConnections() {
        const maxDistance = 120;
        const maxConnections = 3;

        for (let i = 0; i < this.particles.length; i++) {
            let connections = 0;
            for (let j = i + 1; j < this.particles.length; j++) {
                if (connections >= maxConnections) break;

                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    const opacity = 1 - (distance / maxDistance);
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(0, 242, 255, ${opacity * 0.3})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                    connections++;
                }
            }
        }
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// ============================================
// Individual Particle Class
// ============================================
class Particle {
    constructor(canvasWidth, canvasHeight) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.size = Math.random() * 2.5 + 1;
        this.speedX = (Math.random() - 0.5) * 1.5;
        this.speedY = (Math.random() - 0.5) * 1.5;
        this.color = this.getRandomColor();
        this.opacity = Math.random() * 0.5 + 0.3;
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
        this.pulseAngle = Math.random() * Math.PI * 2;
    }

    getRandomColor() {
        const colors = [
            '0, 242, 255',   // Cyan
            '255, 0, 228',   // Pink
            '255, 234, 0',   // Yellow
            '138, 43, 226',  // Purple
            '0, 255, 136'    // Green
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update(canvasWidth, canvasHeight, mouse) {
        // Mouse interaction
        if (mouse.x != null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                const force = (mouse.radius - distance) / mouse.radius;
                const directionX = dx / distance;
                const directionY = dy / distance;
                this.speedX += directionX * force * 0.5;
                this.speedY += directionY * force * 0.5;
            }
        }

        // Move particle
        this.x += this.speedX;
        this.y += this.speedY;

        // Friction to slow down after mouse interaction
        this.speedX *= 0.99;
        this.speedY *= 0.99;

        // Bounce off edges
        if (this.x < 0 || this.x > canvasWidth) {
            this.speedX = -this.speedX;
        }
        if (this.y < 0 || this.y > canvasHeight) {
            this.speedY = -this.speedY;
        }

        // Pulse animation
        this.pulseAngle += this.pulseSpeed;
    }

    draw(ctx) {
        const pulseSize = this.size + Math.sin(this.pulseAngle) * 0.5;
        const pulseOpacity = this.opacity + Math.sin(this.pulseAngle) * 0.2;

        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.5, pulseSize), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${Math.max(0, Math.min(1, pulseOpacity))})`;
        ctx.fill();

        // Glow effect
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.5, pulseSize * 2), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${Math.max(0, Math.min(1, pulseOpacity * 0.15))})`;
        ctx.fill();
    }
}

// ============================================
// Ripple Effect for Button
// ============================================
function createRipple(event, button) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    button.appendChild(ripple);

    // Remove ripple after animation
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// ============================================
// Scale Animation on Click
// ============================================
function addClickAnimation(button) {
    button.addEventListener('click', function(e) {
        // Create ripple
        createRipple(e, this);

        // Scale animation
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
    });
}

// ============================================
// Entrance Animations
// ============================================
function addEntranceAnimations() {
    const elements = document.querySelectorAll('.profile-wrapper, .name, .social-icons, .main-btn, .copyright');

    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 200 + (index * 150));
    });
}

// ============================================
// Parallax Effect on Scroll/Mouse
// ============================================
function addParallaxEffect() {
    const container = document.querySelector('.container');

    document.addEventListener('mousemove', (e) => {
        const x = (window.innerWidth / 2 - e.clientX) / 50;
        const y = (window.innerHeight / 2 - e.clientY) / 50;

        container.style.transform = `translate(${x}px, ${y}px)`;
    });
}

// ============================================
// Initialize Everything
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize particle system
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const particleSystem = new ParticleSystem(canvas);

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            particleSystem.destroy();
        });
    }

    // Add ripple and click effects to main button
    const mainBtn = document.querySelector('.main-btn');
    if (mainBtn) {
        addClickAnimation(mainBtn);
    }

    // Add entrance animations
    addEntranceAnimations();

    // Add parallax effect (disabled on mobile for performance)
    if (window.innerWidth > 768) {
        addParallaxEffect();
    }

    // Add tilt effect to social icons
    const socialIcons = document.querySelectorAll('.social-icon');
    socialIcons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.15) rotate(5deg)';
        });
        icon.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });

    // Add magnetic effect to profile image
    const profileWrapper = document.querySelector('.profile-wrapper');
    if (profileWrapper && window.innerWidth > 768) {
        profileWrapper.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            this.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
        });

        profileWrapper.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    }

    console.log('🎮 GameZone Priv - Link in Bio loaded successfully!');
});
