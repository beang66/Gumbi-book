/**
 * 메인 뷰 DOM 렌더링 엔진 (render.js)
 * 섹션별 HTML 마크업 생성 및 동적 데이터 템플릿 바인딩을 수행합니다.
 */
function asset (path) {
  if (!path) return ''
  return location.pathname.includes('/components/')
    ? '../' + path.replace(/^\.\//, '')
    : path
}

const OVERLAYS = [
  { tag: '검비로드', text: '이번 달 오리지널 독점 소설', theme: 'theme-blue' },
  { tag: '지금 주목 독독', text: '하루 15분씩 X 7일 독서, 내 마음을 읽어주는 책', theme: 'theme-yellow' },
  { tag: '에디터 추천', text: '봄내 영에 없이 다행이야, 소설 속 인물들!', theme: 'theme-black' },
  { tag: '지금 주목 독독', text: '검비가 회원이 10주년 후에도 다시 읽고 싶어하는 책', theme: 'theme-green' },
  { tag: '독서 챌린지', text: '아무것도 하지 않아도 괜찮은 이틀', theme: 'theme-teal' }
]

function bookCard (book, rank, secId, index) {
  let overlayHtml = ''
  if (secId === 'new-books') {
    const ov = OVERLAYS[index % OVERLAYS.length]
    overlayHtml = `<div class="book-overlay ${ov.theme}">
      <span class="overlay-tag">${ov.tag}</span>
      <p class="overlay-text">${ov.text}</p>
    </div>`
  }

  return `<article class="book-card"><div class="book-cover-wrap"><img class="book-cover" src="${asset(
    book.cover
  )}" alt="${book.title}">${
    rank ? `<strong class="book-rank">${rank}</strong>` : ''
  }${overlayHtml}</div><h3 class="book-title">${book.title}</h3><p class="book-author">${
    book.author
  }</p>${
    book.badge ? `<span class="badge">${book.badge}</span>` : ''
  }</article>`
}

function heading (title, subtitle, controls = false) {
  return `<header class="section-head"><div><h2 class="section-title">${title}</h2>${
    subtitle ? `<p class="section-subtitle">${subtitle}</p>` : ''
  }</div>${
    controls
      ? `<div class="section-controls"><button data-prev aria-label="이전">‹</button><button data-next aria-label="다음">›</button></div>`
      : '<a class="section-more" href="#">›</a>'
  }</header>`
}

function getFormattedToday () {
  const today = new Date()
  const month = today.getMonth() + 1
  const date = today.getDate()
  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
  const dayOfWeek = dayNames[today.getDay()]
  return `${month}월 ${date}일 ${dayOfWeek} 업데이트`
}

function featured (data) {
  const b = data.book
  const quote = data.quote || b.description
  return `<section class="section">
    ${heading('오늘의 인생책', getFormattedToday())}
    <div class="featured">
      <div class="featured-left">
        <div class="featured-cover-container">
          <img class="featured-cover-blur" src="${asset(b.cover)}" alt="" aria-hidden="true">
          <div class="featured-cover-wrap">
            <img class="featured-cover" src="${asset(b.cover)}" alt="${b.title}">
            <span class="audiobook-badge">🎧</span>
            <button class="add-btn-round">+</button>
          </div>
        </div>
      </div>
      <article class="featured-card">
        <div class="featured-card-head">
          <div class="user-avatar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#a0aec0"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </div>
          <div class="user-info">
            <strong class="user-title">${data.title || '검비 회원의 인생책'}</strong>
            <p class="user-recommender">${data.recommender}</p>
          </div>
        </div>
        <div class="featured-quote-wrap">
          <span class="quote-mark start">“</span>
          <p class="featured-quote">${quote}</p>
          <span class="quote-mark end">”</span>
        </div>
        <div class="featured-points">
          ${data.points.map(p => `<div><span class="check-icon">✓</span> ${p}</div>`).join('')}
        </div>
      </article>
    </div>
  </section>`
}

function curation (data) {
  return `<section class="section carousel-wrap" data-carousel>
    ${heading(data.title, data.subtitle, true)}
    <div class="scroll-viewport">
      <div class="curation-track" data-track>
        ${data.cards
          .map(
            c => `
          <article class="curation-card">
            <a href="./detail.html?title=${encodeURIComponent(c.featuredBookTitle || (c.books && c.books[0] ? c.books[0].title : c.title.replace(/\n/g, ' ')))}&author=${encodeURIComponent(c.featuredBookAuthor || (c.books && c.books[0] ? c.books[0].author : ''))}&cover=${encodeURIComponent(c.featuredBookCover || (c.books && c.books[0] ? c.books[0].cover : asset(c.image)))}" style="display:block; text-decoration:none; color:inherit;" class="curation-banner-link">
              <div class="curation-banner-wrap" data-book-title="${c.featuredBookTitle || (c.books && c.books[0] ? c.books[0].title : c.title.replace(/\n/g, ' '))}" data-book-author="${c.featuredBookAuthor || (c.books && c.books[0] ? c.books[0].author : '')}" data-book-cover="${c.featuredBookCover || (c.books && c.books[0] ? c.books[0].cover : asset(c.image))}">
                <img src="${asset(c.image)}" alt="${c.featuredBookTitle || c.title}" style="${c.position ? `object-position: ${c.position};` : ''}">
                <div class="curation-banner-overlay">
                  ${c.tag ? `<span class="curation-tag">${c.tag}</span>` : ''}
                  <h3 class="curation-banner-title">${(c.title || '').replace(/\n/g, '<br>')}</h3>
                </div>
              </div>
            </a>
            <div class="curation-card-body">
              ${(c.books || [])
                .map(
                  b => `
                <div class="curation-mini" data-book-title="${b.title}" data-book-author="${b.author}" data-book-cover="${asset(b.cover)}">
                  <img src="${asset(b.cover)}" alt="${b.title}">
                  <div class="curation-mini-info">
                    <strong class="curation-mini-title" title="${b.title}">${b.title}</strong>
                    <span class="curation-mini-author" title="${b.author}">${b.author}</span>
                    ${b.badge ? `<span class="curation-mini-badge ${b.badge === '무료' ? 'free' : ''}">${b.badge}</span>` : ''}
                  </div>
                  <button class="curation-add-btn">+ 담기</button>
                </div>
              `
                )
                .join('')}
            </div>
          </article>
        `
          )
          .join('')}
      </div>
    </div>
  </section>`
}

function rankingCard (book, rank) {
  return `<article class="ranking-item" data-book-title="${book.title}" data-book-author="${book.author}" data-book-cover="${asset(book.cover)}">
    <span class="ranking-num">${rank}</span>
    <img class="ranking-cover" src="${asset(book.cover)}" alt="${book.title}" onerror="this.onerror=null; this.src='./assets/books/book-cover-01.webp';">
    <div class="ranking-info">
      <h3 class="ranking-title">${book.title}</h3>
      <p class="ranking-author">${book.author}</p>
    </div>
    <button class="add-btn">+ 담기</button>
  </article>`
}

function rankingSection (sec) {
  return `<section class="section" id="ranking-section">
    <header class="section-head">
      <div>
        <h2 class="section-title" style="display:inline-block">${sec.title}</h2>
        <span class="ranking-sub-title">서점 베스트</span>
      </div>
    </header>
    ${
      sec.tabs?.length
        ? `<div class="tabs ranking-tabs">${sec.tabs
            .map(
              (t, i) => `<button class="${i === 0 ? 'active' : ''}">${t}</button>`
            )
            .join('')}</div>`
        : ''
    }
    <div class="ranking-filter-bar">
      <button class="ranking-period-btn">일간 ⌵</button>
    </div>
    <div class="ranking-grid">${sec.books
      .map((b, i) => rankingCard(b, i + 1))
      .join('')}</div>
    <button class="ranking-more-btn">검비 랭킹 더보기</button>
  </section>`
}

function editorStorySection (sec) {
  return `<section class="section" id="editor-story-section">
    <header class="section-head">
      <div>
        <h2 class="section-title">${sec.title}</h2>
        ${sec.subtitle ? `<p class="section-subtitle">${sec.subtitle}</p>` : ''}
      </div>
      <a class="section-more" href="#">›</a>
    </header>
    <div class="editor-story-grid">
      ${sec.cards
        .map(
          c => `
        <article class="editor-story-card">
          <div class="editor-story-img-wrap">
            <img class="editor-story-img" src="${asset(c.cover)}" alt="${c.title}">
          </div>
          <span class="editor-story-tag">${c.tag}</span>
          <h3 class="editor-story-title">${c.title.replace(/\n/g, '<br>')}</h3>
        </article>
      `
        )
        .join('')}
    </div>
  </section>`
}

function freshBooksSection (sec) {
  const highlight = sec.highlightBook || sec.books?.[0]
  const list = sec.books || []
  return `<section class="section carousel-wrap fresh-books-section" data-carousel id="fresh-books-section">
    ${heading(sec.title, sec.subtitle, true)}
    ${
      sec.tabs?.length
        ? `<div class="tabs">${sec.tabs
            .map(
              (t, i) => `<button class="${i === 0 ? 'active' : ''}">${t}</button>`
            )
            .join('')}</div>`
        : ''
    }
    <div class="scroll-viewport">
      <div class="fresh-track" data-track>
        ${
          highlight
            ? `<article class="fresh-highlight-card">
                <div class="fresh-highlight-top">
                  <div class="book-cover-wrap fresh-cover-wrap">
                    <img class="book-cover" src="${asset(highlight.cover)}" alt="${highlight.title}">
                    <button class="cover-plus-btn" aria-label="담기">+</button>
                  </div>
                  <div class="fresh-highlight-info">
                    <h3 class="fresh-highlight-title">${highlight.title}</h3>
                    <p class="fresh-highlight-author">${highlight.author}</p>
                  </div>
                </div>
                <p class="fresh-highlight-quote">${(highlight.quote || '').replace(/\n/g, '<br>')}</p>
              </article>`
            : ''
        }
        <div class="fresh-regular-grid">
          ${list
            .map(
              b => `
            <article class="book-card fresh-card">
              <div class="book-cover-wrap">
                <img class="book-cover" src="${asset(b.cover)}" alt="${b.title}">
                <button class="cover-plus-btn" aria-label="담기">+</button>
              </div>
              <h3 class="book-title">${b.title.replace(/\n/g, '<br>')}</h3>
              <p class="book-author">${b.author}</p>
            </article>
          `
            )
            .join('')}
        </div>
      </div>
    </div>
  </section>`
}

function comingSoonSection (sec) {
  return `<section class="section carousel-wrap coming-soon-section" data-carousel id="coming-soon-section">
    ${heading(sec.title, sec.subtitle, true)}
    <div class="scroll-viewport">
      <div class="coming-soon-track" data-track>
        ${sec.cards
          .map(
            c => `
          <article class="coming-soon-card">
            <div class="coming-soon-top" style="background-color: ${c.bgColor || '#f5f5f7'};">
              <div class="book-cover-wrap coming-cover-wrap">
                <img class="book-cover" src="${asset(c.cover)}" alt="${c.title}">
                <button class="cover-plus-btn" aria-label="담기">+</button>
              </div>
              <div class="coming-soon-info">
                <h3 class="coming-soon-title">${c.title}</h3>
                <p class="coming-soon-author">${c.author}</p>
                <div class="coming-soon-badges">
                  ${(c.badges || [])
                    .map(
                      b => `<span class="coming-badge badge-${b.type || 'yellow'}">${b.text}</span>`
                    )
                    .join('')}
                </div>
              </div>
            </div>
            <p class="coming-soon-quote">${(c.quote || '').replace(/\n/g, '<br>')}</p>
            <button class="coming-alarm-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              알림 받기
            </button>
          </article>
        `
          )
          .join('')}
      </div>
    </div>
  </section>`
}

function bookSection (sec) {
  if (sec.id === 'editor-picks' || sec.type === 'fresh-books') {
    return freshBooksSection(sec)
  }
  if (sec.id === 'more-books' || sec.type === 'coming-soon') {
    return comingSoonSection(sec)
  }
  if (sec.cards && sec.cards.length > 0) {
    return editorStorySection(sec)
  }
  return `<section class="section carousel-wrap" data-carousel>${heading(
    sec.title,
    sec.subtitle,
    true
  )}${
    sec.tabs?.length
      ? `<div class="tabs">${sec.tabs
          .map(
            (t, i) => `<button class="${i === 0 ? 'active' : ''}">${t}</button>`
          )
          .join('')}</div>`
      : ''
  }<div class="scroll-viewport"><div class="book-track" data-track>${(sec.books || [])
    .map((b, i) => bookCard(b, null, sec.id, i))
    .join('')}</div></div></section>`
}

function newsSection (sec) {
  const slides = sec.slides || [sec.cards || []]
  return `<section class="section news-section" id="news-section" data-news-slider>
    <header class="section-head">
      <div>
        <h2 class="section-title">${sec.title}</h2>
      </div>
    </header>
    <div class="news-slider-viewport">
      <!-- 호버 시 나타나는 양 옆 화살표 버튼 -->
      <button class="news-arrow-btn news-prev-btn" aria-label="이전 배너" data-news-prev>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button class="news-arrow-btn news-next-btn" aria-label="다음 배너" data-news-next>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      </button>

      <div class="news-slider-track" data-news-track>
        ${slides
          .map(
            (slideCards, sIdx) => `
          <div class="news-slide" data-slide-index="${sIdx}">
            ${slideCards
              .map(
                c => `
              <article class="news-banner-card" style="background-color: ${c.bgColor || '#21a185'};">
                <div class="news-banner-text">
                  ${c.badge ? `<span class="news-banner-badge">${c.badge}</span>` : ''}
                  <h3 class="news-banner-title">${(c.title || '').replace(/\n/g, '<br>')}</h3>
                  ${c.desc ? `<p class="news-banner-desc">${c.desc}</p>` : ''}
                </div>
                ${
                  c.image
                    ? `<div class="news-banner-img-wrap">
                        <img src="${asset(c.image)}" alt="${c.title}" onerror="this.style.display='none'">
                      </div>`
                    : ''
                }
              </article>
            `
              )
              .join('')}
          </div>
        `
          )
          .join('')}
      </div>
    </div>
    <div class="news-pagination" data-news-pagination>
      ${[0, 1, 2, 3, 4, 5, 6, 7]
        .map(
          i =>
            `<span class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`
        )
        .join('')}
    </div>
  </section>`
}

function postSection (sec) {
  return `<section class="section post-section">
    <article class="post-banner-card">
      <span class="post-banner-tag">${sec.title}</span>
      <h3 class="post-banner-title">${sec.subtitle}</h3>
      <div class="post-banner-author">
        <span class="post-author-icon">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7.5" stroke="#E2E2E2" fill="#F9F9F9"/>
            <path d="M5 6V11M8 7V11M11 5.5V11" stroke="#888" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
        </span>
        <span class="post-author-name">${sec.author || 'millie ORIGINAL'}</span>
      </div>
    </article>
  </section>`
}

/* 이럴 땐 이런 책 - QnA 컬러 카드 섹션 */
function qnaSection (sec) {
  return `<section class="section carousel-wrap qna-section" data-carousel id="qna-section">
    ${heading(sec.title, sec.subtitle, true)}
    <div class="scroll-viewport">
      <div class="qna-track" data-track>
        ${sec.cards
          .map(
            c => `
          <article class="qna-card" style="background-color: ${c.bgColor || '#6c5ce7'};">
            <div class="qna-card-top">
              <div class="qna-tag-row">
                ${c.tagBadge ? `<span class="qna-tag-badge">${c.tagBadge}</span>` : ''}
                <span class="qna-tag-text">${c.tagText || c.tag || ''}</span>
              </div>
              <p class="qna-question">${c.question}</p>
            </div>
            ${
              c.answer
                ? `
            <div class="qna-answer-box">
              <div class="qna-answer-left">
                <div class="qna-user-row">
                  <span class="qna-user-avatar"></span>
                  <span class="qna-user-name">${c.answer.user}</span>
                </div>
                <p class="qna-answer-text">${c.answer.text}</p>
              </div>
              ${
                c.answer.cover
                  ? `<div class="qna-cover-wrap">
                      <img class="qna-book-cover" src="${asset(c.answer.cover)}" alt="도서 표지" onerror="this.style.display='none'">
                    </div>`
                  : ''
              }
            </div>`
                : ''
            }
          </article>
        `
          )
          .join('')}
      </div>
    </div>
  </section>`
}

/* AI와 함께 읽는 나를 일으킬 책들 - 글로우 AI 북 카드 섹션 */
function aiBooksSection (sec) {
  return `<section class="section carousel-wrap ai-books-section" data-carousel id="ai-books-section">
    ${heading(sec.title, sec.subtitle, true)}
    <div class="scroll-viewport">
      <div class="ai-books-track" data-track>
        ${sec.cards
          .map(
            c => `
          <article class="ai-book-card" style="background: ${c.bgGradient || '#18153b'};">
            <div class="ai-book-top">
              <span class="ai-question-badge">${c.tag || '✦ 이 책의 질문'}</span>
              <h3 class="ai-question-title">${(c.question || '').replace(/\n/g, '<br>')}</h3>
            </div>
            <div class="ai-book-cover-wrap">
              <img class="ai-book-cover" src="${asset(c.cover)}" alt="${c.title}">
            </div>
            <button class="ai-read-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
              </svg>
              <span>AI와 함께 읽기</span>
            </button>
          </article>
        `
          )
          .join('')}
      </div>
    </div>
  </section>`
}

function panelSection (sec) {
  if (sec.type === 'qna-cards' || sec.id === 'review') {
    return qnaSection(sec)
  }
  if (sec.type === 'ai-books' || sec.id === 'promotion') {
    return aiBooksSection(sec)
  }
  if (sec.id === 'news') {
    return newsSection(sec)
  }
  if (sec.id === 'post' || (sec.title && sec.title.includes('새로운 포스트'))) {
    return postSection(sec)
  }
  return `<section class="section ${sec.wide ? 'wide-panels' : ''}">${heading(
    sec.title
  )}<div class="panel-track">${(sec.cards || [])
    .map(
      c =>
        `<article class="panel-card" data-book-title="${c.bookTitle || c.title}" data-book-author="${c.bookAuthor || ''}" data-book-cover="${c.bookCover || asset(c.image)}"><img src="${asset(
          c.image
        )}" alt="${c.title}"><div class="panel-card-body"><h3 class="panel-card-title">${
          c.title
        }</h3><p class="panel-card-desc">${c.desc}</p></div></article>`
    )
    .join('')}</div></section>`
}

export function renderContent (root, data) {
  const sections = data.bookSections || []
  const rankingSec = sections.find(s => s.id === 'ranking')
  const otherSecs = sections.filter(s => s.id !== 'ranking')

  root.innerHTML = [
    featured(data.featured),
    curation(data.curation),
    rankingSec ? rankingSection(rankingSec) : '',
    otherSecs[0] ? bookSection(otherSecs[0]) : '',
    otherSecs[1] ? bookSection(otherSecs[1]) : '',
    otherSecs[2] ? bookSection(otherSecs[2]) : '',
    panelSection(data.panels[0]),
    ...otherSecs.slice(3).map(bookSection),
    panelSection(data.panels[1]),
    data.panels[2] ? panelSection(data.panels[2]) : '',
    data.panels[3] ? panelSection(data.panels[3]) : '',
    data.panels[4] ? panelSection(data.panels[4]) : '',
    `<section class="section notice-section">
      <div class="notice-bar">
        <div class="notice-left">
          <svg class="notice-speaker" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
          <span class="notice-text">${data.notice}</span>
        </div>
      </div>
    </section>`
  ].filter(Boolean).join('')
}
