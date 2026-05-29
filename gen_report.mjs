#!/usr/bin/env node
/**
 * PRD Intelligence — Dynamic Report Renderer
 *
 * Reads a data.json file and template.html, fills all placeholders,
 * and writes index.html + data.json to the output folder.
 *
 * Usage:
 *   node gen_report.mjs --data path/to/data.json [--out path/to/output]
 *
 * If --data is omitted, looks for data.json in the current directory.
 * If --out is omitted, creates reports/<project-name>/ folder.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ===== PARSE ARGS =====
const args = process.argv.slice(2);
const dataPath = args.indexOf('--data') !== -1 ? args[args.indexOf('--data') + 1] : join(process.cwd(), 'data.json');
const outDirArg = args.indexOf('--out') !== -1 ? args[args.indexOf('--out') + 1] : null;

// ===== LOAD DATA =====
let data;
try {
  data = JSON.parse(readFileSync(dataPath, 'utf8'));
} catch (e) {
  console.error(`Failed to read data file: ${dataPath}`);
  console.error(e.message);
  process.exit(1);
}

const exec = data.executive || {};
const founder = data.founder || {};
const market = data.market || {};
const demand = data.demand || {};
const competitors = data.competitors || {};
const features = data.features || {};
const swot = data.swot || {};
const personas = data.personas || {};
const gtm = data.gtm || {};
const monetisation = data.monetisation || {};
const pricing = data.pricing || {};
const risks = data.risks || {};
const moat = data.moat || {};
const tech = data.tech || {};
const openSource = data.openSource || {};
const ops = data.ops || {};
const hiring = data.hiring || {};
const ecosystem = data.ecosystem || {};
const economics = data.economics || {};
const localization = data.localization || {};
const accessibility = data.accessibility || {};
const compliance = data.compliance || {};
const esg = data.esg || {};
const fundraising = data.fundraising || {};
const exit = data.exit || {};
const meta = data.meta || {};

// ===== COMPUTED DATA =====
const now = new Date();
const reportDate = meta.date || now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const reportIndustry = meta.industry || 'General';
const reportGeography = meta.geography || 'Global';

const moduleData = [
  { key: 'executive', label: 'Overview', icon: 'sparkles', score: null },
  { key: 'founder', label: 'Founder', icon: 'user-check', score: founder.overallScore ?? null },
  { key: 'market', label: 'Market', icon: 'trending-up', score: null },
  { key: 'demand', label: 'Demand', icon: 'activity', score: demand.demandScore ?? null },
  { key: 'competitors', label: 'Rivals', icon: 'crosshair', score: null },
  { key: 'personas', label: 'Users', icon: 'users', score: null },
  { key: 'features', label: 'MVP', icon: 'layers', score: features.mvpScore ?? null },
  { key: 'swot', label: 'SWOT', icon: 'layout-grid', score: null },
  { key: 'gtm', label: 'GTM', icon: 'rocket', score: null },
  { key: 'monetisation', label: 'Revenue', icon: 'dollar-sign', score: null },
  { key: 'pricing', label: 'Pricing', icon: 'tag', score: pricing.sensitivityScore ?? null },
  { key: 'risks', label: 'Risks', icon: 'shield-alert', score: null },
  { key: 'moat', label: 'Moat', icon: 'shield', score: moat.defensibility ?? null },
  { key: 'tech', label: 'Tech', icon: 'cpu', score: null },
  { key: 'openSource', label: 'OSS', icon: 'github', score: openSource.viabilityScore ?? null },
  { key: 'ops', label: 'Ops', icon: 'settings-2', score: ops.complexityScore ?? null },
  { key: 'hiring', label: 'Hiring', icon: 'briefcase', score: null },
  { key: 'ecosystem', label: 'Eco', icon: 'git-branch', score: null },
  { key: 'economics', label: 'Econ', icon: 'bar-chart-3', score: economics.unitEconomicsScore ?? null },
  { key: 'localization', label: 'Local', icon: 'globe', score: localization.marketFit ?? null },
  { key: 'accessibility', label: 'A11y', icon: 'accessibility', score: accessibility.score ?? null },
  { key: 'compliance', label: 'Comply', icon: 'scale', score: compliance.score ?? null },
  { key: 'esg', label: 'ESG', icon: 'leaf', score: esg.overallScore ?? null },
  { key: 'fundraising', label: 'Fundraise', icon: 'banknote', score: fundraising.readinessScore ?? null },
  { key: 'exit', label: 'Exit', icon: 'target', score: exit.attractiveness ?? null }
];

const demandScoreData = [
  { label: 'Demand Score', value: (demand.demandScore ?? '').toString(), score: demand.demandScore ?? null },
  { label: 'Urgency', value: demand.urgency ?? '', score: urgencyScore(demand.urgency) },
  { label: 'Buyer Readiness', value: (demand.buyerReadiness ?? '').toString(), score: demand.buyerReadiness ?? null }
];

function urgencyScore(u) {
  if (u === 'High') return 75;
  if (u === 'Medium') return 50;
  return 25;
}

const marketFunnelData = [
  { value: market.tam?.value ?? '', desc: market.tam?.note ?? '' },
  { value: market.sam?.value ?? '', desc: market.sam?.note ?? '' },
  { value: market.som?.value ?? '', desc: market.som?.note ?? '' }
];

const swotData = [
  { key: 'strengths', title: 'Strengths', items: swot.strengths ?? [] },
  { key: 'weaknesses', title: 'Weaknesses', items: swot.weaknesses ?? [] },
  { key: 'opportunities', title: 'Opportunities', items: swot.opportunities ?? [] },
  { key: 'threats', title: 'Threats', items: swot.threats ?? [] }
];

const gtmMetricData = [
  { label: 'Primary Channel', value: gtm.primaryChannel ?? '' },
  { label: 'CAC', value: gtm.cac ?? '' },
  { label: 'LTV', value: gtm.ltv ?? '' }
];

const monetisationMetricData = [
  { label: 'Recommended', value: monetisation.recommended ?? '' },
  { label: 'Price Range', value: monetisation.priceRange ?? '' },
  { label: 'Revenue Year 1', value: monetisation.revenueYear1 ?? '' },
  { label: 'Revenue Year 3', value: monetisation.revenueYear3 ?? '' }
];

const econData = [
  { label: 'CAC', value: economics.cacEstimate ?? '' },
  { label: 'LTV', value: economics.ltvEstimate ?? '' },
  { label: 'Payback Period', value: economics.paybackPeriod ?? '' },
  { label: 'Margin Profile', value: economics.marginProfile ?? '' }
];

const opsMetricData = [
  { label: 'Complexity Score', value: (ops.complexityScore ?? '').toString() },
  { label: 'Support Load', value: ops.supportLoad ?? '' },
  { label: 'Logistics Rating', value: (ops.logisticsRating ?? '').toString() }
];

const founderDimData = [
  { dim: 'Domain Expertise', score: 38 },
  { dim: 'Industry Network', score: 15 },
  { dim: 'Execution Readiness', score: 20 },
  { dim: 'Critical Gap', score: 5 }
];

// ===== PLACEHOLDER MAPPING — SCALARS =====
const scalars = {
  '{{REPORT_TITLE}}': exec.title ?? '',
  '{{REPORT_TAGLINE}}': exec.tagline ?? '',
  '{{REPORT_VERDICT}}': exec.verdict ?? '',
  '{{REPORT_SCORE}}': (exec.overallScore ?? 0).toString(),
  '{{REPORT_INDUSTRY}}': reportIndustry,
  '{{REPORT_GEOGRAPHY}}': reportGeography,
  '{{REPORT_DATE}}': reportDate,
  '{{REPORT_SUCCESSFUL}}': '25',
  '{{EXECUTIVE_SUMMARY}}': exec.summary ?? '',
  '{{MARKET_KEY_TREND}}': market.keyTrend ?? '',
  '{{COMPETITOR_WHITESPACE}}': competitors.whiteSpace ?? '',
  '{{FEATURE_MVP_SCORE}}': (features.mvpScore ?? 0).toString(),
  '{{FEATURE_FIT}}': features.overallFit ?? '',
  '{{MOAT_DEFENSIBILITY}}': (moat.defensibility ?? 0).toString(),
  '{{MOAT_OVERALL}}': moat.overallMoat ?? '',
  '{{TECH_COMPLEXITY}}': tech.complexity ?? '',
  '{{TECH_BUILD_TIME}}': tech.buildTime ?? '',
  '{{HIRING_GAP}}': hiring.teamGap ?? '',
  '{{HIRING_STRUCTURE}}': hiring.structure ?? '',
  '{{ECOSYSTEM_DISTRIBUTION}}': ecosystem.distributionAdvantage ?? '',
  '{{LOCALIZATION_FIT}}': (localization.marketFit ?? 0).toString(),
  '{{LOCALIZATION_ADAPTATION}}': localization.adaptationRequired ?? '',
  '{{ACCESSIBILITY_SCORE}}': (accessibility.score ?? 0).toString(),
  '{{COMPLIANCE_RISK_LEVEL}}': compliance.riskLevel ?? '',
  '{{COMPLIANCE_SCORE}}': (compliance.score ?? 0).toString(),
  '{{EXIT_ATTRACTIVENESS}}': (exit.attractiveness ?? 0).toString(),
  '{{EXIT_STRATEGIC_VALUE}}': exit.strategicValue ?? '',
  '{{EXIT_TIMELINE}}': exit.exitTimeline ?? '',
  '{{ESG_SCORE}}': (esg.overallScore ?? 0).toString(),
  '{{ESG_ENV}}': (esg.environmentalScore ?? 0).toString(),
  '{{ESG_SOCIAL}}': (esg.socialScore ?? 0).toString(),
  '{{ESG_GOV}}': (esg.governanceScore ?? 0).toString(),
  '{{FOUNDER_SCORE}}': (founder.overallScore ?? 0).toString(),
  '{{FOUNDER_GAP}}': founder.criticalGap ?? '',
  '{{OS_SCORE}}': (openSource.viabilityScore ?? 0).toString(),
  '{{OS_MODEL}}': openSource.recommendedModel ?? '',
  '{{OS_COMMUNITY}}': openSource.communityPotential ?? '',
  '{{PRICING_SCORE}}': (pricing.sensitivityScore ?? 0).toString(),
  '{{PRICING_ELASTICITY}}': pricing.priceElasticity ?? '',
  '{{PRICING_WTP}}': pricing.willingnessToPay ?? '',
  '{{FUNDRAISE_SCORE}}': (fundraising.readinessScore ?? 0).toString(),
  '{{FUNDRAISE_STAGE}}': fundraising.recommendedStage ?? '',
  '{{FUNDRAISE_ASK}}': fundraising.estimatedAsk ?? '',
  '{{FUNDRAISE_TIMELINE}}': fundraising.timeline ?? ''
};

// ===== VERDICT-DEPENDENT =====
const verdictMap = {
  'Excellent': { bg: 'bg-green-100 border-green-300', color: '#15803D', icon: 'award' },
  'Strong': { bg: 'bg-blue-100 border-blue-300', color: '#1D4ED8', icon: 'thumbs-up' },
  'Promising': { bg: 'bg-amber-100 border-amber-300', color: '#B45309', icon: 'trending-up' },
  'Risky': { bg: 'bg-rose-100 border-rose-300', color: '#BE123C', icon: 'alert-triangle' },
  'Weak': { bg: 'bg-rose-100 border-rose-300', color: '#BE123C', icon: 'x-circle' }
};
const v = verdictMap[exec.verdict] || verdictMap['Weak'];

// ===== BUILD DECISION =====
let buildIcon, buildIconBg, buildIconColor, buildTextColor, buildBorderColor;
let buildQuestion, buildDecisionLabel;
const score = exec.overallScore ?? 0;

if (score >= 75) {
  buildIcon = 'check-circle';
  buildIconBg = 'background:#F0FDF4;border:1px solid #BBF7D0';
  buildIconColor = '#15803D';
  buildTextColor = '#15803D';
  buildBorderColor = '#15803D';
  buildQuestion = exec.buildDecisionQuestion;
  buildDecisionLabel = 'Proceed with narrow scope';
} else if (score >= 50) {
  buildIcon = 'alert-triangle';
  buildIconBg = 'background:#FFFBEB;border:1px solid #FDE68A';
  buildIconColor = '#B45309';
  buildTextColor = '#B45309';
  buildBorderColor = '#B45309';
  buildQuestion = exec.buildDecisionQuestion;
  buildDecisionLabel = 'Proceed with Caution';
} else {
  buildIcon = 'x-circle';
  buildIconBg = 'background:#FFF1F2;border:1px solid #FECDD3';
  buildIconColor = '#BE123C';
  buildTextColor = '#BE123C';
  buildBorderColor = '#BE123C';
  buildQuestion = 'Should this be built at all?';
  buildDecisionLabel = 'Do not build this yet';
}

Object.assign(scalars, {
  '{{VERDICT_BG}}': v.bg,
  '{{VERDICT_TEXT_COLOR}}': v.color,
  '{{VERDICT_ICON}}': v.icon,
  '{{BUILD_ICON}}': buildIcon,
  '{{BUILD_ICON_BG}}': buildIconBg,
  '{{BUILD_ICON_COLOR}}': buildIconColor,
  '{{BUILD_TEXT_COLOR}}': buildTextColor,
  '{{BUILD_BORDER_COLOR}}': buildBorderColor,
  '{{BUILD_QUESTION}}': buildQuestion,
  '{{BUILD_DECISION}}': exec.buildDecision ?? ''
});

// ===== JS DATA ARRAYS =====
const jsArrays = {
  MODULE_DATA: moduleData,
  DEMAND_DATA: demand.signals ?? [],
  COMPETITOR_DATA: competitors.competitors ?? [],
  FEATURE_DATA: features.features ?? [],
  READINESS_DATA: tech.readiness ?? [],
  MARKET_FUNNEL_DATA: marketFunnelData,
  DEMAND_SCORE_DATA: demandScoreData,
  DEMAND_KEYWORD_DATA: demand.keywords ?? [],
  SWOT_DATA: swotData,
  PERSONA_DATA: personas.personas ?? [],
  GTM_DATA: gtm.phases ?? [],
  GTM_METRIC_DATA: gtmMetricData,
  MONETISATION_DATA: monetisation.models ?? [],
  MONETISATION_METRIC_DATA: monetisationMetricData,
  RISK_DATA: risks.risks ?? [],
  MOAT_DATA: moat.moats ?? [],
  TECH_STACK_DATA: tech.stack ?? [],
  HIRING_DATA: hiring.roles ?? [],
  ECOSYSTEM_DATA: ecosystem.integrations ?? [],
  ECON_DATA: econData,
  LOCAL_NUANCE_DATA: localization.culturalNuances ?? [],
  LOCAL_COMPETITOR_DATA: localization.localCompetitors ?? [],
  A11Y_GAP_DATA: accessibility.gaps ?? [],
  A11Y_REC_DATA: accessibility.recommendations ?? [],
  COMPLIANCE_FLAG_DATA: compliance.regulatoryFlags ?? [],
  COMPLIANCE_NEXT_DATA: compliance.nextSteps ?? [],
  EXIT_ACQUIRER_DATA: exit.potentialAcquirers ?? [],
  OPS_METRIC_DATA: opsMetricData,
  OPS_HURDLE_DATA: ops.hurdles ?? [],
  ESG_FLAG_DATA: esg.redFlags ?? [],
  ESG_REC_DATA: esg.recommendations ?? [],
  FOUNDER_DIM_DATA: founderDimData,
  OS_RISK_DATA: openSource.risks ?? [],
  PRICING_TIER_DATA: pricing.tiers ?? [],
  FUNDRAISE_STRENGTH_DATA: fundraising.strengths ?? [],
  FUNDRAISE_GAP_DATA: fundraising.criticalGaps ?? []
};

// ===== GENERATE HTML =====
const templatePath = join(__dirname, 'template.html');
let html;
try {
  html = readFileSync(templatePath, 'utf8');
} catch (e) {
  console.error('template.html not found alongside this script');
  process.exit(1);
}

for (const [key, val] of Object.entries(scalars)) {
  html = html.replaceAll(key, val);
}

for (const [key, val] of Object.entries(jsArrays)) {
  html = html.replaceAll(`{{${key}}}`, JSON.stringify(val, null, 2));
}

// ===== BUILD DATA JSON (merge with computed meta) =====
const reportData = {
  meta: {
    title: exec.title ?? '',
    tagline: exec.tagline ?? '',
    date: reportDate,
    industry: reportIndustry,
    geography: reportGeography
  },
  executive: exec,
  founder,
  market,
  demand,
  competitors,
  features,
  swot,
  personas,
  gtm,
  monetisation,
  pricing,
  risks,
  moat,
  tech,
  openSource,
  ops,
  hiring,
  ecosystem,
  economics,
  localization,
  accessibility,
  compliance,
  esg,
  fundraising,
  exit
};

// ===== DETERMINE OUTPUT FOLDER =====
let projectDir;
if (outDirArg) {
  projectDir = outDirArg;
  if (!existsSync(projectDir)) mkdirSync(projectDir, { recursive: true });
} else {
  const reportsDir = join(__dirname, 'reports');
  if (!existsSync(reportsDir)) mkdirSync(reportsDir);

  const projectName = (exec.title ?? 'report')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'report';

  projectDir = join(reportsDir, projectName);
  let version = 0;
  while (existsSync(projectDir)) {
    version++;
    projectDir = join(reportsDir, `${projectName}-v${version}`);
  }
  mkdirSync(projectDir);
}

// ===== SAVE =====
writeFileSync(join(projectDir, 'index.html'), html, 'utf8');
writeFileSync(join(projectDir, 'data.json'), JSON.stringify(reportData, null, 2), 'utf8');
console.log(`Report saved to: ${join(projectDir, 'index.html')}`);
console.log(`Data saved to: ${join(projectDir, 'data.json')}`);
console.log(`File size: ${(html.length / 1024).toFixed(1)} KB`);

// ===== OPEN BROWSER =====
try {
  const reportPath = join(projectDir, 'index.html');
  execSync(`start "" "${reportPath}"`, { timeout: 5000 });
  console.log('Browser opened.');
} catch (e) {
  // ignore — non-Windows or headless
}
