function Score-Color($s) {
  if ($null -eq $s) { return '#CBC8BF' }
  if ($s -ge 75) { return '#15803D' }
  if ($s -ge 50) { return '#B45309' }
  if ($s -ge 25) { return '#C2410C' }
  return '#DC2626'
}

function Build-VerdictBg($v) {
  switch ($v) {
    'Excellent' { return 'background:#F0FDF4;border-color:#BBF7D0' }
    'Strong' { return 'background:#EEF2FF;border-color:#BFCAF5' }
    'Promising' { return 'background:#FFFBEB;border-color:#FDE68A' }
    'Risky' { return 'background:#FFF1F2;border-color:#FECDD3' }
    'Weak' { return 'background:#FFF1F2;border-color:#FECDD3' }
    default { return 'background:#F7F6F2;border-color:#E4E0D8' }
  }
}

function Build-VerdictText($v) {
  switch ($v) {
    'Excellent' { return '#15803D' }
    'Strong' { return '#1D4ED8' }
    'Promising' { return '#B45309' }
    'Risky' { return '#BE123C' }
    'Weak' { return '#BE123C' }
    default { return '#5C5A56' }
  }
}

function Build-VerdictIcon($v) {
  switch ($v) {
    'Excellent' { return 'award' }
    'Strong' { return 'thumbs-up' }
    'Promising' { return 'trending-up' }
    'Risky' { return 'alert-triangle' }
    'Weak' { return 'x-circle' }
    default { return 'help-circle' }
  }
}

function Build-BuildIcon($score) {
  if ($score -ge 75) { return 'check-circle' }
  if ($score -ge 55) { return 'alert-triangle' }
  return 'x-circle'
}

function Build-BuildIconBg($score) {
  if ($score -ge 75) { return 'background:#F0FDF4;border:1px solid #BBF7D0' }
  if ($score -ge 55) { return 'background:#FFFBEB;border:1px solid #FDE68A' }
  return 'background:#FFF1F2;border:1px solid #FECDD3'
}

function Build-BuildIconColor($score) {
  if ($score -ge 75) { return 'color:#15803D' }
  if ($score -ge 55) { return 'color:#B45309' }
  return 'color:#BE123C'
}

function Build-BuildTextColor($score) {
  if ($score -ge 75) { return 'color:#15803D' }
  if ($score -ge 55) { return 'color:#B45309' }
  return 'color:#BE123C'
}

$score = 82
$verdict = 'Strong'

$template = Get-Content -Path "$PSScriptRoot\template.html" -Raw

$replacements = @{
  '{{REPORT_TITLE}}' = 'OpsPilot AI'
  '{{REPORT_TAGLINE}}' = 'An execution intelligence copilot for mid-market operations teams.'
  '{{REPORT_VERDICT}}' = 'Strong'
  '{{REPORT_SCORE}}' = '82'
  '{{REPORT_INDUSTRY}}' = 'B2B SaaS'
  '{{REPORT_GEOGRAPHY}}' = 'India + Southeast Asia'
  '{{REPORT_DATE}}' = 'May 28, 2026'
  '{{REPORT_SUCCESSFUL}}' = '20'
  '{{EXECUTIVE_SUMMARY}}' = "OpsPilot AI helps operations leaders spot delivery risk, staffing drag, and process bottlenecks before they hit revenue. The clearest opportunity is in fragmented service businesses that still run weekly planning through spreadsheets, Slack, and tribal knowledge. The product's edge comes from stitching those systems into one operational control layer with decision-ready guidance. The business looks promising if the MVP stays tightly focused on workflow visibility and exception handling rather than broad automation too early."
  '{{MARKET_KEY_TREND}}' = 'Ops leaders are shifting from descriptive dashboards to AI-assisted exception management with measurable accountability.'
  '{{COMPETITOR_WHITESPACE}}' = 'A lightweight operational control tower for mid-market teams that need alerting, prioritisation, and ownership clarity without enterprise implementation drag.'
  '{{FEATURE_MVP_SCORE}}' = '84'
  '{{FEATURE_FIT}}' = 'Excellent'
  '{{MOAT_DEFENSIBILITY}}' = '68'
  '{{MOAT_OVERALL}}' = 'Moderate'
  '{{TECH_COMPLEXITY}}' = 'Medium'
  '{{TECH_BUILD_TIME}}' = '14-18 weeks for a focused MVP'
  '{{HIRING_GAP}}' = 'Deep data engineering expertise to build reliable system integrations.'
  '{{HIRING_STRUCTURE}}' = 'Lean product-first team with a heavy focus on engineering and growth.'
  '{{ECOSYSTEM_DISTRIBUTION}}' = 'Leveraging existing workflow platforms to become the intelligence layer on top.'
  '{{LOCALIZATION_FIT}}' = '78'
  '{{LOCALIZATION_ADAPTATION}}' = 'Support for WhatsApp-based intervention triggers and local language UI for field staff.'
  '{{ACCESSIBILITY_SCORE}}' = '68'
  '{{COMPLIANCE_RISK_LEVEL}}' = 'Medium'
  '{{EXIT_ATTRACTIVENESS}}' = '76'
  '{{EXIT_STRATEGIC_VALUE}}' = 'OpsPilot provides a specialized mid-market intelligence layer that incumbents struggle to build natively.'
  '{{EXIT_TIMELINE}}' = '5-7 years'
  '{{BUILD_QUESTION}}' = 'Should this move into a focused MVP?'
  '{{BUILD_DECISION}}' = 'No, this does not look like a waste if you keep the MVP narrow around exception management. It becomes a waste if you try to build broad workflow automation before proving clean integrations and buyer trust.'
}

$replacements['{{VERDICT_BG}}'] = Build-VerdictBg $verdict
$replacements['{{VERDICT_BORDER}}'] = ''
$replacements['{{VERDICT_TEXT_COLOR}}'] = Build-VerdictText $verdict
$replacements['{{VERDICT_ICON}}'] = Build-VerdictIcon $verdict

$replacements['{{BUILD_ICON}}'] = Build-BuildIcon $score
$replacements['{{BUILD_ICON_BG}}'] = Build-BuildIconBg $score
$replacements['{{BUILD_ICON_COLOR}}'] = Build-BuildIconColor $score
$replacements['{{BUILD_TEXT_COLOR}}'] = Build-BuildTextColor $score
$replacements['{{BUILD_BORDER_COLOR}}'] = "border-color:$((Build-BuildIconColor $score).Substring(6))"

# JSON data arrays
$MODULE_DATA = @'
[
  { "key":"executive",   "label":"Exec",    "icon":"file-text",    "score":82 },
  { "key":"market",      "label":"Market",  "icon":"trending-up",  "score":null },
  { "key":"demand",      "label":"Demand",  "icon":"activity",     "score":79 },
  { "key":"competitors", "label":"Rivals",  "icon":"crosshair",    "score":null },
  { "key":"personas",    "label":"Users",   "icon":"users",        "score":null },
  { "key":"features",    "label":"MVP",     "icon":"layers",       "score":84 },
  { "key":"swot",        "label":"SWOT",    "icon":"layout-grid",  "score":null },
  { "key":"gtm",         "label":"GTM",     "icon":"rocket",       "score":null },
  { "key":"monetisation","label":"Revenue", "icon":"dollar-sign",  "score":null },
  { "key":"risks",       "label":"Risks",   "icon":"shield-alert", "score":null },
  { "key":"moat",        "label":"Moat",    "icon":"shield",       "score":68 },
  { "key":"tech",        "label":"Tech",    "icon":"cpu",          "score":null },
  { "key":"ops",         "label":"Ops",     "icon":"settings-2",   "score":64 },
  { "key":"hiring",      "label":"Hiring",  "icon":"briefcase",    "score":null },
  { "key":"ecosystem",   "label":"Eco",     "icon":"git-branch",   "score":null },
  { "key":"economics",   "label":"Econ",    "icon":"bar-chart-3",  "score":84 },
  { "key":"localization","label":"Local",   "icon":"globe",        "score":78 },
  { "key":"accessibility","label":"A11y",   "icon":"accessibility","score":68 },
  { "key":"compliance",  "label":"Comply",  "icon":"scale",        "score":null },
  { "key":"exit",        "label":"Exit",    "icon":"target",       "score":76 }
]
'@

$DEMAND_DATA = @'
[
  { "name":"Workflow visibility", "strength":86, "desc":"Teams struggle to see blockers across fragmented tooling." },
  { "name":"Cost pressure", "strength":77, "desc":"Operators pushed to improve throughput without adding headcount." },
  { "name":"AI readiness", "strength":71, "desc":"Buyers willing to test narrow AI tools that reduce manual coordination." },
  { "name":"Category education", "strength":58, "desc":"The value is real but the category still needs sharper language." },
  { "name":"Replacement friction", "strength":49, "desc":"Switching from incumbent task systems remains slower than greenfield." }
]
'@

$COMPETITOR_DATA = @'
[
  { "name":"Asana", "threat":"Medium", "fit":62, "pos":"General work management with broad team adoption.", "weakness":"Not purpose-built for operational exception management." },
  { "name":"Monday.com", "threat":"Medium", "fit":66, "pos":"Flexible workflow OS for cross-functional teams.", "weakness":"Requires heavy config to become decision-ready." },
  { "name":"ServiceNow", "threat":"Low", "fit":48, "pos":"Enterprise workflow and IT operations platform.", "weakness":"Too heavy and expensive for mid-market operators." },
  { "name":"Notion + spreadsheets", "threat":"High", "fit":70, "pos":"Low-cost internal stack assembled by teams.", "weakness":"Creates visibility but not strong accountability." }
]
'@

$FEATURE_DATA = @'
[
  { "name":"Exception feed", "fit":91, "priority":"Core" },
  { "name":"Capacity heatmap", "fit":87, "priority":"Core" },
  { "name":"Weekly executive digest", "fit":82, "priority":"Core" },
  { "name":"Slack intervention prompts", "fit":76, "priority":"Nice-to-have" },
  { "name":"Workflow templates", "fit":68, "priority":"Nice-to-have" },
  { "name":"Autonomous remediation", "fit":41, "priority":"Future" }
]
'@

$READINESS_DATA = @'
[
  { "dim":"Data availability", "score":72 },
  { "dim":"Buyer urgency", "score":79 },
  { "dim":"Category clarity", "score":58 },
  { "dim":"Technical feasibility", "score":81 },
  { "dim":"GTM readiness", "score":69 }
]
'@

$MARKET_FUNNEL_DATA = @'
[
  { "value":"$11.2B", "desc":"Global spend on workflow orchestration and operations intelligence for services-heavy SMB and mid-market teams." },
  { "value":"$2.4B", "desc":"India and SEA mid-market services, logistics, and field operations buyers with cloud software budgets." },
  { "value":"$145M", "desc":"Five-year reachable niche with product-led sales plus targeted outbound motion." }
]
'@

$DEMAND_SCORE_DATA = @'
[
  { "label":"Score", "value":"79", "score":79 },
  { "label":"Urgency", "value":"High" },
  { "label":"Readiness", "value":"74", "score":74 }
]
'@

$DEMAND_KEYWORD_DATA = @'
["operations dashboard","team capacity planning","workflow bottleneck tracking","service delivery visibility","ops automation"]
'@

$SWOT_DATA = @'
[
  { "key":"strengths", "title":"Strengths", "items":["Clear pain in fragmented ops environments","Strong wedge through exception management","High executive relevance when tied to service delivery KPIs"] },
  { "key":"weaknesses", "title":"Weaknesses", "items":["Needs clean data connections to feel magical","Category story may require education","Trust barrier if recommendations feel opaque"] },
  { "key":"opportunities", "title":"Opportunities", "items":["Vertical packaging for logistics, agencies, field services","Expansion into forecasting and staffing planning","Usage-based pricing tied to monitored workflows"] },
  { "key":"threats", "title":"Threats", "items":["Work management incumbents may add overlapping AI layers","Buyers may default to spreadsheets if onboarding is slow","Weak data hygiene can reduce perceived accuracy"] }
]
'@

$PERSONA_DATA = @'
[
  { "name":"Riya Mehta", "role":"VP Operations", "pain":"Cannot see which team bottlenecks will derail monthly targets until too late.", "goal":"Create a single weekly operating view with fewer manual check-ins.", "tags":["Accountability","Forecasting","Cross-functional"] },
  { "name":"Daniel Cruz", "role":"Head of Delivery", "pain":"Staffing and work allocation drift constantly across customer accounts.", "goal":"Balance capacity and intervene on high-risk workflows faster.", "tags":["Capacity","Escalations","Utilisation"] },
  { "name":"Mina Shah", "role":"Founder", "pain":"The team looks busy but key commitments still slip.", "goal":"Build repeatable operating discipline before scaling headcount.", "tags":["Lean team","Growth","Decision speed"] }
]
'@

$GTM_DATA = @'
[
  { "phase":1, "title":"Founder-led design partners", "desc":"Close 5-8 mid-market teams with painful weekly ops rituals and build around their recurring exception patterns.", "timeline":"0-3 months", "channel":"Founder outbound" },
  { "phase":2, "title":"Category proof through operator content", "desc":"Publish workflow breakdowns, scorecards, and operating reviews that make the product language feel obvious.", "timeline":"3-6 months", "channel":"Content + LinkedIn" },
  { "phase":3, "title":"Repeatable sales motion", "desc":"Package ROI stories around fewer escalations, better utilisation, and faster leadership reporting.", "timeline":"6-12 months", "channel":"Targeted AE + partnerships" }
]
'@

$GTM_METRIC_DATA = @'
[
  { "label":"CAC", "value":"$2.4k-$3.2k" },
  { "label":"LTV", "value":"$28k-$44k" },
  { "label":"Channel", "value":"Founder outbound" }
]
'@

$MONETISATION_DATA = @'
[
  { "name":"Platform subscription", "fit":88, "desc":"Best fit for predictable team-based adoption with clear workflow coverage." },
  { "name":"Per monitored workflow", "fit":79, "desc":"Aligns pricing to operational scope and expansion usage." },
  { "name":"Outcome-based add-on", "fit":57, "desc":"Compelling later, but likely too complex for the first sales motion." }
]
'@

$MONETISATION_METRIC_DATA = @'
[
  { "label":"Recommended", "value":"Platform sub" },
  { "label":"Price Range", "value":"$799-$2.5k/mo" },
  { "label":"Year 3 Rev", "value":"$2.8M-$4.6M" }
]
'@

$RISK_DATA = @'
[
  { "name":"Integration friction", "level":"High", "desc":"Time-to-value drops if setup requires too much data cleanup or manual mapping.", "mit":"Ship opinionated integrations first and use guided onboarding with default workflow models." },
  { "name":"Weak trust in recommendations", "level":"Medium", "desc":"Operators may ignore guidance if the model feels generic or unexplained.", "mit":"Show why each alert exists and tie it to concrete workflow evidence." },
  { "name":"Category ambiguity", "level":"Medium", "desc":"Buyers may compare the product to dashboards, project tools, or automation platforms inconsistently.", "mit":"Lead with pains and business outcomes rather than category labels." }
]
'@

$MOAT_DATA = @'
[
  { "name":"Workflow data network", "desc":"Cross-system workflow data can compound into richer exception models and benchmarks over time.", "strength":"Strong" },
  { "name":"Operational playbooks", "desc":"Intervention patterns become more valuable as the team learns which actions unblock delivery risk fastest.", "strength":"Moderate" },
  { "name":"Brand trust", "desc":"A strong operator-facing point of view can help, but it is still early and not durable yet.", "strength":"Weak" }
]
'@

$TECH_STACK_DATA = @'
[
  { "layer":"Frontend", "tech":"React + TypeScript", "desc":"Fast product iteration, strong component reuse." },
  { "layer":"Backend", "tech":"Node.js + Fastify", "desc":"Simple API surface for integrations and auth." },
  { "layer":"Data", "tech":"Postgres + Redis", "desc":"Reliable storage with caching for alerts and jobs." },
  { "layer":"AI", "tech":"LLM + rule guards", "desc":"Narrative guidance with deterministic thresholds." }
]
'@

$HIRING_DATA = @'
[
  { "title":"Founding Engineer (Backend/Data)", "priority":"Core", "timeline":"Immediate" },
  { "title":"Growth Marketer (Content-led)", "priority":"Core", "timeline":"Month 3" },
  { "title":"Product Designer", "priority":"Nice-to-have", "timeline":"Month 4" },
  { "title":"Head of Customer Success", "priority":"Future", "timeline":"Month 8" }
]
'@

$ECOSYSTEM_DATA = @'
[
  { "platform":"Slack", "desc":"Critical for real-time exception alerts and team communication.", "priority":"Core" },
  { "platform":"Jira / Asana", "desc":"Bi-directional sync for task tracking and status updates.", "priority":"Core" },
  { "platform":"Salesforce", "desc":"Tying operational delivery to customer contract value.", "priority":"Nice-to-have" }
]
'@

$ECON_DATA = @'
[
  { "label":"CAC", "value":"$2,800" },
  { "label":"LTV", "value":"$36,000" },
  { "label":"LTV:CAC", "value":"12.8x", "color":"#15803D" },
  { "label":"Payback", "value":"4.5 mo" },
  { "label":"Gross Margin", "value":"Strong", "color":"#15803D" }
]
'@

$LOCAL_NUANCE_DATA = @'
["High reliance on WhatsApp for ops coordination in SEA","Strong preference for local currency pricing","Relationship-driven sales motion in mid-market"]
'@

$LOCAL_COMPETITOR_DATA = @'
["Regional ERP players","Local workflow boutique agencies"]
'@

$A11Y_GAP_DATA = @'
["Mobile-first accessibility for field operations","Screen reader support for complex dashboards","High cognitive load on data-heavy views"]
'@

$A11Y_REC_DATA = @'
["Implement a Simplified View for mobile users","Enhance contrast for field visibility","Add guided tooltips for complex metrics"]
'@

$COMPLIANCE_FLAG_DATA = @'
[
  { "name":"Data Sovereignty", "level":"Medium", "desc":"Storing client workflow data requires local compliance in specific SEA regions." },
  { "name":"AI Explainability", "level":"Low", "desc":"Transparency in how decisions are recommended for accountability." }
]
'@

$COMPLIANCE_NEXT_DATA = @'
["Conduct local data residency audit","Implement transparent audit logs for AI suggestions"]
'@

$EXIT_ACQUIRER_DATA = @'
["Salesforce","Atlassian","SAP","ServiceNow"]
'@

$OPS_METRIC_DATA = @'
[
  { "label":"Complexity", "value":"64", "color":"#B45309" },
  { "label":"Support Load", "value":"Medium", "font":"15px" },
  { "label":"Logistics", "value":"72", "color":"#0891B2" }
]
'@

$OPS_HURDLE_DATA = @'
[
  { "name":"Data fragmentation", "impact":"High", "desc":"Operations data is scattered across legacy systems and spreadsheets." },
  { "name":"Process variance", "impact":"Medium", "desc":"Different teams use different workflows for the same service delivery." },
  { "name":"Support intensity", "impact":"Low", "desc":"Initial setup requires hands-on guidance but stabilizes quickly." }
]
'@

# All replacements
$allReplacements = $replacements.Clone()
$allReplacements['{{MODULE_DATA}}'] = $MODULE_DATA.Trim()
$allReplacements['{{DEMAND_DATA}}'] = $DEMAND_DATA.Trim()
$allReplacements['{{COMPETITOR_DATA}}'] = $COMPETITOR_DATA.Trim()
$allReplacements['{{FEATURE_DATA}}'] = $FEATURE_DATA.Trim()
$allReplacements['{{READINESS_DATA}}'] = $READINESS_DATA.Trim()
$allReplacements['{{MARKET_FUNNEL_DATA}}'] = $MARKET_FUNNEL_DATA.Trim()
$allReplacements['{{DEMAND_SCORE_DATA}}'] = $DEMAND_SCORE_DATA.Trim()
$allReplacements['{{DEMAND_KEYWORD_DATA}}'] = $DEMAND_KEYWORD_DATA.Trim()
$allReplacements['{{SWOT_DATA}}'] = $SWOT_DATA.Trim()
$allReplacements['{{PERSONA_DATA}}'] = $PERSONA_DATA.Trim()
$allReplacements['{{GTM_DATA}}'] = $GTM_DATA.Trim()
$allReplacements['{{GTM_METRIC_DATA}}'] = $GTM_METRIC_DATA.Trim()
$allReplacements['{{MONETISATION_DATA}}'] = $MONETISATION_DATA.Trim()
$allReplacements['{{MONETISATION_METRIC_DATA}}'] = $MONETISATION_METRIC_DATA.Trim()
$allReplacements['{{RISK_DATA}}'] = $RISK_DATA.Trim()
$allReplacements['{{MOAT_DATA}}'] = $MOAT_DATA.Trim()
$allReplacements['{{TECH_STACK_DATA}}'] = $TECH_STACK_DATA.Trim()
$allReplacements['{{HIRING_DATA}}'] = $HIRING_DATA.Trim()
$allReplacements['{{ECOSYSTEM_DATA}}'] = $ECOSYSTEM_DATA.Trim()
$allReplacements['{{ECON_DATA}}'] = $ECON_DATA.Trim()
$allReplacements['{{LOCAL_NUANCE_DATA}}'] = $LOCAL_NUANCE_DATA.Trim()
$allReplacements['{{LOCAL_COMPETITOR_DATA}}'] = $LOCAL_COMPETITOR_DATA.Trim()
$allReplacements['{{A11Y_GAP_DATA}}'] = $A11Y_GAP_DATA.Trim()
$allReplacements['{{A11Y_REC_DATA}}'] = $A11Y_REC_DATA.Trim()
$allReplacements['{{COMPLIANCE_FLAG_DATA}}'] = $COMPLIANCE_FLAG_DATA.Trim()
$allReplacements['{{COMPLIANCE_NEXT_DATA}}'] = $COMPLIANCE_NEXT_DATA.Trim()
$allReplacements['{{EXIT_ACQUIRER_DATA}}'] = $EXIT_ACQUIRER_DATA.Trim()
$allReplacements['{{OPS_METRIC_DATA}}'] = $OPS_METRIC_DATA.Trim()
$allReplacements['{{OPS_HURDLE_DATA}}'] = $OPS_HURDLE_DATA.Trim()

foreach ($key in $allReplacements.Keys) {
  $template = $template.Replace($key, $allReplacements[$key])
}

$outputPath = "$PSScriptRoot\examples\prd-report.html"
if (-not (Test-Path "$PSScriptRoot\examples")) { New-Item -ItemType Directory -Path "$PSScriptRoot\examples" -Force | Out-Null }
$template | Set-Content -Path $outputPath -NoNewline

Write-Host "Dashboard written to: $outputPath"
Write-Host "File size: $((Get-Item $outputPath).Length / 1KB) KB"
