export function buildXiaohongshuSearchUrl(keyword: string) {
  return `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(keyword)}`;
}

export function buildDouyinSearchUrl(keyword: string) {
  return `https://www.douyin.com/search/${encodeURIComponent(keyword)}`;
}
