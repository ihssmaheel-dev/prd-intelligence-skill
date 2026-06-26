#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ===== COLOURED OUTPUT HELPERS =====
var RED = '\x1b[31m', GREEN = '\x1b[32m', YELLOW = '\x1b[33m', BLUE = '\x1b[34m', CYAN = '\x1b[36m', BOLD = '\x1b[1m', RESET = '\x1b[0m';
function log() { console.log.apply(console, arguments); }
function info(m) { log(BLUE + 'i' + RESET + ' ' + m); }
function ok(m) { log(GREEN + '\u2713' + RESET + ' ' + m); }
function warn(m) { log(YELLOW + '!' + RESET + ' ' + m); }
function err(m) { log(RED + '\u2717' + RESET + ' ' + m); }
function step(m) { log(BOLD + '\n--- ' + m + ' ---' + RESET); }

// ===== CONFIG LOADER =====
function loadEnv() {
  var envPath = join(__dirname, '.env');
  if (existsSync(envPath)) {
    var lines = readFileSync(envPath, 'utf8').split('\n');
    lines.forEach(function(l) {
      l = l.trim();
      if (!l || l.startsWith('#')) return;
      var eq = l.indexOf('=');
      if (eq === -1) return;
      var k = l.slice(0, eq).trim();
      var v = l.slice(eq + 1).trim();
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
      if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1);
      if (!process.env[k]) process.env[k] = v;
    });
  }
}

// ===== CLI ARGS =====
function parseArgs() {
  var args = process.argv.slice(2);
  var result = {
    prd: '',
    industry: 'General',
    geography: 'Global',
    enrich: false,
    out: null
  };
  for (var i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--file':
        var path = args[++i];
        if (!path) { err('Missing path after --file'); process.exit(1); }
        try { result.prd = readFileSync(path, 'utf8'); } catch (e) { err('Cannot read file: ' + path); process.exit(1); }
        break;
      case '--url':
        err('--url requires fetch. Use --file to download first, or pipe content directly.'); process.exit(1);
      case '--industry':
        result.industry = args[++i] || 'General';
        break;
      case '--geography':
        result.geography = args[++i] || 'Global';
        break;
      case '--enrich':
        result.enrich = true;
        break;
      case '--out':
        result.out = args[++i];
        break;
      default:
        if (!args[i].startsWith('--')) {
          result.prd = (result.prd ? result.prd + '\n' : '') + args[i];
        }
        break;
    }
  }
  if (!result.prd) {
    log('Usage: node run_prd.mjs <PRD content> [--industry X] [--geography Y] [--enrich] [--out path]');
    log('       node run_prd.mjs --file path/to/prd.md [--industry X] [--geography Y] [--enrich]');
    log('');
    log('Environment variables:');
    log('  PRD_LLM_PROVIDER    openai | anthropic | gemini | custom (default: openai)');
    log('  PRD_LLM_API_KEY     API key for the LLM provider');
    log('  PRD_LLM_MODEL       Model name (provider-specific default used if omitted)');
    log('  PRD_LLM_BASE_URL    Base URL for custom OpenAI-compatible endpoints');
    log('  PRD_WEB_SEARCH_KEY  API key for web enrichment (Tavily or SerpAPI)');
    log('  PRD_WEB_SEARCH_TYPE tavily | serpapi (default: tavily)');
    process.exit(1);
  }
  return result;
}

// ===== LLM PROVIDER ABSTRACTION =====
function getProvider() {
  var provider = (process.env.PRD_LLM_PROVIDER || 'openai').toLowerCase();
  var apiKey = process.env.PRD_LLM_API_KEY;
  if (!apiKey) throw new Error('PRD_LLM_API_KEY not set. Set it as env var or in .env file.');
  return { provider, apiKey };
}

function defaultModel(provider) {
  switch (provider) {
    case 'anthropic': return 'claude-sonnet-4-20250514';
    case 'gemini': return 'gemini-2.5-flash';
    case 'custom': return process.env.PRD_LLM_MODEL || 'gpt-4o';
    default: return 'gpt-4o';
  }
}

async function callLLM(fullPrompt) {
  var cfg = getProvider();
  var model = process.env.PRD_LLM_MODEL || defaultModel(cfg.provider);

  switch (cfg.provider) {
    case 'anthropic': return callAnthropic(fullPrompt, model, cfg.apiKey);
    case 'gemini': return callGemini(fullPrompt, model, cfg.apiKey);
    case 'custom': return callOpenAI(fullPrompt, model, cfg.apiKey, process.env.PRD_LLM_BASE_URL);
    default: return callOpenAI(fullPrompt, model, cfg.apiKey);
  }
}

async function callOpenAI(prompt, model, apiKey, baseUrl) {
  var url = (baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '') + '/chat/completions';
  var res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 4096
    })
  });
  if (!res.ok) throw new Error('OpenAI error ' + res.status + ': ' + (await res.text()).slice(0, 200));
  var data = await res.json();
  return data.choices[0].message.content.trim();
}

async function callAnthropic(prompt, model, apiKey) {
  var res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 4096,
      temperature: 0.1,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  if (!res.ok) throw new Error('Anthropic error ' + res.status + ': ' + (await res.text()).slice(0, 200));
  var data = await res.json();
  return data.content[0].text.trim();
}

async function callGemini(prompt, model, apiKey) {
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + apiKey;
  var res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 4096 }
    })
  });
  if (!res.ok) throw new Error('Gemini error ' + res.status + ': ' + (await res.text()).slice(0, 200));
  var data = await res.json();
  return data.candidates[0].content.parts[0].text.trim();
}

// ===== PROMPTS.MD PARSER =====
function parsePrompts() {
  var md = readFileSync(join(__dirname, 'PROMPTS.md'), 'utf8');

  // Extract shared system prompt
  var sharedMatch = md.match(/## Shared System Prompt\s*\n\s*```\s*\n([\s\S]*?)```/);
  var sharedPrompt = sharedMatch ? sharedMatch[1].trim() : '';

  // Extract user prompt template (everything between "### User Prompt Template" and next ## heading)
  var userMatch = md.match(/### User Prompt Template[^#]*##/);
  var userTemplate = userMatch ? userMatch[0].replace(/### User Prompt Template[^]*?\n---\n/, '').trim() : '';

  // Extract all module sections
  var moduleRegex = /## Module (\d+): ([^\n]+)\n([\s\S]*?)(?=\n## |\n---|$)/g;
  var modules = [];
  var match;
  while ((match = moduleRegex.exec(md)) !== null) {
    var num = parseInt(match[1], 10);
    var name = match[2].trim();
    var body = match[3];

    // Extract lens (between "### System Prompt Lens" and next ### or end)
    var lensMatch = body.match(/### System Prompt Lens\s*\n\s*```\s*\n([\s\S]*?)```/);
    var lens = lensMatch ? lensMatch[1].trim() : '';

    // Extract JSON schema (between "### JSON Schema" and next ### or end)
    var schemaMatch = body.match(/### (?:Expected )?JSON Schema\s*\n\s*```(?:json)?\s*\n([\s\S]*?)```/);
    var schema = null;
    if (schemaMatch) {
      try { schema = JSON.parse(schemaMatch[1].trim()); } catch (e) { warn('Failed to parse schema for Module ' + num + ': ' + e.message); }
    }

    // Extract purpose
    var purposeMatch = body.match(/### Purpose\s*\n([\s\S]*?)(?=\n### |\n## |$)/);
    var purpose = purposeMatch ? purposeMatch[1].trim() : '';

    modules.push({ num, name, lens, schema, purpose, body });
  }

  return { sharedPrompt, userTemplate, modules };
}

// ===== JSON EXTRACTION (strip markdown fences, find first/last {}) =====
function extractJSON(text) {
  var cleaned = text.trim();

  // Remove markdown code fences
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '');
  cleaned = cleaned.replace(/\n?```\s*$/i, '');

  // Find first { and last }
  var start = cleaned.indexOf('{');
  var end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  cleaned = cleaned.slice(start, end + 1);

  try { return JSON.parse(cleaned); } catch (e) { return null; }
}

// ===== SCORE NORMALIZATION =====
function normalizeScore(moduleNum, execScore, data) {
  if (!data || data.overallScore == null) return data;
  var score = data.overallScore;
  var verdict = data.verdict || '';

  // Clamp score to verdict range
  var ranges = { 'Excellent': [92, 100], 'Strong': [78, 89], 'Promising': [58, 74], 'Risky': [35, 52], 'Weak': [0, 32] };
  var r = ranges[verdict];
  if (r) {
    if (score < r[0]) score = r[0];
    if (score > r[1]) score = r[1];
  }

  // Cross-module alignment with Executive Summary
  if (moduleNum > 1 && execScore != null) {
    var maxScore = 100;
    if (execScore <= 34) maxScore = 54;
    else if (execScore <= 54) maxScore = 75;
    else if (execScore <= 74) maxScore = 85;
    if (score > maxScore) score = maxScore;
  }

  data.overallScore = score;
  return data;
}

// ===== RETRY LOGIC =====
async function executeModule(module, sharedPrompt, executiveSummary, prdContent, industry, geography, jsonSchema) {
  var lens = module.lens || 'You are a VC analyst evaluating this product for ' + module.name + '.';

  function buildUserMsg(extra) {
    return (extra || '') + [
      'Analyse the PRD below and return a single JSON object matching the schema exactly.',
      '',
      'Deployment context:',
      'Industry: ' + industry + ' | Geography: ' + geography,
      '',
      'Executive summary context (use for internal consistency; scores must align):',
      executiveSummary,
      '',
      'PRD to analyse:',
      prdContent,
      '',
      'Required JSON schema:',
      JSON.stringify(jsonSchema)
    ].join('\n');
  }

  var lastError = '';
  for (var attempt = 1; attempt <= 3; attempt++) {
    try {
      var prompt;
      if (attempt === 1) {
        prompt = lens + '\n\n' + buildUserMsg();
      } else if (attempt === 2) {
        prompt = lens + '\n\nRepair the following invalid JSON to match the required schema exactly.\n\n' +
          'Failure reason: ' + lastError + '\n\n' +
          'Executive context:\n' + executiveSummary + '\n\n' +
          'Required schema:\n' + JSON.stringify(jsonSchema) + '\n\n' +
          'Repair rules:\n' +
          '- Return the raw JSON object only with no markdown, no fences, and no explanation\n' +
          '- Preserve all valid content from the broken output\n' +
          '- Fix missing keys, invalid enum values, malformed arrays, trailing commas\n' +
          '- If a required field has no valid content, generate a plausible value and append "(estimated)"\n' +
          '- Every array must have at least 3 items (unless schema says otherwise); pad if needed\n';
      } else {
        prompt = lens + '\n\nRETRY: Strict mode. Return ONLY the raw JSON object. Previous attempt failed for: ' + lastError + '\n\n' + buildUserMsg('RETRY: Strict mode. ');
      }

      var raw = await callLLM(prompt);
      var parsed = extractJSON(raw);
      if (!parsed) {
        lastError = 'Invalid JSON after extraction';
        warn('  Attempt ' + attempt + ' failed: ' + lastError);
        continue;
      }

      if (jsonSchema && attempt <= 2) {
        var missing = [];
        Object.keys(jsonSchema).forEach(function(k) {
          if (typeof jsonSchema[k] === 'object' && !Array.isArray(jsonSchema[k])) return;
          if (parsed[k] === undefined) missing.push(k);
        });
        if (missing.length > 0) {
          lastError = 'Missing keys: ' + missing.join(', ');
          warn('  Attempt ' + attempt + ' failed: ' + lastError);
          continue;
        }
      }

      return parsed;
    } catch (e) {
      lastError = e.message;
      warn('  Attempt ' + attempt + ' error: ' + lastError);
    }
  }

  err('  Module ' + module.num + ' (' + module.name + ') failed after 3 attempts');
  return null;
}

// ===== MAIN =====
async function main() {
  loadEnv();
  var args = parseArgs();

  var { industry, geography } = args;

  log(BOLD + '\n' + Array(52).join('\u2500') + RESET);
  log(BOLD + '  PRD INTELLIGENCE — AUTO EXECUTION ENGINE' + RESET);
  log(BOLD + Array(52).join('\u2500') + RESET);
  log('');
  info('Industry: ' + industry);
  info('Geography: ' + geography);
  info('Enrichment: ' + (args.enrich ? 'ON' : 'OFF'));
  info('Provider: ' + (process.env.PRD_LLM_PROVIDER || 'openai'));

  // --- Step 1: PRD Enrichment ---
  var prdContent = args.prd;
  if (args.enrich) {
    step('Web Enrichment');
    info('Searching for market data...');
    try {
      var { enrichPRD } = await import(join(__dirname, 'lib', 'enrich.mjs'));
      var enriched = await enrichPRD(prdContent, industry, geography);
      prdContent = enriched.enriched;
      ok('Enrichment: ' + enriched.status);
    } catch (e) {
      warn('Enrichment failed: ' + e.message + ' — proceeding without enrichment');
    }
  }

  // --- Step 2: Parse PROMPTS.md ---
  step('Loading Prompts');
  var { sharedPrompt, modules } = parsePrompts();
  ok('Loaded ' + modules.length + ' modules from PROMPTS.md');

  var moduleMap = {};
  modules.forEach(function(m) { moduleMap[m.num] = m; });

  // --- Step 3: Module 1 — Executive Summary ---
  step('Module 1: Executive Summary');
  info('Running executive summary...');
  var execData = await executeModule(
    { num: 1, name: 'Executive Summary', lens: moduleMap[1] ? moduleMap[1].lens : '' },
    sharedPrompt, '', prdContent, industry, geography,
    moduleMap[1] ? moduleMap[1].schema : null
  );

  if (!execData) {
    err('Executive Summary failed — cannot continue');
    process.exit(1);
  }

  normalizeScore(1, null, execData);
  ok('Score: ' + execData.overallScore + '/100 — Verdict: ' + execData.verdict);

  // --- Step 4: Stop Conditions ---
  step('Stop Conditions Check');

  var meaningfulWords = prdContent.replace(/[#*`_>\[\]|~-]/g, '').split(/\s+/).filter(function(w) { return w.length > 2; }).length;
  var hasProblemSignal = /problem|pain|challenge|issue|need|gap/i.test(prdContent);
  var hasProductSignal = /product|platform|app|tool|solution|feature/i.test(prdContent);

  var shouldStop = false;
  var stopReason = '';

  if (execData.insufficientContext && meaningfulWords < 80 && !(hasProblemSignal && hasProductSignal)) {
    shouldStop = true;
    stopReason = execData.insufficientReason || 'Insufficient context: PRD is too vague or lacks problem/product signals.';
    warn('STOP: Insufficient context');
  } else if (execData.verdict === 'Weak' && execData.overallScore < 45) {
    shouldStop = true;
    stopReason = execData.stopAnalysisReason || execData.buildDecision || 'The concept is too weak to justify deeper analysis.';
    warn('STOP: Weak viability (score ' + execData.overallScore + ')');
  } else {
    ok('Conditions clear — proceeding with full analysis');
  }

  // --- Step 5: Modules 2-25 ---
  var allData = { executive: execData };

  if (!shouldStop) {
    step('Running Modules 2-25');
    var execSummary = execData.title + ': ' + execData.tagline + '\n' + execData.summary + ' (Score: ' + execData.overallScore + ', Verdict: ' + execData.verdict + ')';

    var batchOrder = [
      [2, 3, 4],   // Founder, Market, Demand
      [5, 6, 7],   // Competitors, Personas, Features
      [8, 9, 10],  // SWOT, GTM, Monetisation
      [11, 12, 13],// Pricing, Risks, Moat
      [14, 15, 16],// Tech, OpenSource, Ops
      [17, 18, 19],// Hiring, Ecosystem, Economics
      [20, 21, 22],// Localization, Accessibility, Compliance
      [23, 24, 25] // ESG, Fundraising, Exit
    ];

    var moduleKeys = {
      2: 'founder', 3: 'market', 4: 'demand', 5: 'competitors', 6: 'personas',
      7: 'features', 8: 'swot', 9: 'gtm', 10: 'monetisation', 11: 'pricing',
      12: 'risks', 13: 'moat', 14: 'tech', 15: 'openSource', 16: 'ops',
      17: 'hiring', 18: 'ecosystem', 19: 'economics', 20: 'localization',
      21: 'accessibility', 22: 'compliance', 23: 'esg', 24: 'fundraising', 25: 'exit'
    };

    var moduleNames = {
      2: 'Founder-Market Fit', 3: 'Market Sizing', 4: 'Demand Signals',
      5: 'Competitive Landscape', 6: 'User Personas', 7: 'Feature-Market Fit',
      8: 'SWOT Analysis', 9: 'Go-to-Market', 10: 'Monetisation',
      11: 'Pricing Sensitivity', 12: 'Risk Register', 13: 'Competitive Moat',
      14: 'Tech Stack', 15: 'Open-Source Viability', 16: 'Operational Audit',
      17: 'Hiring Roadmap', 18: 'Ecosystem Strategy', 19: 'Unit Economics',
      20: 'Localization Fit', 21: 'Accessibility', 22: 'Compliance Risk',
      23: 'Sustainability / ESG', 24: 'Fundraising Readiness', 25: 'Strategic Exit'
    };

    var total = 0, succeeded = 0;
    for (var b = 0; b < batchOrder.length; b++) {
      var batch = batchOrder[b];
      step('Batch ' + (b + 1) + ': Modules ' + batch.join(', '));

      var promises = batch.map(function(num) {
        return (async function() {
          var module = moduleMap[num];
          if (!module) {
            warn('  Module ' + num + ' not found in PROMPTS.md — skipping');
            return;
          }
          info('  Running Module ' + num + ': ' + moduleNames[num] + '...');
          var data = await executeModule(module, sharedPrompt, execSummary, prdContent, industry, geography, module.schema);
          total++;
          if (data) {
            data = normalizeScore(num, execData.overallScore, data);
            allData[moduleKeys[num]] = data;
            succeeded++;
            ok('  Module ' + num + ' done (score: ' + data.overallScore + ')');
          } else {
            err('  Module ' + num + ' failed');
            allData[moduleKeys[num]] = {};
          }
        })();
      });

      await Promise.all(promises);
    }

    ok(succeeded + '/' + total + ' modules completed successfully');
  } else {
    // Partial report — fill missing modules with empty objects
    var allKeys = ['founder','market','demand','competitors','personas','features','swot','gtm','monetisation','pricing','risks','moat','tech','openSource','ops','hiring','ecosystem','economics','localization','accessibility','compliance','esg','fundraising','exit'];
    allKeys.forEach(function(k) { if (!allData[k]) allData[k] = {}; });
    allData._stopReason = stopReason;
    allData._partial = true;
  }

  // --- Step 6: Write data.json ---
  step('Generating Report');

  var now = new Date();
  var reportDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  allData.meta = {
    title: execData.title || 'PRD Analysis',
    tagline: execData.tagline || '',
    date: reportDate,
    industry: industry,
    geography: geography
  };

  // Save data.json to a temp location, then let gen_report.mjs handle output
  var dataJsonPath = join(__dirname, 'tmp_data.json');
  writeFileSync(dataJsonPath, JSON.stringify(allData, null, 2), 'utf8');
  ok('Data written to ' + dataJsonPath);

  // --- Step 7: Run gen_report.mjs ---
  var genArgs = ['--data', dataJsonPath];
  if (args.out) genArgs.push('--out', args.out);

  try {
    execSync('node "' + join(__dirname, 'gen_report.mjs') + '" ' + genArgs.join(' '), {
      stdio: 'inherit',
      timeout: 30000,
      cwd: __dirname
    });
  } catch (e) {
    err('gen_report.mjs failed: ' + e.message);
    info('data.json saved at ' + dataJsonPath + ' — you can run gen_report.mjs manually');
  }

  // Clean up temp file
  try {
    if (process.platform === 'win32') {
      execSync('if exist "' + dataJsonPath + '" del "' + dataJsonPath + '"', { timeout: 2000 });
    } else {
      execSync('rm -f "' + dataJsonPath + '"', { timeout: 2000 });
    }
  } catch (e) { /* ignore */ }
}

main().catch(function(e) {
  err('Fatal: ' + e.message);
  process.exit(1);
});
