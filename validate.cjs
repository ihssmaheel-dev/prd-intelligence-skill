// PRD Intelligence — Data Array Schema Validator
// Run: node validate.cjs <path-to-html>
// Checks all 29 JSON data arrays against their expected shapes

const fs = require('fs');

// ===== SCHEMAS =====
const schemas = {
  MODULE_DATA: { items: { key: 'string', label: 'string', icon: 'string', score: 'number|null' } },
  DEMAND_DATA: { items: { name: 'string', strength: 'number', description: 'string' } },
  COMPETITOR_DATA: { items: { name: 'string', threat: 'enum(High|Medium|Low)', marketFit: 'number', positioning: 'string', weakness: 'string' } },
  FEATURE_DATA: { items: { name: 'string', fitScore: 'number', priority: 'enum(Core|Nice-to-have|Future)' } },
  READINESS_DATA: { items: { dimension: 'string', score: 'number' } },
  MARKET_FUNNEL_DATA: { items: { value: 'string', desc: 'string' }, min: 3, max: 3 },
  DEMAND_SCORE_DATA: { items: { label: 'string', value: 'string', score: 'number|undefined' } },
  DEMAND_KEYWORD_DATA: { items: 'string' },
  SWOT_DATA: { items: { key: 'enum(strengths|weaknesses|opportunities|threats)', title: 'string', items: 'stringArray' } },
  PERSONA_DATA: { items: { name: 'string', role: 'string', painPoint: 'string', goal: 'string', tags: 'stringArray' } },
  GTM_DATA: { items: { phase: 'number', title: 'string', description: 'string', timeline: 'string', channel: 'string' } },
  GTM_METRIC_DATA: { items: { label: 'string', value: 'string' } },
  MONETISATION_DATA: { items: { name: 'string', fit: 'number', description: 'string' } },
  MONETISATION_METRIC_DATA: { items: { label: 'string', value: 'string' } },
  RISK_DATA: { items: { name: 'string', level: 'enum(High|Medium|Low)', description: 'string', mitigation: 'string' } },
  MOAT_DATA: { items: { type: 'string', description: 'string', strength: 'enum(Strong|Moderate|Weak)' } },
  TECH_STACK_DATA: { items: { layer: 'string', tech: 'string', reason: 'string' } },
  HIRING_DATA: { items: { title: 'string', priority: 'enum(Core|Nice-to-have|Future)', timeline: 'string' } },
  ECOSYSTEM_DATA: { items: { platform: 'string', value: 'string', priority: 'enum(Core|Nice-to-have|Future)' } },
  ECON_DATA: { items: { label: 'string', value: 'string', color: 'string|undefined' } },
  LOCAL_NUANCE_DATA: { items: 'string' },
  LOCAL_COMPETITOR_DATA: { items: 'string' },
  A11Y_GAP_DATA: { items: 'string' },
  A11Y_REC_DATA: { items: 'string' },
  COMPLIANCE_FLAG_DATA: { items: { name: 'string', severity: 'enum(High|Medium|Low)', description: 'string' } },
  COMPLIANCE_NEXT_DATA: { items: 'string' },
  EXIT_ACQUIRER_DATA: { items: 'string' },
  OPS_METRIC_DATA: { items: { label: 'string', value: 'string', color: 'string|undefined', font: 'string|undefined' } },
  OPS_HURDLE_DATA: { items: { name: 'string', impact: 'enum(High|Medium|Low)', desc: 'string' } },
  ESG_FLAG_DATA: { items: { name: 'string', severity: 'enum(High|Medium|Low)', description: 'string' } },
  ESG_REC_DATA: { items: 'string' },
  FOUNDER_DIM_DATA: { items: { dim: 'string', score: 'number' } },
  OS_RISK_DATA: { items: 'string' },
  PRICING_TIER_DATA: { items: { name: 'string', pricePoint: 'string', targetSegment: 'string' } },
  FUNDRAISE_STRENGTH_DATA: { items: 'string' },
  FUNDRAISE_GAP_DATA: { items: 'string' },
};

// ===== VALIDATOR =====
let errors = 0;
let warnings = 0;

function typeName(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  return typeof v;
}

function checkField(val, typeSpec, path) {
  if (typeof typeSpec === 'object' && !Array.isArray(typeSpec)) {
    return checkObject(val, typeSpec, path);
  }
  if (typeSpec === 'stringArray') {
    if (!Array.isArray(val)) {
      errors++; console.error('  ERROR: ' + path + ': expected string array, got ' + typeName(val));
      return false;
    }
    val.forEach(function(v, i) {
      if (typeof v !== 'string') {
        errors++; console.error('  ERROR: ' + path + '[' + i + ']: expected string, got ' + typeof v);
      }
    });
    return true;
  }

  // Parse types, respecting enum(...) as atomic units
  var types = [];
  var current = '';
  var parenDepth = 0;
  for (var ti = 0; ti < typeSpec.length; ti++) {
    var tc = typeSpec[ti];
    if (tc === '(') parenDepth++;
    else if (tc === ')') parenDepth--;
    if (tc === '|' && parenDepth === 0) {
      types.push(current);
      current = '';
    } else {
      current += tc;
    }
  }
  if (current) types.push(current);

  var actual = typeName(val);

  for (var t = 0; t < types.length; t++) {
    var allowed = types[t];
    if (allowed === 'undefined' && actual === 'undefined') return true;
    if (allowed === 'null' && actual === 'null') return true;
    if (allowed === 'number' && actual === 'number' && !isNaN(val)) return true;
    if (allowed === 'string' && actual === 'string') return true;
    if (allowed === 'boolean' && actual === 'boolean') return true;
    if (allowed.startsWith('enum(')) {
      var enumValues = allowed.slice(5, -1).split('|');
      if (enumValues.indexOf(val) !== -1) return true;
    }
  }

  // If we get here, none of the types matched
  if (typeSpec.startsWith('enum(')) {
    var ev = typeSpec.slice(5, -1).split('|');
    errors++; console.error('  ERROR: ' + path + ': expected one of [' + ev.join(', ') + '], got "' + val + '"');
  } else {
    errors++; console.error('  ERROR: ' + path + ': expected ' + typeSpec + ', got ' + actual + ': ' + JSON.stringify(val).slice(0, 60));
  }
  return false;
}

function checkObject(obj, shape, path) {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    errors++; console.error('  ERROR: ' + path + ': expected object, got ' + typeName(obj));
    return false;
  }
  for (var key in shape) {
    if (!(key in obj)) {
      var def = shape[key];
      if (typeof def === 'string' && def.indexOf('|undefined') !== -1) continue;
      errors++; console.error('  ERROR: ' + path + ': missing required field "' + key + '"');
    } else {
      checkField(obj[key], shape[key], path + '.' + key);
    }
  }
  return true;
}

function validate(name, data) {
  var schema = schemas[name];
  if (!schema) return;
  if (!Array.isArray(data)) {
    errors++; console.error('  ERROR: ' + name + ': expected array, got ' + typeName(data));
    return;
  }
  if (schema.min !== undefined && data.length < schema.min) {
    warnings++; console.warn('  WARN: ' + name + ': expected min ' + schema.min + ' items, got ' + data.length);
  }
  if (schema.max !== undefined && data.length > schema.max) {
    warnings++; console.warn('  WARN: ' + name + ': expected max ' + schema.max + ' items, got ' + data.length);
  }
  if (schema.items) {
    data.forEach(function(item, i) {
      if (typeof schema.items === 'string') {
        checkField(item, schema.items, name + '[' + i + ']');
      } else {
        checkObject(item, schema.items, name + '[' + i + ']');
      }
    });
  }
}

function extractBracketed(html, varName) {
  var needle = 'const ' + varName + ' = [';
  var start = html.indexOf(needle);
  if (start === -1) return null;
  start += needle.length;
  // Skip past the opening [ — the content starts here
  var contentStart = start;
  var depth = 1;
  var i = start;
  var inStr = false;
  var strChar = null;
  while (i < html.length && depth > 0) {
    var ch = html[i];
    if (inStr) {
      if (ch === '\\' && i + 1 < html.length) { i += 2; continue; }
      if (ch === strChar) inStr = false;
    } else {
      if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strChar = ch; }
      else if (ch === '[') depth++;
      else if (ch === ']') depth--;
    }
    i++;
  }
  if (depth !== 0) return null;
  // Extract from after the opening [ to just before the closing ]
  var jsonStr = '[' + html.slice(contentStart, i - 1) + ']';
  // Remove trailing commas (valid JS, invalid JSON)
  jsonStr = jsonStr.replace(/,(\s*[\}\]])/g, '$1');
  try { return JSON.parse(jsonStr); }
  catch (e) {
    errors++;
    console.error('  ERROR: ' + varName + ': failed to parse JSON — ' + e.message);
    return null;
  }
}

function extractArraysFromHTML(html) {
  var result = {};
  var schemaKeys = Object.keys(schemas);
  for (var n2 = 0; n2 < schemaKeys.length; n2++) {
    var name = schemaKeys[n2];
    var data = extractBracketed(html, name);
    if (data !== null) { result[name] = data; }
    else { /* not found in HTML */ }
  }
  return result;
}

// ===== MAIN =====
var htmlPath = process.argv[2] || __dirname + '/template.html';
console.log('\nPRD Intelligence — Validating data arrays in: ' + htmlPath + '\n');

try {
  var html = fs.readFileSync(htmlPath, 'utf8');
  var data = extractArraysFromHTML(html);

  if (Object.keys(data).length === 0) {
    console.log('  No data arrays found (template has unsubstituted placeholders?)');
    console.log('  To validate a filled report, run: node validate.cjs <path-to-prd-report.html>\n');
    process.exit(0);
  }

  var names = Object.keys(data);
  for (var n = 0; n < names.length; n++) {
    validate(names[n], data[names[n]]);
  }

  console.log('  ' + names.length + ' arrays checked.');
  if (errors > 0) console.log('  ' + errors + ' error(s), ' + warnings + ' warning(s).');
  else if (warnings > 0) console.log('  ' + warnings + ' warning(s).');
  else console.log('  All valid.');
  console.log();
  process.exit(errors > 0 ? 1 : 0);

} catch (e) {
  console.error('  Failed to read file:', e.message);
  process.exit(1);
}
