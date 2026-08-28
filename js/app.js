/**
 * 메인 애플리케이션 진입점 (app.js)
 * 컴포넌트 마운트, 도서 데이터 비동기 패치 및 전역 인터랙션을 초기화합니다.
 */
import {mountPage} from './loader.js';
import {getContent,fetchBooks} from './api.js';
import {renderContent} from './render.js';
import {initCarousels,initTabs,initHeroSlider,initNewsSlider,initBookLinks,initGoTop} from './interactions.js';

async function boot(){
  const preview = document.body.dataset.preview;
  const layout = await getContent();
  const data = await fetchBooks(layout);

  // 단독 컴포넌트 프리뷰 또는 전체 SPA 페이지 마운트
  if (preview === 'content') {
    renderContent(document.querySelector('#content-root'), data);
  } else if (!preview) {
    const app = document.querySelector('#app');
    await mountPage(app, ['header', 'hero', 'category-menu', 'content', 'footer']);
    renderContent(document.querySelector('#content-root'), data);
  }

  // 인터랙션 이벤트 핸들러 바인딩
  initHeroSlider(document);
  initCarousels(document);
  initTabs(document);
  initNewsSlider(document);
  initBookLinks(document);
  initGoTop();
}

boot().catch(err => {
  console.error('[App Init Error]', err);
  const box = document.createElement('pre');
  box.className = 'error-box';
  box.textContent = '페이지 실행 오류\n' + err.stack;
  document.body.prepend(box);
});
