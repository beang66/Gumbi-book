/**
 * HTML 컴포넌트 비동기 로더 (loader.js)
 * 외부 HTML 컴포넌트를 동적으로 로드하고 DOM에 마운트합니다.
 */

/**
 * 컴포넌트 내 상대 경로 src/href를 올바른 절대 URL로 정규화합니다.
 */
function absolutizeResources(root, componentUrl){
  const rootUrl = new URL('../', componentUrl);
  
  root.querySelectorAll('[src]').forEach(el => {
    const src = el.getAttribute('src');
    if (src && !/^(https?:|data:|blob:)/.test(src)) el.src = new URL(src, componentUrl).href;
  });
  
  root.querySelectorAll('[href]').forEach(el => {
    const href = el.getAttribute('href');
    if (href && !/^(https?:|mailto:|tel:|#)/.test(href)) {
      // HTML 페이지 이동 링크(index.html, detail.html)는 프로젝트 루트 기준 해석
      if (href.includes('detail.html') || href.includes('index.html')) {
        const cleanHref = href.replace(/^(\.\/|\.\.\/)+/, '');
        el.href = new URL(cleanHref, rootUrl).href;
      } else {
        el.href = new URL(href, componentUrl).href;
      }
    }
  });
}

/**
 * 단일 HTML 컴포넌트를 fetch하여 루트 요소를 반환합니다.
 */
export async function loadComponent(name){
  const url = new URL(`../components/${name}.html`, import.meta.url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${name}.html 로드 실패 (${res.status})`);
  const text = await res.text();
  const doc = new DOMParser().parseFromString(text, 'text/html');
  const source = doc.querySelector('[data-component-root]');
  if (!source) throw new Error(`${name}.html에 data-component-root가 없습니다.`);
  const node = source.cloneNode(true);
  absolutizeResources(node, url);
  return node;
}

/**
 * 여러 컴포넌트를 순차적으로 타겟 컨테이너에 마운트합니다.
 */
export async function mountPage(target, names){
  for (const name of names) target.append(await loadComponent(name));
}
