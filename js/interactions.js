/**
 * UI 인터랙션 및 이벤트 핸들러 모듈 (interactions.js)
 * 슬라이더, 탭 전환, 라우팅 링크 및 상단 이동 스크롤 동작을 처리합니다.
 */
export function initCarousels(root=document){
  root.querySelectorAll('[data-carousel]').forEach(carousel=>{
    const track=carousel.querySelector('[data-track]');
    const prev=carousel.querySelector('[data-prev]');
    const next=carousel.querySelector('[data-next]');
    if(!track) return;
    let x=0;
    const step=480;
    const viewport=carousel.querySelector('.scroll-viewport') || carousel;
    const update=()=>{ 
      track.style.transform=`translateX(${-x}px)`; 
      if(prev) {
        prev.style.opacity = x <= 0 ? '0.35' : '1';
        prev.style.cursor = x <= 0 ? 'default' : 'pointer';
      }
      if(next) {
        const maxScroll = Math.max(0, track.scrollWidth - viewport.clientWidth);
        next.style.opacity = x >= maxScroll ? '0.35' : '1';
        next.style.cursor = x >= maxScroll ? 'default' : 'pointer';
      }
    };
    next?.addEventListener('click',()=>{ 
      const maxScroll = Math.max(0, track.scrollWidth - viewport.clientWidth);
      x = Math.min(x + step, maxScroll); 
      update(); 
    });
    prev?.addEventListener('click',()=>{ 
      x = Math.max(0, x - step); 
      update(); 
    });
    update();
  });
}

export function initTabs(root=document){
  root.querySelectorAll('.tabs').forEach(tabs=>{
    tabs.addEventListener('click',e=>{
      const btn=e.target.closest('button'); if(!btn) return;
      tabs.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

export function initNewsSlider(root=document){
  const slider = root.querySelector('[data-news-slider]');
  if(!slider) return;
  const track = slider.querySelector('[data-news-track]');
  const slides = slider.querySelectorAll('.news-slide');
  const prev = slider.querySelector('[data-news-prev]');
  const next = slider.querySelector('[data-news-next]');
  const dots = slider.querySelectorAll('[data-news-pagination] .dot');
  if(!track || slides.length === 0) return;

  let currentIndex = 0;
  const totalSlides = slides.length;
  let timer = null;

  const goToSlide = (idx) => {
    currentIndex = (idx + totalSlides) % totalSlides;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === currentIndex);
    });
  };

  const startAutoPlay = () => {
    stopAutoPlay();
    timer = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, 5000);
  };

  const stopAutoPlay = () => {
    if(timer){
      clearInterval(timer);
      timer = null;
    }
  };

  next?.addEventListener('click', (e) => {
    e.stopPropagation();
    goToSlide(currentIndex + 1);
    startAutoPlay();
  });

  prev?.addEventListener('click', (e) => {
    e.stopPropagation();
    goToSlide(currentIndex - 1);
    startAutoPlay();
  });

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      goToSlide(idx);
      startAutoPlay();
    });
  });

  // 배너에 마우스 호버 시 자동 넘김 일시정지, 마우스 떠나면 재개
  slider.addEventListener('mouseenter', stopAutoPlay);
  slider.addEventListener('mouseleave', startAutoPlay);

  goToSlide(0);
  startAutoPlay();
}

export function initHeroSlider(root=document){
  const slider = root.querySelector('[data-hero-slider]');
  if(!slider) return;
  const track = slider.querySelector('[data-hero-track]');
  const slides = slider.querySelectorAll('[data-hero-slide]');
  const prev = slider.querySelector('[data-hero-prev]');
  const next = slider.querySelector('[data-hero-next]');
  const pauseBtn = slider.querySelector('[data-hero-pause]');
  const currentIdxEl = slider.querySelector('.current-idx');
  if(!track || slides.length === 0) return;

  let currentIndex = 0;
  const totalSlides = slides.length;
  let timer = null;
  let isPlaying = true;

  const goToSlide = (idx) => {
    currentIndex = (idx + totalSlides) % totalSlides;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    if(currentIdxEl){
      currentIdxEl.textContent = currentIndex + 1;
    }
  };

  const startAutoPlay = () => {
    stopAutoPlay();
    if(!isPlaying) return;
    timer = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, 5000);
  };

  const stopAutoPlay = () => {
    if(timer){
      clearInterval(timer);
      timer = null;
    }
  };

  next?.addEventListener('click', (e) => {
    e.stopPropagation();
    goToSlide(currentIndex + 1);
    startAutoPlay();
  });

  prev?.addEventListener('click', (e) => {
    e.stopPropagation();
    goToSlide(currentIndex - 1);
    startAutoPlay();
  });

  pauseBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    isPlaying = !isPlaying;
    pauseBtn.textContent = isPlaying ? '❚❚' : '▶';
    pauseBtn.setAttribute('aria-label', isPlaying ? '일시정지' : '재생');
    if(isPlaying){
      startAutoPlay();
    }else{
      stopAutoPlay();
    }
  });

  slider.addEventListener('mouseenter', stopAutoPlay);
  slider.addEventListener('mouseleave', () => {
    if(isPlaying) startAutoPlay();
  });

  goToSlide(0);
  startAutoPlay();
}

export function initBookLinks(root=document){
  root.addEventListener('click', (e) => {
    if (e.target.closest('.hero-controls, .hero-arrow, .cover-plus-btn, .add-btn-round, .coming-alarm-btn, .section-controls, .news-arrow-btn, .tabs button, .curation-add-btn, .add-btn, .ranking-period-btn, .ranking-more-btn')) {
      return;
    }

    const anchor = e.target.closest('a[href]');
    if (anchor && anchor.getAttribute('href') && anchor.getAttribute('href') !== '#' && !anchor.classList.contains('curation-banner-link')) {
      return;
    }

    const bookEl = e.target.closest('.hero-slide, .book-card, .curation-mini, .curation-banner-wrap, .ranking-item, .panel-card, .fresh-card, .fresh-highlight-card, .ranking-row, .featured-left, .ai-book-card, .coming-soon-card, .editor-story-card, .qna-card');
    if (!bookEl) return;

    let title = bookEl.dataset.bookTitle || 
      bookEl.querySelector('.hero-title, .book-title, .ranking-title, .curation-mini-title, .panel-card-title, .fresh-highlight-title, .coming-soon-title, .ai-question-title, .editor-story-title')?.textContent?.trim() || '';
    let author = bookEl.dataset.bookAuthor || 
      bookEl.querySelector('.book-author, .ranking-author, .curation-mini-author, .fresh-highlight-author, .coming-soon-author')?.textContent?.trim() || '';
    let cover = bookEl.dataset.bookCover || 
      bookEl.querySelector('img.book-cover, img.ranking-cover, img.featured-cover, img.ai-book-cover, img.editor-story-img, img')?.getAttribute('src') || '';

    if (!title && bookEl.closest('.featured')) {
      const img = bookEl.closest('.featured').querySelector('.featured-cover');
      title = img?.getAttribute('alt') || '스스로 정리하는 아이';
      cover = img?.getAttribute('src') || '';
    }

    if (title) {
      window.location.href = `detail.html?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&cover=${encodeURIComponent(cover)}`;
    }
  });
}

export function initGoTop(){
  document.querySelector('.go-top')?.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
}
