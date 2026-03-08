// ==================== 游戏导航页面交互脚本 ====================

document.addEventListener('DOMContentLoaded', () => {
  // 初始化游戏卡片动画
  initGameCardsAnimation();
  
  // 初始化统计数字动画
  initStatsAnimation();
  
  // 初始化滚动效果
  initScrollEffects();
});

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
  
  if (!heroSection) return;
  
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
