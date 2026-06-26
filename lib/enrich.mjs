#!/usr/bin/env node

const SEARCH_PROVIDERS = ['tavily', 'serpapi'];

function getConfig() {
  return {
    provider: (process.env.PRD_WEB_SEARCH_TYPE || 'tavily').toLowerCase(),
    apiKey: process.env.PRD_WEB_SEARCH_KEY || '',
    maxResults: parseInt(process.env.PRD_ENRICH_MAX_RESULTS || '5', 10)
  };
}

async function searchTavily(query, apiKey, maxResults) {
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: 'advanced',
      include_answer: true,
      max_results: maxResults
    })
  });
  if (!res.ok) throw new Error(`Tavily error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return {
    answer: data.answer || '',
    results: (data.results || []).map(function(r) {
      return { title: r.title, url: r.url, content: r.content };
    })
  };
}

async function searchSerpapi(query, apiKey, maxResults) {
  const params = new URLSearchParams({
    q: query,
    api_key: apiKey,
    num: Math.min(maxResults, 10),
    engine: 'google'
  });
  const res = await fetch('https://serpapi.com/search?' + params.toString());
  if (!res.ok) throw new Error(`SerpAPI error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return {
    answer: data.answer_box?.snippet || data.knowledge_graph?.description || '',
    results: (data.organic_results || []).map(function(r) {
      return { title: r.title, url: r.link, content: r.snippet };
    })
  };
}

async function search(query) {
  const cfg = getConfig();
  if (!cfg.apiKey) return null;
  switch (cfg.provider) {
    case 'serpapi': return searchSerpapi(query, cfg.apiKey, cfg.maxResults);
    default: return searchTavily(query, cfg.apiKey, cfg.maxResults);
  }
}

function extractKeywords(prd) {
  const words = prd.split(/\s+/).filter(function(w) { return w.length > 3; });
  const freq = {};
  words.forEach(function(w) {
    var lower = w.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (lower.length > 3 && !['this','that','with','from','have','been','their','what','when','which','about','into','than','then','also','just','more','some','them','would','could','should','your','like','make','very','were','being','over','such','only','even','much','still','until','after','other','there','these','those','because'].includes(lower)) {
      freq[lower] = (freq[lower] || 0) + 1;
    }
  });
  return Object.entries(freq)
    .sort(function(a, b) { return b[1] - a[1]; })
    .slice(0, 8)
    .map(function(e) { return e[0]; });
}

export async function enrichPRD(prd, industry, geography) {
  var statusMsg = '';
  if (!process.env.PRD_WEB_SEARCH_KEY) {
    return { enriched: prd, status: 'skipped (no PRD_WEB_SEARCH_KEY set)' };
  }

  var keywords = extractKeywords(prd);
  var productName = keywords.slice(0, 2).join(' ');

  var queries = [];
  if (industry && industry !== 'General') {
    queries.push(productName + ' ' + industry + ' market size 2025 2026');
    queries.push(productName + ' ' + industry + ' competitors landscape');
  } else {
    queries.push(productName + ' product category market size');
    queries.push(productName + ' competitors alternatives');
  }
  if (geography && geography !== 'Global') {
    queries.push(productName + ' ' + geography + ' market trends regulation');
  }

  var contexts = [];
  for (var i = 0; i < queries.length; i++) {
    try {
      var result = await search(queries[i]);
      if (result && (result.answer || result.results.length > 0)) {
        var ctx = '--- Search: "' + queries[i] + '" ---\n';
        if (result.answer) ctx += 'Summary: ' + result.answer + '\n';
        result.results.forEach(function(r) {
          ctx += '- ' + r.title + ': ' + r.content.slice(0, 300) + '\n';
        });
        contexts.push(ctx);
      }
    } catch (e) {
      // ignore per-query failures
    }
  }

  if (contexts.length === 0) {
    return { enriched: prd, status: 'completed (no results found)' };
  }

  var enriched = '--- ENRICHED MARKET INTELLIGENCE ---\n' +
    '(Web-fetched data to supplement the PRD. Flags with "(enriched)" are from live search.)\n\n' +
    contexts.join('\n') +
    '\n--- END ENRICHED DATA ---\n\n' +
    '--- ORIGINAL PRD ---\n' + prd;

  return { enriched, status: 'completed (' + contexts.length + ' queries enriched)' };
}
