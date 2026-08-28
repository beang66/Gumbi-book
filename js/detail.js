/**
 * 도서 상세 서브페이지 전용 렌더링 모듈 (detail.js)
 * 카카오 검색 OpenAPI를 통한 실시간 도서 정보 추출 및 시각화(차트, 매트릭스, 오디오 플레이어)를 수행합니다.
 */
const KAKAO_API_KEY = 'afe875f89c64d4bfd897c7571dd9bfac';
const KAKAO_API_URL = 'https://dapi.kakao.com/v3/search/book';

// 기본 디폴트 도서 메타데이터
const DEFAULT_BOOK = {
  title: '작은 일기',
  author: '황정은',
  publisher: '창비',
  pubDate: '2025.07.11',
  paperDate: '2025.07.12',
  category: '에세이',
  type: '오디오북 / 전자책',
  fileSize: '184.0 MB',
  isbn: '9788936480851',
  rating: '4.5',
  finishRate: '33%',
  duration: '03:25:00:18',
  shelfCount: '8,922',
  cover: 'https://search1.kakaocdn.net/thumb/R300x0.q85/?fname=http%3A%2F%2Ft1.daumcdn.net%2Flbook%2Fimage%2F6960350%3Ftimestamp%3D20251018142039',
  quote: '따뜻한 밤처럼 위로가 되는 황정은의 기록들',
  desc: `정제된 문장과 깊은 감각으로 우리 시대를 응시해온 소설가, 지금 한국에서 가장 신뢰받는 문장을 쓰는 황정은이 에세이 『작은 일기』로 돌아왔다. 『百의 그림자』 『디디의 우산』 『연년세세』 등으로 깊은 사랑을 받아온 그는 문장을 아껴 쓰는 작가로 유명하다. 이 때문에 좀처럼 에세이를 쓰지 않지만, 모두가 말을 잃고 마음이 흔들리는 시기에는 누구보다 먼저 진솔하고도 단단한 목소리로 우리 곁에 다가왔다. 전작 『일기日記』(창비 2021) 이후 4년 만에 선보이는 이번 신작은 저자가 일상의 순간순간 마주한 삶과 문학, 사람들에 관한 깊은 성찰을 담고 있다.`,
  toc: [
    '1부 | 밤의 산책자',
    '2부 | 이름 없는 날들의 기록',
    '3부 | 빛과 그늘 사이에서',
    '4부 | 조용한 안부'
  ],
  authorBio: `2008년 경향신문 신춘문예에 단편소설 「마더」가 당선되어 작품활동을 시작했다. 저서로 소설집 『일곱시 삼십이분 코끼리열차』, 『파씨의 입문』, 『아무도 아닌』, 장편소설 『百의 그림자』, 『야만적인 앨리스씨』, 『계속해보겠습니다』, 『디디의 우산』, 연작소설집 『연년세세』, 짧은소설 『모자』, 장편소설 『달의 바다』, 산문집 『일기』 『작은 일기』 등이 있다. 한국일보문학상, 신동엽문학상, 김유정문학상, 이효석문학상, 대산문학상 등을 수상했다.`,
  series: [
    { title: '작은 일기', author: '황정은', cover: 'https://search1.kakaocdn.net/thumb/R300x0.q85/?fname=http%3A%2F%2Ft1.daumcdn.net%2Flbook%2Fimage%2F6960350%3Ftimestamp%3D20251018142039' },
    { title: '연년세세', author: '황정은', cover: 'https://search1.kakaocdn.net/thumb/R300x0.q85/?fname=http%3A%2F%2Ft1.daumcdn.net%2Flbook%2Fimage%2F5441586%3Ftimestamp%3D20260408151443' },
    { title: '디디의 우산', author: '황정은', cover: 'https://search1.kakaocdn.net/thumb/R300x0.q85/?fname=http%3A%2F%2Ft1.daumcdn.net%2Flbook%2Fimage%2F5025983%3Ftimestamp%3D20260408151443' }
  ]
};

// URL 쿼리 파라미터 파싱
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    title: params.get('title') || '',
    author: params.get('author') || '',
    cover: params.get('cover') || '',
    isbn: params.get('isbn') || ''
  };
}

// 카카오 도서 API 상세 검색
async function searchBookDetails(title, author) {
  if (!title) return null;
  const cleanTitle = title.replace(/\(.*\)/g, '').replace(/\[.*\]/g, '').trim();
  const query = `${cleanTitle} ${author || ''}`.trim();
  
  try {
    const res = await fetch(`${KAKAO_API_URL}?query=${encodeURIComponent(query)}&size=1`, {
      headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` }
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.documents && json.documents.length > 0) {
      return json.documents[0];
    }
  } catch (err) {
    console.warn('카카오 API 검색 실패:', err);
  }
  return null;
}

// 상세 페이지 렌더링
async function initDetailPage() {
  const queryParams = getQueryParams();
  let book = { ...DEFAULT_BOOK };

  if (queryParams.title) {
    book.title = queryParams.title;
    book.author = queryParams.author || '검비 작가';
    if (queryParams.cover) book.cover = queryParams.cover;

    const apiDoc = await searchBookDetails(queryParams.title, queryParams.author);
    if (apiDoc) {
      book.title = apiDoc.title || book.title;
      book.author = (apiDoc.authors && apiDoc.authors.length > 0) ? apiDoc.authors.join(', ') : book.author;
      book.publisher = apiDoc.publisher || '검비의서재';
      book.pubDate = apiDoc.datetime ? apiDoc.datetime.substring(0, 10).replace(/-/g, '.') : book.pubDate;
      book.paperDate = book.pubDate;
      book.isbn = apiDoc.isbn ? apiDoc.isbn.split(' ').pop() : book.isbn;
      if (apiDoc.thumbnail) {
        book.cover = apiDoc.thumbnail.replace(/R\d+x\d+/, 'R500x0').replace(/^http:/, 'https:');
      }
      if (apiDoc.contents) {
        book.desc = apiDoc.contents + (apiDoc.contents.endsWith('...') ? '' : '...');
      }
    }
  }

  // 페이지 타이틀 변경
  document.title = `${book.title} | 검비의서재`;

  // HTML 주입
  const container = document.querySelector('#detail-root');
  if (!container) return;

  container.innerHTML = `
    <!-- 1. 상단 도서 히어로 영역 -->
    <div class="book-hero">
      <div class="hero-cover-col">
        <div class="hero-book-wrap">
          <img class="hero-book-img" src="${book.cover}" alt="${book.title}">
          <span class="hero-audio-badge">🎧</span>
        </div>
      </div>
      <div class="hero-info-col">
        <h1 class="hero-title">${book.title}</h1>
        <a href="#" class="hero-author">${book.author} ›</a>
        
        <div class="hero-meta-row">
          <span><strong class="rating-star">★ ${book.rating}</strong></span>
          <span class="meta-divider">|</span>
          <span>완독 <strong>${book.finishRate}</strong></span>
          <span class="meta-divider">|</span>
          <span>오디오북 <strong>${book.duration}</strong></span>
        </div>

        <p class="hero-stat-box">
          이 책이 담긴 서재 <strong>${book.shelfCount}개</strong>
        </p>

        <div class="hero-cta-group">
          <button type="button" class="btn-primary-read" id="btn-read">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            오디오북 듣기
          </button>
          <button type="button" class="btn-secondary-shelf" id="btn-shelf">
            <span>♡</span> 내 서재에 담기
          </button>
          <button type="button" class="btn-icon-action" aria-label="공유하기">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 2. 관련 시리즈 도서 -->
    <hr class="detail-divider">
    <div class="detail-section">
      <h3 class="detail-sec-title">총 3권</h3>
      <div class="series-row">
        ${book.series.map(s => `
          <div class="series-item">
            <img class="series-cover" src="${s.cover}" alt="${s.title}">
            <strong class="series-title">${s.title}</strong>
            <span class="series-author">${s.author}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- 3. 오디오북 정보 -->
    <hr class="detail-divider">
    <div class="detail-section">
      <h3 class="detail-sec-title">오디오북 정보</h3>
      <div class="audio-info-card">
        <div class="audio-reader-info">
          <div class="reader-avatar">🎙️</div>
          <div>
            <h4 class="reader-name">${book.author}</h4>
            <p class="reader-duration">낭독자 직독 | 완독형 ${book.duration}</p>
          </div>
        </div>
      </div>

      <!-- 1분 미리 듣기 플레이어 바 -->
      <div class="preview-player">
        <button class="play-btn" id="preview-play-btn" aria-label="재생">▶</button>
        <div class="preview-track-info">
          <p class="preview-track-title">1분 미리 듣기</p>
          <span class="preview-track-author">${book.title} - ${book.author}</span>
        </div>
        <div class="preview-progress-bar">
          <div class="preview-progress-fill"></div>
        </div>
      </div>
    </div>

    <!-- 4. 성별 · 연령별 인기 분포 -->
    <hr class="detail-divider">
    <div class="detail-section">
      <h3 class="detail-sec-title">성별 · 연령별 인기 분포</h3>
      <div class="demographics-box">
        <div class="demo-chart">
          <div class="demo-bar-row">
            <span class="demo-bar-label">10대</span>
            <div class="demo-bar-track"><div class="demo-bar-female" style="width: 15%;"></div></div>
          </div>
          <div class="demo-bar-row">
            <span class="demo-bar-label">20대</span>
            <div class="demo-bar-track"><div class="demo-bar-female" style="width: 45%;"></div><div class="demo-bar-male" style="width: 15%;"></div></div>
          </div>
          <div class="demo-bar-row">
            <span class="demo-bar-label">30대</span>
            <div class="demo-bar-track"><div class="demo-bar-female" style="width: 65%;"></div><div class="demo-bar-male" style="width: 20%;"></div></div>
          </div>
          <div class="demo-bar-row">
            <span class="demo-bar-label">40대</span>
            <div class="demo-bar-track"><div class="demo-bar-female" style="width: 80%;"></div><div class="demo-bar-male" style="width: 25%;"></div></div>
          </div>
          <div class="demo-bar-row">
            <span class="demo-bar-label">50대</span>
            <div class="demo-bar-track"><div class="demo-bar-female" style="width: 35%;"></div></div>
          </div>
        </div>
        <div class="demo-summary-box">
          <p>이 책을 서재에 가장 많이 담은 회원</p>
          <p><strong class="demo-highlight">1위 40대 여성</strong> &nbsp;|&nbsp; <strong>2위 30대 여성</strong></p>
          <p style="margin-top: 8px; font-size: 12px; color: #777;">
            <strong>오디오북 분야</strong>는 <span class="demo-highlight">30대 여성</span>이 가장 즐겨 보는데,<br>
            이 책은 <strong class="demo-highlight">40대 여성</strong>이 많이 보고 있어요.
          </p>
        </div>
      </div>
    </div>

    <!-- 5. 탭 네비게이션 -->
    <div class="detail-tabs">
      <button class="detail-tab-btn active">책 추천</button>
      <button class="detail-tab-btn">책 소개</button>
      <button class="detail-tab-btn">리뷰 41</button>
    </div>

    <!-- 6. 검비 완독지수 매트릭스 -->
    <div class="completion-matrix-box">
      <h3 class="detail-sec-title" style="margin-bottom: 12px;">검비 완독지수</h3>
      <div class="matrix-grid">
        <div class="matrix-cell">홀릭 (완독할 확률 높음)</div>
        <div class="matrix-cell">검비터 (대중적인 인기작)</div>
        <div class="matrix-cell">히든 (숨은 명작)</div>
        <div class="matrix-cell active-spot">✦ 마니아 (깊이 있는 독서)</div>
      </div>
      <p style="font-size: 13px; color: #555; line-height: 1.5;">
        <strong>마니아</strong> : 검비 회원들이 깊은 몰입감으로 아껴 읽는 도서입니다. 완독 소요 시간 약 <strong>3시간 25분</strong>
      </p>
    </div>

    <!-- 7. 책 소개 본문 -->
    <div class="detail-section">
      <h3 class="detail-sec-title">책 소개</h3>
      <div class="book-desc-content">
        <p class="book-desc-quote">“${book.quote}”</p>
        <p class="book-desc-text" id="desc-text">${book.desc}</p>
        <button type="button" class="btn-expand-more" id="btn-expand-desc">
          책 소개 더보기 ∨
        </button>
      </div>
    </div>

    <!-- 8. 목차 -->
    <hr class="detail-divider">
    <div class="detail-section">
      <h3 class="detail-sec-title">목차</h3>
      <div class="toc-list">
        ${book.toc.map(t => `<p>${t}</p>`).join('')}
      </div>
      <button type="button" class="btn-expand-more">
        목차 더보기 ∨
      </button>
    </div>

    <!-- 9. 저자 소개 -->
    <hr class="detail-divider">
    <div class="detail-section">
      <h3 class="detail-sec-title">저자 소개</h3>
      <p style="font-size: 14px; font-weight: 700; color: #222; margin-bottom: 8px;">${book.author}</p>
      <p style="font-size: 13.5px; color: #555; line-height: 1.6;">${book.authorBio}</p>
    </div>

    <!-- 10. 책 정보 테이블 (출판사, 출판일, ISBN 등) -->
    <hr class="detail-divider">
    <div class="detail-section">
      <h3 class="detail-sec-title">책 정보</h3>
      <table class="book-meta-table">
        <tbody>
          <tr>
            <th>카테고리</th>
            <td>${book.category}</td>
            <th>용량</th>
            <td>${book.fileSize}</td>
          </tr>
          <tr>
            <th>제공 방식</th>
            <td>${book.type}</td>
            <th>출판일</th>
            <td>${book.pubDate}</td>
          </tr>
          <tr>
            <th>출판사</th>
            <td>${book.publisher}</td>
            <th>ISBN</th>
            <td>${book.isbn}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 11. 한 줄 리뷰 -->
    <hr class="detail-divider">
    <div class="detail-section">
      <h3 class="detail-sec-title">한 줄 리뷰 41</h3>
      <div class="review-score-head">
        <span class="score-big">${book.rating}</span>
        <div class="stars-row">★★★★★</div>
      </div>
      <div class="review-input-box">
        <p style="font-size: 13px; color: #777; margin-bottom: 8px;">이 책은 어떠셨나요? 별점을 남겨주세요</p>
        <div class="stars-row" style="cursor: pointer;">☆☆☆☆☆</div>
      </div>

      <div class="review-cards-list">
        <div class="review-item-card">
          <div class="review-user-row">
            <span>👤</span>
            <span>행복한라벤더</span>
            <span style="color: #f59e0b; margin-left: 4px;">★★★★★</span>
          </div>
          <p class="review-comment">작가님의 차분하고 따뜻한 목소리가 마음에 큰 위로가 되었습니다.</p>
        </div>
        <div class="review-item-card">
          <div class="review-user-row">
            <span>👤</span>
            <span>달빛독서가</span>
            <span style="color: #f59e0b; margin-left: 4px;">★★★★★</span>
          </div>
          <p class="review-comment">좋은 문장들이 많아서 듣는 내내 마음이 차분해집니다. 추천해요!</p>
        </div>
      </div>
    </div>

    <!-- 12. 하단 고정 플로팅 액션 바 -->
    <div class="bottom-floating-bar">
      <div class="floating-bar-inner">
        <div>
          <strong style="font-size: 15px; color: #111;">${book.title}</strong>
          <span style="font-size: 13px; color: #888; margin-left: 6px;">${book.author}</span>
        </div>
        <div style="display: flex; gap: 10px;">
          <button type="button" class="btn-secondary-shelf" id="floating-shelf-btn">
            ♡ 내 서재에 담기
          </button>
          <button type="button" class="btn-primary-read" id="floating-read-btn">
            오디오북 듣기
          </button>
        </div>
      </div>
    </div>
  `;

  // 인터랙션 바인딩
  bindInteractions();
}

function bindInteractions() {
  // 1분 미리듣기 재생 버튼 토글
  const playBtn = document.querySelector('#preview-play-btn');
  let isPlaying = false;
  playBtn?.addEventListener('click', () => {
    isPlaying = !isPlaying;
    playBtn.textContent = isPlaying ? '⏸' : '▶';
    playBtn.style.backgroundColor = isPlaying ? '#2563eb' : '#242424';
  });

  // 서재 담기 버튼 토글
  const shelfBtns = [document.querySelector('#btn-shelf'), document.querySelector('#floating-shelf-btn')];
  let isShelfed = false;
  shelfBtns.forEach(btn => {
    btn?.addEventListener('click', () => {
      isShelfed = !isShelfed;
      shelfBtns.forEach(b => {
        if (!b) return;
        b.innerHTML = isShelfed ? '♥ 담김 완료' : '♡ 내 서재에 담기';
        b.style.color = isShelfed ? '#dc2626' : '#333333';
      });
      alert(isShelfed ? '내 서재에 도서가 추가되었습니다!' : '내 서재에서 도서가 제거되었습니다.');
    });
  });

  // 책 소개 더보기 토글
  const expandBtn = document.querySelector('#btn-expand-desc');
  const descText = document.querySelector('#desc-text');
  let isExpanded = false;
  expandBtn?.addEventListener('click', () => {
    isExpanded = !isExpanded;
    descText.style.display = isExpanded ? 'block' : '-webkit-box';
    expandBtn.textContent = isExpanded ? '책 소개 접기 ∧' : '책 소개 더보기 ∨';
  });

  // 탭 클릭
  document.querySelectorAll('.detail-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.detail-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// 초기화 실행
window.addEventListener('DOMContentLoaded', initDetailPage);
