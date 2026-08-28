/**
 * 카카오 도서 검색 REST API 클라이언트 모듈 (api.js)
 * 실시간 도서 검색, 고화질 표지 디코딩 및 데이터 정규화를 담당합니다.
 */
const CONTENT_URL = new URL('../data/content.json', import.meta.url)
const BOOK_API_URL = 'https://dapi.kakao.com/v3/search/book'

// 카카오 개발자 REST API 인증 키
const BOOK_API_KEY = 'afe875f89c64d4bfd897c7571dd9bfac'

/**
 * 레이아웃 설정 JSON을 비동기로 로드합니다.
 */
export async function getContent () {
  const response = await fetch(CONTENT_URL)
  if (!response.ok)
    throw new Error(`화면 설정을 불러오지 못했습니다. (${response.status})`)
  return response.json()
}

function getHighResolutionCover (raw = {}) {
  const thumbnail = raw.thumbnail || ''
  if (typeof thumbnail !== 'string' || !thumbnail) return ''

  // Kakao CDN 썸네일 URL에서 원본 URL(fname)을 추출하고 디코딩합니다.
  const match = thumbnail.match(/[?&]fname=([^&]+)/)
  if (match) {
    try {
      return decodeURIComponent(match[1])
    } catch (e) {
      console.warn('Failed to decode high resolution cover URL:', e)
      return thumbnail
    }
  }
  return thumbnail
}

export function normalizeBook (raw = {}, index = 0) {
  const fallbackNumber = (index % 36) + 1
  const fallbackExt = WEBP_COVERS.has(fallbackNumber) ? 'webp' : 'jpg'
  const fallbackCover = `./assets/books/book-cover-${String(fallbackNumber).padStart(2, '0')}.${fallbackExt}`
  const coverUrl = getHighResolutionCover(raw) || raw.cover || raw.thumbnail || ''

  return {
    id: raw.isbn || raw.url || raw.title || `book-${index}`,
    title: raw.title || '제목 정보 없음',

    author: Array.isArray(raw.authors) && raw.authors.length
      ? raw.authors.join(', ')
      : raw.author || '저자 정보 없음',

    publisher: raw.publisher || '출판사 정보 없음',

    // 화면에 우선 표시할 표지 (없을 경우 로컬 에셋으로 안전하게 대체)
    cover: coverUrl || fallbackCover,

    // 카카오 표지
    thumbnail: raw.thumbnail || fallbackCover,

    description: raw.contents || raw.description || '',
    url: raw.url || '',
    badge: raw.badge || ''
  }
}

function hasApiKey () {
  return BOOK_API_KEY && BOOK_API_KEY !== 'YOUR_KAKAO_REST_API_KEY'
}

export async function searchBooks (
  query,
  { size = 10, page = 1, sort = 'accuracy' } = {}
) {
  if (!hasApiKey())
    throw new Error('js/api.js에 카카오 REST API 키를 입력해 주세요.')
  
  // 표지가 없는 도서가 필터링될 수 있으므로 여유 있게 요청합니다.
  const requestSize = Math.min(Math.max(size * 2, 20), 50)
  const params = new URLSearchParams({
    query,
    size: String(requestSize),
    page: String(page),
    sort
  })
  const response = await fetch(`${BOOK_API_URL}?${params}`, {
    headers: { Authorization: `KakaoAK ${BOOK_API_KEY}` }
  })
  if (!response.ok)
    throw new Error(`카카오 도서 API 요청 실패 (${response.status})`)
  const json = await response.json()
  
  // 표지 이미지가 존재하는 유효한 도서를 우선 선별합니다.
  const validDocs = (json.documents || []).filter(
    d => d.thumbnail && typeof d.thumbnail === 'string' && d.thumbnail.trim() !== ''
  )
  const finalDocs = validDocs.length >= size 
    ? validDocs.slice(0, size) 
    : (json.documents || []).slice(0, size)

  return finalDocs.map((doc, idx) => normalizeBook(doc, idx))
}

const WEBP_COVERS = new Set([
  1, 2, 5, 6, 7, 8, 9, 10, 13, 15, 16, 18, 23, 24, 25, 26, 27, 28, 29, 30, 31,
  32, 35
])
function placeholderBook (index) {
  const number = (index % 36) + 1
  const extension = WEBP_COVERS.has(number) ? 'webp' : 'jpg'
  return {
    id: `placeholder-${number}`,
    title: `추천 도서 ${String(number).padStart(2, '0')}`,
    author: '도서 정보를 불러오지 못했습니다',
    publisher: '',
    cover: `./assets/books/book-cover-${String(number).padStart(
      2,
      '0'
    )}.${extension}`,
    description: 'API 키를 입력하거나 네트워크 상태를 확인해 주세요.',
    url: '',
    badge: ''
  }
}

let fallbackOffset = 0
async function fetchGroup (query, count, sort) {
  try {
    const books = await searchBooks(query, { size: count, sort })
    if (books.length) return books
    throw new Error('검색 결과가 없습니다.')
  } catch (error) {
    console.warn(`[도서 API fallback] ${query}:`, error.message)
    const books = Array.from({ length: count }, (_, index) =>
      placeholderBook(fallbackOffset + index)
    )
    fallbackOffset = (fallbackOffset + count) % 36
    return books
  }
}

export async function fetchBooks (layout) {
  fallbackOffset = 0
  const requests = [
    fetchGroup(layout.featured.query, 1),
    ...layout.curation.cards.map(card =>
      (card.books && card.books.length > 0)
        ? Promise.resolve(card.books)
        : fetchGroup(card.query, card.count || 2)
    ),
    ...layout.bookSections.map(section =>
      (section.cards && section.cards.length > 0)
        ? Promise.resolve(section.cards)
        : (section.books && section.books.length > 0)
        ? Promise.resolve(section.books)
        : fetchGroup(section.query, section.count || 8, section.sort)
    )
  ]
  const [featuredBooks, ...groups] = await Promise.all(requests)
  const curationGroups = groups.slice(0, layout.curation.cards.length)
  const sectionGroups = groups.slice(layout.curation.cards.length)
  return {
    ...layout,
    featured: {
      ...layout.featured,
      book: featuredBooks[0] || placeholderBook(0)
    },
    curation: {
      ...layout.curation,
      cards: layout.curation.cards.map((card, index) => ({
        ...card,
        books: (card.books && card.books.length > 0) ? card.books : curationGroups[index]
      }))
    },
    bookSections: layout.bookSections.map((section, index) => ({
      ...section,
      cards: section.cards || undefined,
      highlightBook: section.highlightBook || undefined,
      books: (section.books && section.books.length > 0)
        ? section.books
        : (section.cards ? undefined : sectionGroups[index])
    }))
  }
}
