// ==================== 游戏导航页面交互脚本 ====================

document.addEventListener('DOMContentLoaded', () => {
  initMouseGlowEffect();
  initHero3DEffect();
  initGameCardsAnimation();
  initStatsAnimation();
  initScrollEffects();
  initDynamicParticles();
});

function initMouseGlowEffect() {
  const heroSection = document.querySelector('.hero-section');
  const mouseGlow = document.querySelector('.mouse-glow');
  if (!heroSection || !mouseGlow) return;

  let mouseX = 0;
  let mouseY = 0;
  let glowX = 0;
  let glowY = 0;
  const smoothFactor = 0.1;

  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  heroSection.addEventListener('mouseenter', () => {
    mouseGlow.style.opacity = '1';
  });

  heroSection.addEventListener('mouseleave', () => {
    mouseGlow.style.opacity = '0';
  });

  function updateGlow() {
    glowX += (mouseX - glowX) * smoothFactor;
    glowY += (mouseY - glowY) * smoothFactor;
    mouseGlow.style.left = glowX + 'px';
    mouseGlow.style.top = glowY + 'px';
    requestAnimationFrame(updateGlow);
  }

  updateGlow();
}

function initHero3DEffect() {
  const heroSection = document.querySelector('.hero-section');
  const heroContent = document.querySelector('.hero-content');
  
  if (!heroSection || !heroContent) return;
  
  let rafId = null;
  let targetRotateX = 0;
  let targetRotateY = 0;
  let currentRotateX = 0;
  let currentRotateY = 0;
  
  function updateTransform() {
    currentRotateX += (targetRotateX - currentRotateX) * 0.1;
    currentRotateY += (targetRotateY - currentRotateY) * 0.1;
    
    if (Math.abs(targetRotateX - currentRotateX) > 0.01 || Math.abs(targetRotateY - currentRotateY) > 0.01) {
      heroContent.style.transform = `perspective(1000px) rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg)`;
      rafId = requestAnimationFrame(updateTransform);
    } else {
      heroContent.style.transform = `perspective(1000px) rotateX(${targetRotateX}deg) rotateY(${targetRotateY}deg)`;
      rafId = null;
    }
  }

  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    targetRotateX = (mouseY - centerY) / centerY * -5;
    targetRotateY = (mouseX - centerX) / centerX * 5;
    
    if (!rafId) {
      rafId = requestAnimationFrame(updateTransform);
    }
  });

  heroSection.addEventListener('mouseleave', () => {
    targetRotateX = 0;
    targetRotateY = 0;
    if (!rafId) {
      rafId = requestAnimationFrame(updateTransform);
    }
  });
}

function initDynamicParticles() {
  const heroSection = document.querySelector('.hero-section');
  const particlesContainer = document.querySelector('.particles-container');
  if (!heroSection || !particlesContainer) return;

  const particleCount = 15;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 15 + 's';
    particle.style.animationDuration = (12 + Math.random() * 8) + 's';
    particlesContainer.appendChild(particle);
  }
}

/**
 * 游戏卡片入场动画
 */
function initGameCardsAnimation() {
  const gameCards = document.querySelectorAll('.game-card');
  
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // 添加延迟，实现依次入场效果
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, index * 80);
        
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  gameCards.forEach(card => {
    // 初始状态
    card.style.opacity = '0';
    card.style.transform = 'translateY(40px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    
    observer.observe(card);
  });
}

/**
 * 统计数字动画
 */
function initStatsAnimation() {
  const statNumbers = document.querySelectorAll('.stat-number');
  
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const finalValue = parseInt(target.textContent);
        animateNumber(target, finalValue);
        observer.unobserve(target);
      }
    });
  }, observerOptions);
  
  statNumbers.forEach(stat => {
    observer.observe(stat);
  });
}

/**
 * 数字滚动动画
 */
function animateNumber(element, finalValue) {
  const duration = 1500;
  const startTime = performance.now();
  const startValue = 0;
  
  function updateNumber(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // 使用 easeOutQuart 缓动函数
    const easeProgress = 1 - Math.pow(1 - progress, 4);
    const currentValue = Math.floor(startValue + (finalValue - startValue) * easeProgress);
    
    element.textContent = currentValue;
    
    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    } else {
      element.textContent = finalValue;
    }
  }
  
  requestAnimationFrame(updateNumber);
}

/**
 * 滚动效果
 */
function initScrollEffects() {
  const heroSection = document.querySelector('.hero-section');
  const heroContent = document.querySelector('.hero-content');
  
  if (!heroSection || !heroContent) return;
  
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroHeight = heroSection.offsetHeight;
    
    // Hero 区域视差效果
    if (scrollY < heroHeight) {
      const parallaxSpeed = 0.5;
      heroSection.style.transform = `translateY(${scrollY * parallaxSpeed}px)`;
      
      // 淡出效果
      const opacity = 1 - (scrollY / heroHeight);
      heroSection.style.opacity = Math.max(opacity, 0);
      
      // 内容缩放效果
      const scale = 1 - (scrollY / (heroHeight * 2));
      heroContent.style.transform = `scale(${Math.max(scale, 0.8)})`;
      heroContent.style.opacity = Math.max(opacity, 0.7);
    }
  });
}

/**
 * 游戏卡片悬停音效（可选）
 * 需要添加音频文件才能使用
 */
function playHoverSound() {
  // const audio = new Audio('/Games/Audio/hover.mp3');
  // audio.volume = 0.2;
  // audio.play().catch(() => {});
}

/**
 * 添加卡片悬停事件
 */
document.querySelectorAll('.game-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.zIndex = '10';
  });
  
  card.addEventListener('mouseleave', () => {
    setTimeout(() => {
      card.style.zIndex = '1';
    }, 300);
  });
});

/**
 * 平滑滚动到锚点
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href !== '#') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  });
});
