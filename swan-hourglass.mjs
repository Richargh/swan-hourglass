// Diagram content: CC-BY-SA-4.0. Rendering implementation: Unlicense.
// See readme.adoc and LICENSES/ for the licensing boundary and terms.
const content = {
  license: 'CC-BY-SA-4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  author: 'Richard Groß',
  authorUrl: 'https://richargh.de',
  attributionTitle: 'Swan Hourglass',
  sourceUrl: 'https://github.com/Richargh/swan-hourglass',
  licenseLabel: 'CC BY-SA 4.0',
  title: '(Black) Swan Hourglass',
  description: 'Problem space on the left, solution space on the right; idea space above, decision space below. Learning and distilling form the upper ring. Using and changing form the lower ring. Align, bet, release, and listen connect the activities. A green shortcut probes a solution from Distilling to Learning. Roles: Domain Expert for Learning, Analyst for Distilling, Engineer for Changing, and User for Using. Align reaches into the organisational Coordination level above the hourglass, with Strategy above Coordination. Two rocks, too large to pass through the neck, are refined into a sand trickle. Below, the sand layers are Obvious (thin), Easy (medium), and Possible (thickest), from top to bottom.',
  product: {
    rocks: 'Ideas',
    trickle: 'Refinement',
    sand: 'Features',
    sandObvious: 'Obvious',
    sandEasy: 'Easy',
    sandPossible: 'Possible',
  },
  sandLayers: {
    obvious: 'Obvious',
    easy: 'Easy',
    possible: 'Possible',
  },
  legend: {
    rightThing: 'build the right thing',
    thingRight: 'build the thing right',
    flow: 'Diverge → Converge',
  },
  poles: {
    top: 'Idea Space',
    bottom: 'Decision Space',
  },
  spaces: {
    left: ['Problem', 'space'],
    right: ['Solution', 'space'],
  },
  activities: {
    learning: 'Learning',
    distilling: 'Distilling',
    changing: 'Changing',
    using: 'Using',
  },
  flightLevels: {
    organisation: 'Organisation',
    coordination: 'Coordination',
    strategy: 'Strategy',
  },
  roles: {
    roleLearning: 'Domain Expert',
    roleDistilling: 'Analyst',
    roleChanging: 'Engineer',
    roleUsing: 'User',
  },
  decisionNames: {
    align: { inside: 'Define', outside: 'Align' },
    bet: { inside: 'Bet', outside: 'Pitch' },
    release: { inside: 'Release', outside: 'Handoff' },
    listen: { inside: 'Listen', outside: 'Briefed' },
  },
  transitions: {
    align: 'Align',
    bet: 'Bet',
    release: 'Release',
    listen: 'Listen',
    probe: 'Probe',
  },
};

const activities = Object.values(content.activities);
const transitions = ['align', 'bet', 'release', 'listen'].map(id => content.transitions[id]);
const shortcuts = ['probe'].map(id => content.transitions[id]);
const roles = Object.values(content.roles);
const flightLevels = Object.values(content.flightLevels);
const product = Object.values(content.product);
const visibilityGroups = {
  activities,
  roles,
  transitions,
  'shortcut-transitions': shortcuts,
  horizons: flightLevels,
  product,
};
const escapeText = text => text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
const itemKeys = new Map(
  Object.entries({ ...content.activities, ...content.transitions, ...content.roles, ...content.flightLevels, ...content.product })
      .map(([id, label]) => [label, id]),
);
const key = name => itemKeys.get(name);

const boundaryTypes = {
  team: { name: 'Product Team', color: '#f0edff' },
  user: { name: 'User', color: '#d9edf7' },
  organisation: { name: 'Organisation', color: '#dce8b8' },
};
const boundaryAssignments = [
  { quadrant: 'bottom-left', activity: 'using', owner: 'user' },
  { quadrant: 'top-left', activity: 'learning', owner: 'team' },
  { quadrant: 'top-right', activity: 'distilling', owner: 'team' },
  { quadrant: 'bottom-right', activity: 'changing', owner: 'team' },
];

const arrowStyles = {
  align: {
    straight: 'M425 144 H455',
    curved: 'M425 144 V82 C425 58 455 58 455 82 V144',
    defaultCurved: true,
  },
  release: {
    straight: 'M455 616 H425',
    curved: 'M455 616 V640 C455 664 425 664 425 640 V616',
    defaultCurved: false,
  },
  listen: {
    straight: 'M394 405 V355',
    curved: 'M394 405 H382 C350 405 350 355 382 355 H394',
    defaultCurved: false,
    label: { straight: [299, 337], curved: [269, 307] },
  },
  bet: {
    straight: 'M486 355 V405',
    curved: 'M486 355 H498 C530 355 530 405 498 405 H486',
    defaultCurved: false,
    label: { straight: [505, 543], curved: [535, 573] },
  },
};

// A short funnel widens toward the activity endpoint.
function activityEndFunnel(path, width) {
  const length = path.getTotalLength();
  const outer = [];
  const inner = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const distance = (0.9 + 0.1 * t) * length;
    const point = path.getPointAtLength(distance);
    const before = path.getPointAtLength(distance - 0.1);
    const after = path.getPointAtLength(Math.min(length, distance + 0.1));
    const dx = after.x - before.x;
    const dy = after.y - before.y;
    const tangentLength = Math.hypot(dx, dy);
    const halfWidth = 6.5 + (width / 2 - 6.5) * t;
    // Gradually straighten the cross-section so the funnel ends vertically.
    const normalX = (1 - t) * -dy / tangentLength;
    const normalY = (1 - t) * dx / tangentLength + t * Math.sign(dx);
    const normalLength = Math.hypot(normalX, normalY);
    const nx = normalX / normalLength * halfWidth;
    const ny = normalY / normalLength * halfWidth;
    outer.push(`${point.x + nx},${point.y + ny}`);
    inner.push(`${point.x - nx},${point.y - ny}`);
  }
  return `M${outer.join(' L')} L${inner.reverse().join(' L')} Z`;
}

function activityHalf(path, start, end) {
  const length = path.getTotalLength();
  const points = [];
  for (let i = 0; i <= 40; i++) {
    const point = path.getPointAtLength((start + (end - start) * i / 40) * length);
    points.push(`${point.x},${point.y}`);
  }
  return `M${points.join(' L')}`;
}

function attributionRdf() {
  return `<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/">
    <cc:Work rdf:about="">
      <dc:title>${escapeText(content.title)}</dc:title>
      <dc:creator><cc:Agent rdf:about="${escapeText(content.authorUrl)}"><dc:title>${escapeText(content.author)}</dc:title></cc:Agent></dc:creator>
      <dc:source rdf:resource="${escapeText(content.sourceUrl)}" />
      <cc:attributionName>${escapeText(content.author)}</cc:attributionName>
      <cc:attributionURL rdf:resource="${escapeText(content.sourceUrl)}" />
      <cc:license rdf:resource="${escapeText(content.licenseUrl)}" />
    </cc:Work>
  </rdf:RDF>`;
}

function pngTextChunk(keyword, text) {
  const encoder = new TextEncoder();
  const key = encoder.encode(keyword);
  const value = encoder.encode(text);
  // PNG iTXt: keyword, null, compression flag/method, empty language/name, UTF-8 text.
  const data = new Uint8Array(key.length + 5 + value.length);
  data.set(key);
  data.set(value, key.length + 5);
  const chunk = new Uint8Array(data.length + 12);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, data.length);
  chunk.set(encoder.encode('iTXt'), 4);
  chunk.set(data, 8);
  let crc = 0xffffffff;
  for (const byte of chunk.subarray(4, chunk.length - 4)) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  view.setUint32(chunk.length - 4, (crc ^ 0xffffffff) >>> 0);
  return chunk;
}

async function addPngAttribution(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const view = new DataView(bytes.buffer);
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = view.getUint32(offset);
    if (offset + length + 12 > bytes.length) break;
    if (String.fromCharCode(...bytes.subarray(offset + 4, offset + 8)) === 'IEND') {
      const fields = {
        Title: content.title,
        Author: content.author,
        Attribution: `${content.attributionTitle} by ${content.author} · ${content.licenseLabel}`,
        Copyright: `© ${content.author}. Licensed under ${content.licenseLabel}.`,
        Source: content.sourceUrl,
        License: content.licenseUrl,
        Description: content.description,
      };
      const chunks = Object.entries(fields).map(([key, value]) => pngTextChunk(key, value));
      return new Blob([bytes.subarray(0, offset), ...chunks, bytes.subarray(offset)], { type: 'image/png' });
    }
    offset += length + 12;
  }
  throw new Error('Could not embed attribution in PNG.');
}

class SwanHourglass extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    const boundaryColors = Object.fromEntries(Object.entries(boundaryTypes).map(([id, boundary]) => [id, boundary.color]));
    let nextBoundaryNumber = Object.keys(boundaryColors).length + 1;
    this.workDistance = 0;
    this.workFrame = null;
    this.workLastTime = null;
    this.workSegments = [];
    this.workRunning = false;
    root.innerHTML = `
      <style>
        :host { display: block; color: #242044; font-family: system-ui, sans-serif; --sand-color: #d9b56e; }
        * { box-sizing: border-box; }
        .export-toolbar { display: grid; grid-template-columns: 580px minmax(0, 1fr); margin-bottom: 12px; }
        .export-actions { grid-column: 2; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px; }
        .export-destination { display: flex; align-items: center; gap: 8px; font-size: .8rem; color: #68627e; }
        #export-status { grid-column: 2; text-align: center; font-size: .8rem; color: #68627e; }
        #export-status:empty { display: none; }
        .card { display: grid; grid-template-columns: 580px minmax(0, 1fr); align-items: start; overflow: hidden; border: 1px solid #e1dfeb; border-radius: 20px; background: white; box-shadow: 0 12px 40px #24204408; }
        svg { display: block; grid-column: 2; grid-row: 1; align-self: start; width: 100%; height: auto; max-height: calc(100dvh - 330px); }
        svg text { fill: #242044; text-anchor: middle; dominant-baseline: middle; }
        .axis { stroke: #aba6c7; stroke-width: 1.5; stroke-dasharray: 5 7; }
        .space { font-size: 19px; font-weight: 700; }
        .pole { font-size: 18px; font-weight: 600; }
        .flight-label { font-size: 14px; font-weight: 600; paint-order: stroke; stroke: white; stroke-width: 4px; stroke-linejoin: round; }
        .ring { fill: none; stroke: #7162c9; stroke-width: 13; }
        .activity-end-funnel { display: none; fill: #7162c9; pointer-events: none; }
        [data-layer="changing"] .activity-end-funnel { fill: #0030FF; }
        svg[data-end-funnels] .activity-end-funnel { display: inline; }
        .activity-hatched { display: none; }
        .activity-hatched path { fill: none; stroke: #7162c9; stroke-width: 13; }
        [data-layer="changing"] .activity-hatched path { stroke: #0030FF; }
        svg[data-hatching] .activity-hatched { display: inline; }
        svg[data-hatching] .ring { visibility: hidden; }
        .flow-legend text { font-size: 17px; fill: #68627e; }
        .attribution { text-anchor: end; font-size: 12px; fill: #777187; }
        .attribution a { fill: inherit; }
        .attribution a:hover { text-decoration: underline; }
        .sand-label { font-size: 12px; font-weight: 600; fill: #5b431e; }
        .rock { fill: var(--sand-color); stroke: color-mix(in srgb, var(--sand-color), black 20%); stroke-width: 1.5; stroke-linejoin: round; }
        .sand-possible { fill: var(--sand-color); }
        .sand-easy { fill: color-mix(in srgb, var(--sand-color), white 25%); }
        .sand-obvious { fill: color-mix(in srgb, var(--sand-color), white 50%); }
        .sand-trickle { fill: none; stroke: var(--sand-color); stroke-width: 3; stroke-linecap: round; stroke-dasharray: 1 7; }
        #work-item { pointer-events: none; }
        #work-item rect { fill: #242044; stroke: white; stroke-width: 2; }
        .work-option { display: flex; align-items: center; gap: 8px; font-size: .85rem; }
        .work-player { width: min(760px, calc(100% - 32px)); margin: 16px auto; display: grid; grid-template-columns: minmax(0, 1fr) minmax(180px, 280px) minmax(0, 1fr); align-items: center; gap: 20px; padding: 16px 20px; border: 1px solid #dedce7; border-radius: 14px; background: linear-gradient(#fafafe, #eeedf4); }
        .player-info { display: grid; gap: 5px; }
        .player-info strong { font-size: .7rem; letter-spacing: .12em; text-transform: uppercase; color: #777187; }
        #work-status { color: #242044; font-size: .95rem; }
        .player-center { display: grid; gap: 12px; }
        .player-transport { display: flex; align-items: center; justify-content: center; gap: 18px; padding-right: 50px; }
        .work-player button { border-radius: 50%; display: grid; place-items: center; padding: 0; background: linear-gradient(white, #e7e5ef); border-color: #cfccd9; box-shadow: 0 2px 4px #24204412; }
        #work-play { width: 48px; height: 48px; font-size: 21px; color: #242044; }
        #work-reset { width: 32px; height: 32px; font-size: 22px; color: #68627e; }
        #work-progress { display: block; width: 100%; height: 5px; border: 0; border-radius: 4px; overflow: hidden; accent-color: #7162c9; background: #d9d6e4; }
        #work-progress::-webkit-progress-bar { background: #d9d6e4; }
        #work-progress::-webkit-progress-value { background: #7162c9; }
        #work-progress::-moz-progress-bar { background: #7162c9; }
        .work-player .work-option { justify-self: end; color: #68627e; }
        .role text { font-size: 15px; fill: #68627e; }
        .role use { color: #68627e; }
        .activity rect { fill: #7162c9; }
        [data-layer="changing"] .ring { stroke: #0030FF; }
        [data-layer="changing"] rect { fill: #0030FF; }
        .legend text { fill: white; font-size: 18px; font-weight: 650; }
        .activity-label { fill: white; font-size: 17px; font-weight: 650; }
        .transition path { fill: none; stroke: #e9008f; stroke-width: 5; }
        .transition rect { fill: #e9008f; }
        .transition text { fill: white; font-size: 17px; font-weight: 650; }
        .shortcut path { stroke: #00a968; }
        .shortcut rect { fill: #00a968; }
        [hidden] { display: none !important; }
        .controls { max-height: calc(100dvh - 330px); overflow-y: auto; grid-column: 1; grid-row: 1; align-self: stretch; align-content: start; min-width: 0; border-right: 1px solid #e1dfeb; padding: 16px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
        .other-controls { grid-column: 2; grid-row: 1; display: grid; align-content: start; gap: 22px; min-width: 0; }
        .control-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
        h2 { margin: 0; font-size: .85rem; letter-spacing: .08em; text-transform: uppercase; }
        details { min-width: 0; border-bottom: 1px solid #e1dfeb; padding-bottom: 14px; }
        summary { cursor: pointer; font-size: .85rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
        summary:focus-visible { outline: 3px solid #7263cb; outline-offset: 3px; }
        .section-body { margin-top: 14px; }
        .section-body > .control-heading { justify-content: flex-end; }
        .buttons { display: flex; flex-wrap: wrap; gap: 8px; }
        button { font: inherit; cursor: pointer; border: 1px solid #dcd8eb; border-radius: 8px; background: white; color: #68627e; padding: 8px 13px; font-size: .85rem; }
        button[aria-pressed="true"] { background: #f0ecff; border-color: #a99cde; color: #4a358d; }
        button[data-kind="transitions"][aria-pressed="true"] { background: #fff0f8; border-color: #ef9bce; color: #ac006a; }
        button[data-item="probe"][aria-pressed="true"] { background: #eafaef; border-color: #81cfa9; color: #007847; }
        button:hover { filter: brightness(.96); }
        button:focus-visible { outline: 3px solid #7263cb; outline-offset: 3px; }
        .group-toggle { padding: 4px 8px; border-color: transparent; color: #65539f; }
        .gap-control { display: grid; gap: 10px; }
        .boundary-controls { grid-column: 1; grid-row: 1; display: grid; align-content: start; gap: 16px; min-width: 0; }
        .boundary-colors { display: grid; gap: 8px; }
        .boundary-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr); align-items: center; gap: 10px; font-size: .85rem; }
        .boundary-row select { min-width: 0; width: 100%; }
        .boundary-color input[type="text"] { min-width: 0; width: 100%; padding: 6px 8px; border: 1px solid #dcd8eb; border-radius: 6px; font: inherit; }
        .boundary-color input[type="color"] { flex-shrink: 0; }
        .boundary-color label { flex: 1; }
        .boundary-color button { flex-shrink: 0; padding: 4px 9px; }
        button:disabled { cursor: not-allowed; opacity: .4; }
        .boundary-color { display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: .85rem; }
        input[type="color"] { width: 44px; height: 30px; padding: 2px; border: 1px solid #dcd8eb; border-radius: 6px; background: white; cursor: pointer; }
        .gap-label { display: flex; justify-content: space-between; font-size: .85rem; }
        output { font-variant-numeric: tabular-nums; color: #68627e; }
        input[type="range"] { width: 100%; margin: 0; accent-color: #7162c9; }
        select { font: inherit; padding: 8px 12px; color: #242044; border: 1px solid #dcd8eb; border-radius: 8px; background: white; }
        input:focus-visible, select:focus-visible { outline: 3px solid #7263cb; outline-offset: 3px; }
        .hint { margin: 0; font-size: .8rem; color: #777187; }
        @media (max-width: 1100px) {
          .card, .export-toolbar { grid-template-columns: minmax(0, 1fr); }
          .export-actions, #export-status { grid-column: 1; }
          svg { grid-column: 1; }
          .controls { grid-row: 2; max-height: none; overflow-y: visible; border-right: 0; border-top: 1px solid #e1dfeb; padding: 16px; }
        }
        @media (max-width: 600px) {
          .controls { grid-template-columns: minmax(0, 1fr); }
          .other-controls { grid-column: 1; grid-row: 2; }
          .work-player { grid-template-columns: minmax(0, 1fr); gap: 16px; text-align: center; }
          .work-player .work-option { justify-self: center; }
        }
      </style>
      <div class="export-toolbar" role="group" aria-label="Diagram screenshots">
        <div class="export-actions">
          <button type="button" data-export="png">Screenshot as PNG</button>
          <button type="button" data-export="svg">Screenshot as SVG</button>
          <label class="export-destination" for="export-destination">Save to
            <select id="export-destination"><option value="file" selected>File</option><option value="clipboard">Clipboard</option></select>
          </label>
        </div>
        <output id="export-status" aria-live="polite"></output>
      </div>
      <section class="card" aria-label="Interactive Swan Hourglass">
        <svg data-end-funnels viewBox="0 -90 880 1000" role="img" aria-labelledby="diagram-title diagram-description">
          <title id="diagram-title">${escapeText(content.title)}</title>
          <desc id="diagram-description">${escapeText(content.description)}</desc>
          <metadata>${attributionRdf()}</metadata>
          <defs>
            <path id="sand-shape" d="M313.811 540 H566.189 A100.133 100.133 0 0 1 455.945 609.569 H424.055 A100.133 100.133 0 0 1 313.811 540 Z" />
            <clipPath id="sand-obvious"><rect x="300" y="540" width="280" height="14" /></clipPath>
            <clipPath id="sand-easy"><rect x="300" y="554" width="280" height="21" /></clipPath>
            <clipPath id="sand-possible"><rect x="300" y="575" width="280" height="36" /></clipPath>
            <clipPath id="strategy-slice"><rect x="300" y="40" width="280" height="30" /></clipPath>
            <clipPath id="coordination-slice"><rect x="300" y="70" width="280" height="31" /></clipPath>
            ${[['purple', '#7162c9'], ['blue', '#0030FF']].map(([id, color]) => `<pattern id="hatch-${id}" patternUnits="userSpaceOnUse" width="6" height="6">
              <path d="M-1 1 L1 -1 M0 6 L6 0 M5 7 L7 5" fill="none" stroke="${color}" stroke-width="2.5" />
            </pattern>`).join('')}
            <symbol id="person-icon" viewBox="0 0 20 20">
              <circle cx="10" cy="5" r="3" fill="black" />
              <path d="M3 18 V16 A7 7 0 0 1 17 16 V18 Z" fill="black" />
            </symbol>
            <clipPath id="clip-top-left"><rect data-gap-clip="top-left" x="0" y="-20" width="435" height="385" /></clipPath>
            <clipPath id="clip-top-right"><rect data-gap-clip="top-right" x="445" y="-20" width="435" height="385" /></clipPath>
            <clipPath id="clip-bottom-left"><rect data-gap-clip="bottom-left" x="0" y="375" width="435" height="365" /></clipPath>
            <clipPath id="clip-bottom-right"><rect data-gap-clip="bottom-right" x="445" y="375" width="435" height="365" /></clipPath>
            <marker id="pink-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 Z" fill="#e9008f" /></marker>
            <marker id="green-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M 0 0 L 10 5 L 0 10 Z" fill="#00a968" /></marker>
          </defs>
          <path data-quadrant="top-left" data-boundary="team" clip-path="url(#clip-top-left)" d="M440 111.072 A132 132 0 1 0 389.657 370 H440 Z" fill="${boundaryTypes.team.color}" />
          <path data-quadrant="top-right" data-boundary="team" clip-path="url(#clip-top-right)" d="M440 111.072 A132 132 0 1 1 490.343 370 H440 Z" fill="${boundaryTypes.team.color}" />
          <path data-quadrant="bottom-left" data-boundary="user" clip-path="url(#clip-bottom-left)" d="M440 628.928 A132 132 0 1 1 389.657 370 H440 Z" fill="${boundaryTypes.user.color}" />
          <path data-quadrant="bottom-right" data-boundary="team" clip-path="url(#clip-bottom-right)" d="M440 628.928 A132 132 0 1 0 490.343 370 H440 Z" fill="${boundaryTypes.team.color}" />
          <g data-layer="organisation">
            <path data-boundary="organisation" d="M310 40 H570 A170.833 170.833 0 0 1 310 40 Z" fill="${boundaryTypes.organisation.color}" />
            <g data-layer="coordination">
              <path d="M310 40 H570 A170.833 170.833 0 0 1 310 40 Z" clip-path="url(#coordination-slice)" fill="white" opacity="0.35" />
            </g>
            <g data-layer="strategy">
              <path d="M310 40 H570 A170.833 170.833 0 0 1 310 40 Z" clip-path="url(#strategy-slice)" fill="black" opacity="0.08" />
            </g>
          </g>
          <path class="axis" d="M440 -32V40 M440 650V728 M150 370H280 M600 370H730" />
          <text class="pole" x="440" y="-52">${escapeText(content.poles.top)}</text>
          <text class="pole" x="440" y="748">${escapeText(content.poles.bottom)}</text>
          <text class="space" x="85" y="358"><tspan x="85">${escapeText(content.spaces.left[0])}</tspan><tspan x="85" dy="24">${escapeText(content.spaces.left[1])}</tspan></text>
          <text class="space" x="795" y="358"><tspan x="795">${escapeText(content.spaces.right[0])}</tspan><tspan x="795" dy="24">${escapeText(content.spaces.right[1])}</tspan></text>

          <g data-outside-org="listen" hidden>
            <path data-boundary="organisation" d="M339 330 V410 A41 41 0 0 0 339 330 Z" fill="${boundaryTypes.organisation.color}" />
          </g>
          <g data-outside-org="bet" hidden>
            <path data-boundary="organisation" d="M541 410 V330 A41 41 0 0 0 541 410 Z" fill="${boundaryTypes.organisation.color}" />
          </g>
          <g data-outside-org="release" hidden>
            <path data-boundary="organisation" d="M400 668 H480 A41 41 0 0 0 400 668 Z" fill="${boundaryTypes.organisation.color}" />
          </g>
          <g class="hourglass" transform="translate(0 -10)">
          <g data-layer="rocks">
            <path class="rock" d="M350 180 L380 160 L425 171 L448 200 L420 225 L370 229 L340 205 Z" />
            <path class="rock" d="M440 223 L470 206 L510 218 L540 242 L515 264 L465 267 L435 244 Z" />
          </g>
          <g data-layer="trickle">
            <path class="sand-trickle" d="M380 232 C370 290 382 330 440 340" />
            <path class="sand-trickle" d="M500 270 C508 295 498 327 440 340" />
            <path class="sand-trickle" d="M440 340 Q437 425 440 540" />
          </g>
          <g data-layer="sand">
            <use class="sand-possible" href="#sand-shape" />
            <g data-layer="sandPossible">
              <use href="#sand-shape" clip-path="url(#sand-possible)" fill="black" opacity="0.08" />
              <text class="sand-label" x="440" y="585">${escapeText(content.sandLayers.possible)}</text>
            </g>
            <g data-layer="sandEasy">
              <use class="sand-easy" href="#sand-shape" clip-path="url(#sand-easy)" />
              <text class="sand-label" x="440" y="564.5">${escapeText(content.sandLayers.easy)}</text>
            </g>
            <g data-layer="sandObvious">
              <use class="sand-obvious" href="#sand-shape" clip-path="url(#sand-obvious)" />
              <text class="sand-label" x="440" y="547">${escapeText(content.sandLayers.obvious)}</text>
            </g>
          </g>
          <g data-layer="learning" class="activity">
            <path class="ring" d="M394 355 A106.633 106.633 0 0 1 425 144" />
            <rect x="179" y="234" width="112" height="31" rx="6" />
            <text class="activity-label" x="235" y="249.5">${escapeText(content.activities.learning)}</text>
          </g>
          <g data-layer="distilling" class="activity">
            <path class="ring" d="M455 144 A106.633 106.633 0 0 1 486 355" />
            <rect x="589" y="234" width="112" height="31" rx="6" />
            <text class="activity-label" x="645" y="249.5">${escapeText(content.activities.distilling)}</text>
          </g>
          <g data-layer="using" class="activity">
            <path class="ring" d="M425 616 A106.633 106.633 0 0 1 394 405" />
            <rect x="179" y="495" width="112" height="31" rx="6" />
            <text class="activity-label" x="235" y="510.5">${escapeText(content.activities.using)}</text>
          </g>
          <g data-layer="changing" class="activity">
            <path class="ring" d="M486 405 A106.633 106.633 0 0 1 455 616" />
            <rect x="589" y="495" width="112" height="31" rx="6" />
            <text class="activity-label" x="645" y="510.5">${escapeText(content.activities.changing)}</text>
          </g>

          <g data-layer="roleLearning" class="role">
            <use href="#person-icon" x="162" y="274" width="20" height="20" aria-hidden="true" />
            <text x="249" y="284">${escapeText(content.roles.roleLearning)}</text>
          </g>
          <g data-layer="roleDistilling" class="role">
            <use href="#person-icon" x="602" y="274" width="20" height="20" aria-hidden="true" />
            <text x="659" y="284">${escapeText(content.roles.roleDistilling)}</text>
          </g>
          <g data-layer="roleUsing" class="role">
            <use href="#person-icon" x="203" y="535" width="20" height="20" aria-hidden="true" />
            <text x="249" y="545">${escapeText(content.roles.roleUsing)}</text>
          </g>
          <g data-layer="roleChanging" class="role">
            <use href="#person-icon" x="592" y="535" width="20" height="20" aria-hidden="true" />
            <text x="659" y="545">${escapeText(content.roles.roleChanging)}</text>
          </g>

          <g data-layer="align" class="transition">
            <path d="${arrowStyles.align.curved}" marker-end="url(#pink-arrow)" />
            <rect x="378" y="8" width="124" height="31" rx="6" />
            <text x="440" y="24">${escapeText(content.transitions.align)}</text>
          </g>
          <g data-layer="bet" class="transition">
            <path d="${arrowStyles.bet.straight}" marker-end="url(#pink-arrow)" />
            <rect x="505" y="364.5" width="76" height="31" rx="6" />
            <text x="543" y="380">${escapeText(content.transitions.bet)}</text>
          </g>
          <g data-layer="release" class="transition">
            <path d="${arrowStyles.release.straight}" marker-end="url(#pink-arrow)" />
            <rect x="389" y="670" width="102" height="31" rx="6" />
            <text x="440" y="686">${escapeText(content.transitions.release)}</text>
          </g>
          <g data-layer="listen" class="transition">
            <path d="${arrowStyles.listen.straight}" marker-end="url(#pink-arrow)" />
            <rect x="299" y="364.5" width="76" height="31" rx="6" />
            <text x="337" y="380">${escapeText(content.transitions.listen)}</text>
          </g>
          <g data-layer="probe" class="transition shortcut">
            <path d="M476 355 C452 359.505 428 359.505 404 355" marker-end="url(#green-arrow)" />
            <rect x="402" y="291" width="76" height="31" rx="6" />
            <text x="440" y="307">${escapeText(content.transitions.probe)}</text>
          </g>
          <g id="work-item" hidden aria-hidden="true">
            <rect x="-6" y="-6" width="12" height="12" rx="2" />
          </g>
          </g>
          <g data-organisation-labels>
          <g data-label-for="coordination">
            <text class="flight-label" x="440" y="82">${escapeText(content.flightLevels.coordination)}</text>
          </g>
          <g data-label-for="strategy">
            <text class="flight-label" x="440" y="54">${escapeText(content.flightLevels.strategy)}</text>
          </g>
          </g>
          <g class="legend" aria-label="Activity colors">
            <rect x="160" y="790" width="260" height="40" rx="6" fill="#7162c9" />
            <text x="290" y="810">${escapeText(content.legend.rightThing)}</text>
            <rect x="460" y="790" width="260" height="40" rx="6" fill="#0030FF" />
            <text x="590" y="810">${escapeText(content.legend.thingRight)}</text>
          </g>
          <g class="flow-legend" hidden>
            <g fill="none" stroke-width="13">
              <path d="M235 875 H275" stroke="url(#hatch-purple)" />
              <path d="M275 875 H315" stroke="#7162c9" />
            </g>
            <text x="470" y="875">${escapeText(content.legend.flow)}</text>
          </g>
          <text class="attribution" x="720" y="779"><a href="${escapeText(content.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeText(content.attributionTitle)}</a><tspan> by </tspan><a href="${escapeText(content.authorUrl)}" target="_blank" rel="noopener noreferrer">${escapeText(content.author)}</a><tspan> · </tspan><a href="${escapeText(content.licenseUrl)}" target="_blank" rel="noopener noreferrer">${escapeText(content.licenseLabel)}</a></text>
        </svg>
        <div class="controls">
          <div class="other-controls">
          ${this.controls('Activities', activities)}
          <details>
            <summary>Activity flow</summary>
            <div class="gap-control section-body" role="group" aria-label="Activity flow">
            <div class="buttons">
              <button type="button" id="hatching-toggle" aria-pressed="false">Show diverge/converge</button>
              <button type="button" id="funnels-toggle" aria-pressed="true">Queues</button>
            </div>
            ${Object.entries(content.activities).map(([id, name]) => `<div class="gap-control">
              <div class="gap-label"><label for="queue-${id}">${escapeText(name)} queue</label><output for="queue-${id}" id="queue-value-${id}">1</output></div>
              <input id="queue-${id}" data-queue="${id}" type="range" min="1" max="10" step="1" value="1" aria-describedby="queue-hint">
            </div>`).join('')}
            <p class="hint" id="queue-hint">Queue capacity: 1–10 items. Larger queues widen the queue shape. Diverge/converge marks the first half with hatching.</p>
            </div>
          </details>
          ${this.controls('Roles', roles)}
          ${this.controls('Transitions', transitions)}
          ${this.controls('Shortcut transitions', shortcuts)}
          <details open>
            <summary>Transition Decision</summary>
            <div class="section-body gap-control" role="group" aria-label="Transition decision authority">
            <div class="buttons">${Object.entries(arrowStyles).map(([id, style]) => `<button type="button" data-arrow="${id}" aria-pressed="${style.defaultCurved}" aria-label="Outside decision for ${escapeText(content.transitions[id])}">${escapeText(content.decisionNames[id][style.defaultCurved ? 'outside' : 'inside'])}: ${style.defaultCurved ? 'Outside' : 'Inside'}</button>`).join('')}</div>
            <p class="hint">Inside: straight arrow. Outside: outward arrow.</p>
            </div>
          </details>
          <p class="hint">Toggle any element to explore the model. The quadrants stay visible.</p>
          </div>
          <div class="boundary-controls">
            <details open>
            <summary>Team boundaries</summary>
            <div role="group" aria-label="Team boundaries" class="gap-control section-body">
            <div class="control-heading"><button type="button" id="add-boundary" aria-label="Add team boundary" title="Add team boundary">+</button></div>
            <div class="boundary-colors">
              ${Object.entries(boundaryTypes).map(([id, boundary]) => `<div class="boundary-color" data-boundary-row="${id}">${id === 'organisation' ? `<label for="boundary-color-${id}">${escapeText(boundary.name)}</label>` : `<input type="text" data-boundary-name="${id}" value="${escapeText(boundary.name)}" aria-label="Name for ${escapeText(boundary.name)} boundary">`}<input type="color" id="boundary-color-${id}" data-boundary-color="${id}" value="${boundary.color}" aria-label="Color for ${escapeText(boundary.name)} boundary"><button type="button" data-remove-boundary="${id}" aria-label="Remove ${boundary.name} boundary">−</button></div>`).join('')}
            </div>
            ${boundaryAssignments.map(({ quadrant, activity, owner }) => `<div class="boundary-row">
              <label for="owner-${quadrant}">${escapeText(content.activities[activity])}</label>
              <select id="owner-${quadrant}" data-boundary-owner="${quadrant}">
                ${Object.entries(boundaryTypes).map(([id, boundary]) => `<option value="${id}"${id === owner ? ' selected' : ''}>${boundary.name}</option>`).join('')}
              </select>
            </div>`).join('')}
          <div class="boundary-row">
            <label for="background-shape">Boundary shape</label>
            <select id="background-shape">
              <option value="half-circles" selected>Half-circles</option>
              <option value="boxes">Boxes</option>
            </select>
          </div>
          <div class="gap-control">
            <div class="gap-label"><label for="box-gap">Boundary gap</label><output for="box-gap" id="gap-value">10</output></div>
            <input id="box-gap" type="range" min="0" max="50" step="5" value="10" aria-describedby="gap-hint">
            <p class="hint" id="gap-hint">Cuts a gap only between different boundaries, in SVG units. Shapes assigned to the same boundary touch.</p>
          </div>
          </div>
            </details>
            ${this.controls('Horizons', flightLevels)}
            ${this.controls('Product', product, '<label class="boundary-color section-body" for="sand-color">Product color<input type="color" id="sand-color" value="#d9b56e"></label>')}
          </div>
        </div>
      </section>
        <div class="work-player" role="group" aria-label="Work flow playback">
          <div class="player-info"><strong>Work flow</strong><output id="work-status" aria-live="off">Ready</output></div>
          <div class="player-center">
            <div class="player-transport">
              <button type="button" id="work-reset" aria-label="Reset work flow" title="Reset"><span aria-hidden="true">↺</span></button>
              <button type="button" id="work-play" aria-pressed="false" aria-label="Play work flow" title="Play"><span id="work-play-icon" aria-hidden="true">▶</span></button>
            </div>
            <progress id="work-progress" max="1" value="0" aria-label="Work flow cycle progress"></progress>
          </div>
          <label class="work-option"><input type="checkbox" id="work-probe">Include Probe detour</label>
        </div>
    `;
    this.updateBoundaryGap();
    root.addEventListener('input', event => {
      if (event.target.id === 'sand-color') {
        this.style.setProperty('--sand-color', event.target.value);
        return;
      }
      if (event.target.dataset.queue) {
        root.querySelector(`#queue-value-${event.target.dataset.queue}`).value = event.target.value;
        this.ensureEndFunnels();
        return;
      }
      const nameId = event.target.dataset.boundaryName;
      if (nameId) {
        const name = event.target.value.trim() || 'Unnamed boundary';
        root.querySelector(`[data-boundary-color="${nameId}"]`).setAttribute('aria-label', `Color for ${name} boundary`);
        root.querySelector(`[data-remove-boundary="${nameId}"]`).setAttribute('aria-label', `Remove ${name} boundary`);
        for (const select of root.querySelectorAll('[data-boundary-owner]')) {
          select.querySelector(`option[value="${nameId}"]`).textContent = name;
        }
        return;
      }
      const owner = event.target.dataset.boundaryColor;
      if (!owner) return;
      boundaryColors[owner] = event.target.value;
      for (const shape of root.querySelectorAll(`[data-boundary="${owner}"]`)) {
        shape.setAttribute('fill', boundaryColors[owner]);
      }
    });
    root.addEventListener('change', event => {
      const quadrant = event.target.dataset.boundaryOwner;
      if (!quadrant) return;
      const shape = root.querySelector(`[data-quadrant="${quadrant}"]`);
      shape.dataset.boundary = event.target.value;
      shape.setAttribute('fill', boundaryColors[event.target.value]);
      this.updateBoundaryGap();
    });
    root.querySelector('#background-shape').addEventListener('change', event => {
      const paths = event.target.value === 'boxes'
        ? {
          'top-left': 'M150 50 H440 V370 H150 Z',
          'top-right': 'M440 50 H730 V370 H440 Z',
          'bottom-left': 'M150 370 H440 V690 H150 Z',
          'bottom-right': 'M440 370 H730 V690 H440 Z',
        }
        : {
          'top-left': 'M440 111.072 A132 132 0 1 0 389.657 370 H440 Z',
          'top-right': 'M440 111.072 A132 132 0 1 1 490.343 370 H440 Z',
          'bottom-left': 'M440 628.928 A132 132 0 1 1 389.657 370 H440 Z',
          'bottom-right': 'M440 628.928 A132 132 0 1 0 490.343 370 H440 Z',
        };
      for (const background of root.querySelectorAll('[data-quadrant]')) {
        background.setAttribute('d', paths[background.dataset.quadrant]);
      }
    });
    root.querySelector('#box-gap').addEventListener('input', () => this.updateBoundaryGap());
    root.querySelector('#work-probe').addEventListener('change', () => {
      this.buildWorkRoute();
      if (this.workRunning || this.workDistance > 0) this.renderWorkItem();
    });
    root.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;
      if (button.dataset.export) {
        void this.exportScreenshot(button.dataset.export);
        return;
      }
      if (button.id === 'work-play') {
        if (this.workRunning) this.pauseWorkFlow();
        else this.playWorkFlow();
        return;
      }
      if (button.id === 'work-reset') {
        this.pauseWorkFlow();
        this.workDistance = 0;
        root.querySelector('#work-item').setAttribute('hidden', '');
        root.querySelector('#work-status').textContent = 'Ready';
        root.querySelector('#work-progress').value = 0;
        return;
      }
      if (button.id === 'hatching-toggle') {
        const enabled = button.getAttribute('aria-pressed') !== 'true';
        if (enabled) {
          for (const ring of root.querySelectorAll('.activity .ring')) {
            if (ring.parentElement.querySelector('.activity-hatched')) continue;
            const halves = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            halves.setAttribute('class', 'activity-hatched');
            for (const [start, end] of [[0, 0.5], [0.5, 1]]) {
              const half = document.createElementNS('http://www.w3.org/2000/svg', 'path');
              half.setAttribute('d', activityHalf(ring, start, end));
              if (start === 0) {
                const color = ring.parentElement.dataset.layer === 'changing' ? 'blue' : 'purple';
                half.style.stroke = `url(#hatch-${color})`;
              }
              halves.append(half);
            }
            ring.after(halves);
          }
        }
        root.querySelector('svg').toggleAttribute('data-hatching', enabled);
        root.querySelector('.flow-legend').toggleAttribute('hidden', !enabled);
        button.setAttribute('aria-pressed', String(enabled));
        return;
      }
      if (button.id === 'funnels-toggle') {
        const enabled = button.getAttribute('aria-pressed') !== 'true';
        if (enabled) this.ensureEndFunnels();
        root.querySelector('svg').toggleAttribute('data-end-funnels', enabled);
        button.setAttribute('aria-pressed', String(enabled));
        return;
      }
      if (button.dataset.removeBoundary) {
        const id = button.dataset.removeBoundary;
        if (Object.keys(boundaryColors).length <= 1) return;
        delete boundaryColors[id];
        const fallback = Object.hasOwn(boundaryColors, 'team') ? 'team' : Object.keys(boundaryColors)[0];
        for (const shape of root.querySelectorAll(`[data-boundary="${id}"]`)) {
          shape.dataset.boundary = fallback;
          shape.setAttribute('fill', boundaryColors[fallback]);
        }
        for (const select of root.querySelectorAll('[data-boundary-owner]')) {
          if (select.value === id) {
            select.value = fallback;
            const shape = root.querySelector(`[data-quadrant="${select.dataset.boundaryOwner}"]`);
            shape.dataset.boundary = fallback;
            shape.setAttribute('fill', boundaryColors[fallback]);
          }
          select.querySelector(`option[value="${id}"]`).remove();
        }
        root.querySelector(`[data-boundary-row="${id}"]`).remove();
        this.updateBoundaryGap();
        for (const removeButton of root.querySelectorAll('[data-remove-boundary]')) {
          removeButton.disabled = Object.keys(boundaryColors).length === 1;
        }
        return;
      }
      if (button.id === 'add-boundary') {
        const number = nextBoundaryNumber++;
        const id = `boundary-${number}`;
        const name = `Boundary ${number}`;
        boundaryColors[id] = '#e4e9f2';
        const row = document.createElement('div');
        row.className = 'boundary-color';
        row.dataset.boundaryRow = id;
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = name;
        nameInput.dataset.boundaryName = id;
        nameInput.setAttribute('aria-label', `Name for boundary ${number}`);
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = boundaryColors[id];
        colorInput.dataset.boundaryColor = id;
        colorInput.setAttribute('aria-label', `Color for boundary ${number}`);
        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.dataset.removeBoundary = id;
        removeButton.setAttribute('aria-label', `Remove boundary ${number}`);
        removeButton.textContent = '−';
        row.append(nameInput, colorInput, removeButton);
        root.querySelector('.boundary-colors').append(row);
        for (const select of root.querySelectorAll('[data-boundary-owner]')) {
          const option = document.createElement('option');
          option.value = id;
          option.textContent = name;
          select.append(option);
        }
        for (const removeButton of root.querySelectorAll('[data-remove-boundary]')) {
          removeButton.disabled = false;
        }
        nameInput.focus();
        nameInput.select();
        return;
      }
      if (button.dataset.arrow) {
        const id = button.dataset.arrow;
        const curved = button.getAttribute('aria-pressed') !== 'true';
        const style = arrowStyles[id];
        const mode = curved ? 'curved' : 'straight';
        const layer = this.layer(id);
        layer.querySelector('path').setAttribute('d', style[mode]);
        if (style.label) {
          const [rectX, textX] = style.label[mode];
          layer.querySelector('rect').setAttribute('x', String(rectX));
          layer.querySelector('text').setAttribute('x', String(textX));
        }
        button.setAttribute('aria-pressed', String(curved));
        const name = content.decisionNames[id][curved ? 'outside' : 'inside'];
        layer.querySelector('text').textContent = name;
        const visibilityButton = root.querySelector(`[data-item="${id}"]`);
        visibilityButton.textContent = name;
        visibilityButton.setAttribute('aria-label', `Show ${name}`);
        button.textContent = `${name}: ${curved ? 'Outside' : 'Inside'}`;
        this.updateOutsideOrganisation(id);
        this.buildWorkRoute();
        if (this.workRunning || this.workDistance > 0) this.renderWorkItem();
      } else if (button.dataset.item) {
        this.setVisible(button.dataset.item, button.getAttribute('aria-pressed') !== 'true');
      } else {
        const names = visibilityGroups[button.dataset.group];
        const allVisible = names.every(name => !this.layer(key(name)).hasAttribute('hidden'));
        names.forEach(name => this.setVisible(key(name), !allVisible));
      }
      this.updateGroupButtons();
    });
  }

  screenshotSvg() {
    const original = this.shadowRoot.querySelector('svg');
    const clone = original.cloneNode(true);
    const properties = [
      'display', 'visibility', 'fill', 'fill-opacity', 'stroke', 'stroke-width',
      'stroke-opacity', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray',
      'opacity', 'font-family', 'font-size', 'font-weight', 'font-style',
      'letter-spacing', 'text-anchor', 'dominant-baseline', 'paint-order',
      'text-decoration', 'clip-path', 'filter', 'marker-start', 'marker-end',
    ];
    const sources = [original, ...original.querySelectorAll('*')];
    const copies = [clone, ...clone.querySelectorAll('*')];
    sources.forEach((element, index) => {
      // Definition geometry must inherit paint from <use>, not freeze its default fill.
      if (element.closest('defs') || element.closest('metadata')) return;
      const computed = getComputedStyle(element);
      for (const property of properties) {
        const value = computed.getPropertyValue(property)
          .replace(/url\(["']?[^"')]*#([^"')]+)["']?\)/g, 'url(#$1)');
        copies[index].style.setProperty(property, value);
      }
    });
    const viewBox = original.viewBox.baseVal;
    clone.setAttribute('width', String(viewBox.width));
    clone.setAttribute('height', String(viewBox.height));
    // Parse RDF as XML so namespace prefixes and case survive HTML serialization.
    const rdf = new DOMParser().parseFromString(attributionRdf(), 'application/xml');
    clone.querySelector('metadata').replaceChildren(document.importNode(rdf.documentElement, true));
    return new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' });
  }

  async screenshotPng(svgBlob) {
    const url = URL.createObjectURL(svgBlob);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth * 2;
      canvas.height = image.naturalHeight * 2;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('PNG rendering is unavailable in this browser.');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const png = await new Promise((resolve, reject) => {
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not create PNG.')), 'image/png');
      });
      return await addPngAttribution(png);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async exportScreenshot(format) {
    const root = this.shadowRoot;
    const status = root.querySelector('#export-status');
    const buttons = root.querySelectorAll('[data-export]');
    const destination = root.querySelector('#export-destination').value;
    status.textContent = 'Preparing screenshot…';
    for (const button of buttons) button.disabled = true;
    try {
      const type = format === 'png' ? 'image/png' : 'image/svg+xml';
      if (destination === 'clipboard') {
        if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
          throw new Error('Clipboard images are unavailable here. Select File instead.');
        }
        if (ClipboardItem.supports && !ClipboardItem.supports(type)) {
          throw new Error(`${format.toUpperCase()} clipboard copying is unsupported by this browser. Select File instead.`);
        }
      }
      const svg = this.screenshotSvg();
      const blob = format === 'png' ? this.screenshotPng(svg) : Promise.resolve(svg);
      if (destination === 'clipboard') {
        await navigator.clipboard.write([new ClipboardItem({ [type]: blob })]);
        status.textContent = `${format.toUpperCase()} copied to clipboard.`;
      } else {
        const url = URL.createObjectURL(await blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `swan-hourglass.${format}`;
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        status.textContent = `${format.toUpperCase()} downloaded.`;
      }
    } catch (error) {
      status.textContent = `Screenshot failed: ${error.message}`;
    } finally {
      for (const button of buttons) button.disabled = false;
    }
  }

  connectedCallback() {
    this.ensureEndFunnels();
  }

  disconnectedCallback() {
    this.pauseWorkFlow();
  }

  buildWorkRoute() {
    const route = ['learning', 'align', 'distilling'];
    if (this.shadowRoot.querySelector('#work-probe').checked) {
      route.push('probe', 'learning', 'align', 'distilling');
    }
    route.push('bet', 'changing', 'release', 'using', 'listen');
    this.workSegments = [];
    let previousEnd;
    for (const id of route) {
      const layer = this.layer(id);
      const path = layer.querySelector(layer.classList.contains('activity') ? '.ring' : 'path');
      const length = path.getTotalLength();
      const start = path.getPointAtLength(0);
      if (previousEnd) {
        const from = previousEnd;
        const gap = Math.hypot(start.x - from.x, start.y - from.y);
        if (gap > 0.01) {
          this.workSegments.push({ id, length: gap, path: {
            getPointAtLength: distance => ({
              x: from.x + (start.x - from.x) * distance / gap,
              y: from.y + (start.y - from.y) * distance / gap,
            }),
          } });
        }
      }
      this.workSegments.push({ id, path, length });
      previousEnd = path.getPointAtLength(length);
    }
    this.workLength = this.workSegments.reduce((sum, segment) => sum + segment.length, 0);
    this.workDistance %= this.workLength;
  }

  renderWorkItem() {
    let distance = this.workDistance;
    let segment = this.workSegments.at(-1);
    for (const candidate of this.workSegments) {
      segment = candidate;
      if (distance <= segment.length) break;
      distance -= segment.length;
    }
    const point = segment.path.getPointAtLength(distance);
    const next = segment.path.getPointAtLength(Math.min(segment.length, distance + 0.5));
    const before = segment.path.getPointAtLength(Math.max(0, distance - 0.5));
    const angle = Math.atan2(next.y - before.y, next.x - before.x) * 180 / Math.PI;
    const marker = this.shadowRoot.querySelector('#work-item');
    marker.setAttribute('transform', `translate(${point.x} ${point.y}) rotate(${angle})`);
    marker.toggleAttribute('hidden', this.layer(segment.id).hasAttribute('hidden'));
    const label = this.layer(segment.id).querySelector('text').textContent;
    const status = this.shadowRoot.querySelector('#work-status');
    if (status.textContent !== label) status.textContent = label;
    this.shadowRoot.querySelector('#work-progress').value = this.workDistance / this.workLength;
  }

  playWorkFlow() {
    this.buildWorkRoute();
    this.workRunning = true;
    this.workLastTime = null;
    const button = this.shadowRoot.querySelector('#work-play');
    this.shadowRoot.querySelector('#work-play-icon').textContent = 'Ⅱ';
    button.setAttribute('aria-label', 'Pause work flow');
    button.title = 'Pause';
    button.setAttribute('aria-pressed', 'true');
    this.renderWorkItem();
    const tick = time => {
      if (!this.workRunning) return;
      if (this.workLastTime !== null) {
        this.workDistance = (this.workDistance + Math.min(time - this.workLastTime, 100) * 0.07) % this.workLength;
      }
      this.workLastTime = time;
      this.renderWorkItem();
      this.workFrame = requestAnimationFrame(tick);
    };
    this.workFrame = requestAnimationFrame(tick);
  }

  pauseWorkFlow() {
    this.workRunning = false;
    if (this.workFrame !== null) cancelAnimationFrame(this.workFrame);
    this.workFrame = null;
    this.workLastTime = null;
    const button = this.shadowRoot.querySelector('#work-play');
    this.shadowRoot.querySelector('#work-play-icon').textContent = '▶';
    button.setAttribute('aria-label', 'Play work flow');
    button.title = 'Play';
    button.setAttribute('aria-pressed', 'false');
  }

  ensureEndFunnels() {
    for (const ring of this.shadowRoot.querySelectorAll('.activity .ring')) {
      const id = ring.parentElement.dataset.layer;
      const capacity = Number(this.shadowRoot.querySelector(`#queue-${id}`).value);
      const width = 13 + (capacity - 1) * 6;
      let funnel = ring.parentElement.querySelector('.activity-end-funnel');
      if (!funnel) {
        funnel = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        funnel.setAttribute('class', 'activity-end-funnel');
        ring.after(funnel);
      }
      funnel.setAttribute('d', activityEndFunnel(ring, width));
    }
  }

  updateBoundaryGap() {
    const root = this.shadowRoot;
    const gap = Number(root.querySelector('#box-gap').value);
    const owners = Object.fromEntries(
      [...root.querySelectorAll('[data-quadrant]')].map(shape => [shape.dataset.quadrant, shape.dataset.boundary]),
    );
    for (const clip of root.querySelectorAll('[data-gap-clip]')) {
      const quadrant = clip.dataset.gapClip;
      const [vertical, horizontal] = quadrant.split('-');
      const left = horizontal === 'left';
      const top = vertical === 'top';
      const horizontalNeighbour = `${vertical}-${left ? 'right' : 'left'}`;
      const verticalNeighbour = `${top ? 'bottom' : 'top'}-${horizontal}`;
      const xGap = owners[quadrant] === owners[horizontalNeighbour] ? 0 : gap / 2;
      const yGap = owners[quadrant] === owners[verticalNeighbour] ? 0 : gap / 2;
      clip.setAttribute('x', String(left ? 0 : 440 + xGap));
      clip.setAttribute('y', String(top ? -20 : 370 + yGap));
      clip.setAttribute('width', String(440 - xGap));
      clip.setAttribute('height', String((top ? 390 : 370) - yGap));
    }
    root.querySelector('#gap-value').value = String(gap);
  }

  controls(title, names, extra = '') {
    const group = title.toLowerCase().replaceAll(' ', '-');
    return `<details open>
      <summary>${title}</summary>
      <div class="section-body" role="group" aria-label="${title} visibility">
        <div class="control-heading"><button type="button" class="group-toggle" data-group="${group}">Hide all ${title.toLowerCase()}</button></div>
        <div class="buttons">${names.map(name => `<button type="button" data-kind="${group}" data-item="${key(name)}" aria-pressed="true" aria-label="Show ${escapeText(name)}">${escapeText(name)}</button>`).join('')}</div>
        ${extra}
      </div>
    </details>`;
  }

  layer(name) {
    return this.shadowRoot.querySelector(`[data-layer="${name}"]`);
  }

  updateOutsideOrganisation(name) {
    const organisation = this.shadowRoot.querySelector(`[data-outside-org="${name}"]`);
    if (!organisation) return;
    const outside = this.shadowRoot.querySelector(`[data-arrow="${name}"]`).getAttribute('aria-pressed') === 'true';
    organisation.toggleAttribute('hidden', !outside || this.layer(name).hasAttribute('hidden') || this.layer('organisation').hasAttribute('hidden'));
  }

  setVisible(name, visible) {
    this.layer(name).toggleAttribute('hidden', !visible);
    this.shadowRoot.querySelector(`[data-label-for="${name}"]`)?.toggleAttribute('hidden', !visible);
    this.shadowRoot.querySelector(`[data-item="${name}"]`).setAttribute('aria-pressed', String(visible));
    if (name === 'organisation') {
      this.shadowRoot.querySelector('[data-organisation-labels]').toggleAttribute('hidden', !visible);
      for (const transition of ['listen', 'bet', 'release']) this.updateOutsideOrganisation(transition);
    }
    this.updateOutsideOrganisation(name);
    if (this.workSegments.length && (this.workRunning || this.workDistance > 0)) this.renderWorkItem();
  }

  updateGroupButtons() {
    for (const [group, names] of Object.entries(visibilityGroups)) {
      const allVisible = names.every(name => !this.layer(key(name)).hasAttribute('hidden'));
      this.shadowRoot.querySelector(`[data-group="${group}"]`).textContent = `${allVisible ? 'Hide' : 'Show'} all ${group.replaceAll('-', ' ')}`;
    }
  }
}

customElements.define('swan-hourglass', SwanHourglass);
