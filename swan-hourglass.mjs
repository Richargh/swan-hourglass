// Diagram content: CC-BY-SA-4.0. Rendering implementation: Unlicense.
// See readme.adoc and LICENSES/ for the licensing boundary and terms.
const content = {
  license: 'CC-BY-SA-4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  title: '(Black) Swan Hourglass',
  description: 'Problem space on the left, solution space on the right; idea space above, decision space below. Learning and distilling form the upper ring. Using and changing form the lower ring. Align, bet, release, and listen connect the activities. A green shortcut probes a solution from Distilling to Learning. Roles: Domain Expert for Learning, Analyst for Distilling, Engineer for Changing, and User for Using.',
  legend: {
    rightThing: 'build the right thing',
    thingRight: 'build the thing right',
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
const visibilityGroups = {
  activities,
  roles,
  transitions,
  'shortcut-transitions': shortcuts,
};
const escapeText = text => text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
const itemKeys = new Map(
  Object.entries({ ...content.activities, ...content.transitions, ...content.roles })
      .map(([id, label]) => [label, id]),
);
const key = name => itemKeys.get(name);

const boundaryTypes = {
  team: { name: 'Product Team', color: '#f0edff' },
  user: { name: 'User', color: '#ffe8bf' },
  organisation: { name: 'Organisation', color: '#dceee8' },
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
    curved: 'M425 144 V120 C425 96 455 96 455 120 V144',
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

class SwanHourglass extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    const boundaryColors = Object.fromEntries(Object.entries(boundaryTypes).map(([id, boundary]) => [id, boundary.color]));
    let nextBoundaryNumber = Object.keys(boundaryColors).length + 1;
    root.innerHTML = `
      <style>
        :host { display: block; color: #242044; font-family: system-ui, sans-serif; }
        * { box-sizing: border-box; }
        .card { display: grid; grid-template-columns: 300px minmax(0, 1fr); align-items: start; overflow: hidden; border: 1px solid #e1dfeb; border-radius: 20px; background: white; box-shadow: 0 12px 40px #24204408; }
        svg { display: block; grid-column: 2; grid-row: 1; align-self: center; width: 100%; height: auto; }
        svg text { fill: #242044; text-anchor: middle; dominant-baseline: middle; }
        .axis { stroke: #aba6c7; stroke-width: 1.5; stroke-dasharray: 5 7; }
        .space { font-size: 19px; font-weight: 700; }
        .pole { font-size: 18px; font-weight: 600; }
        .ring { fill: none; stroke: #7162c9; stroke-width: 13; }
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
        .controls { grid-column: 1; grid-row: 1; align-self: stretch; align-content: start; min-width: 0; border-right: 1px solid #e1dfeb; padding: 20px; display: grid; gap: 22px; }
        .control-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
        h2 { margin: 0; font-size: .85rem; letter-spacing: .08em; text-transform: uppercase; }
        .buttons { display: flex; flex-wrap: wrap; gap: 8px; }
        button { font: inherit; cursor: pointer; border: 1px solid #dcd8eb; border-radius: 8px; background: white; color: #68627e; padding: 8px 13px; font-size: .85rem; }
        button[aria-pressed="true"] { background: #f0ecff; border-color: #a99cde; color: #4a358d; }
        button[data-kind="transitions"][aria-pressed="true"] { background: #fff0f8; border-color: #ef9bce; color: #ac006a; }
        button[data-item="probe"][aria-pressed="true"] { background: #eafaef; border-color: #81cfa9; color: #007847; }
        button:hover { filter: brightness(.96); }
        button:focus-visible { outline: 3px solid #7263cb; outline-offset: 3px; }
        .group-toggle { padding: 4px 8px; border-color: transparent; color: #65539f; }
        .gap-control { display: grid; gap: 10px; }
        .boundary-controls { display: grid; gap: 16px; }
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
        @media (max-width: 760px) {
          .card { grid-template-columns: minmax(0, 1fr); }
          svg { grid-column: 1; }
          .controls { grid-row: 2; border-right: 0; border-top: 1px solid #e1dfeb; padding: 16px; }
        }
      </style>
      <section class="card" aria-label="Interactive Swan Hourglass">
        <svg viewBox="0 -20 880 880" role="img" aria-labelledby="diagram-title diagram-description">
          <title id="diagram-title">${escapeText(content.title)}</title>
          <desc id="diagram-description">${escapeText(content.description)}</desc>
          <metadata><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:cc="http://creativecommons.org/ns#"><cc:Work rdf:about=""><cc:license rdf:resource="${escapeText(content.licenseUrl)}" /></cc:Work></rdf:RDF></metadata>
          <defs>
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
          <path class="axis" d="M440 50V690 M150 370H730" />
          <text class="pole" x="440" y="19">${escapeText(content.poles.top)}</text>
          <text class="pole" x="440" y="748">${escapeText(content.poles.bottom)}</text>
          <text class="space" x="85" y="358"><tspan x="85">${escapeText(content.spaces.left[0])}</tspan><tspan x="85" dy="24">${escapeText(content.spaces.left[1])}</tspan></text>
          <text class="space" x="795" y="358"><tspan x="795">${escapeText(content.spaces.right[0])}</tspan><tspan x="795" dy="24">${escapeText(content.spaces.right[1])}</tspan></text>

          <g class="hourglass" transform="translate(0 -10)">
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
            <rect x="378" y="66" width="124" height="31" rx="6" />
            <text x="440" y="82">${escapeText(content.transitions.align)}</text>
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
            <path d="M486 355 C455.333 359.505 424.667 359.505 394 355" marker-end="url(#green-arrow)" />
            <rect x="402" y="291" width="76" height="31" rx="6" />
            <text x="440" y="307">${escapeText(content.transitions.probe)}</text>
          </g>
          </g>
          <g class="legend" aria-label="Activity colors">
            <rect x="160" y="790" width="260" height="40" rx="6" fill="#7162c9" />
            <text x="290" y="810">${escapeText(content.legend.rightThing)}</text>
            <rect x="460" y="790" width="260" height="40" rx="6" fill="#0030FF" />
            <text x="590" y="810">${escapeText(content.legend.thingRight)}</text>
          </g>
        </svg>
        <div class="controls">
          ${this.controls('Activities', activities)}
          ${this.controls('Roles', roles)}
          ${this.controls('Transitions', transitions)}
          ${this.controls('Shortcut transitions', shortcuts)}
          <div role="group" aria-label="Transition decision authority">
            <div class="control-heading"><h2>Decision</h2></div>
            <div class="buttons">${Object.entries(arrowStyles).map(([id, style]) => `<button type="button" data-arrow="${id}" aria-pressed="${style.defaultCurved}" aria-label="Outside decision for ${escapeText(content.transitions[id])}">${escapeText(content.decisionNames[id][style.defaultCurved ? 'outside' : 'inside'])}: ${style.defaultCurved ? 'Outside' : 'Inside'}</button>`).join('')}</div>
            <p class="hint">Inside: straight arrow. Outside: outward arrow.</p>
          </div>
          <div class="boundary-controls" role="group" aria-label="Team boundaries">
            <div class="control-heading"><h2>Team boundaries</h2><button type="button" id="add-boundary" aria-label="Add team boundary" title="Add team boundary">+</button></div>
            <div class="boundary-colors">
              ${Object.entries(boundaryTypes).map(([id, boundary]) => `<div class="boundary-color" data-boundary-row="${id}"><input type="text" data-boundary-name="${id}" value="${escapeText(boundary.name)}" aria-label="Name for ${escapeText(boundary.name)} boundary"><input type="color" id="boundary-color-${id}" data-boundary-color="${id}" value="${boundary.color}" aria-label="Color for ${escapeText(boundary.name)} boundary"><button type="button" data-remove-boundary="${id}" aria-label="Remove ${boundary.name} boundary">−</button></div>`).join('')}
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
          <p class="hint">Toggle any element to explore the model. The quadrants stay visible.</p>
        </div>
      </section>
    `;
    this.updateBoundaryGap();
    root.addEventListener('input', event => {
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
      for (const shape of root.querySelectorAll(`[data-quadrant][data-boundary="${owner}"]`)) {
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
    root.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;
      if (button.dataset.removeBoundary) {
        const id = button.dataset.removeBoundary;
        if (Object.keys(boundaryColors).length <= 1) return;
        delete boundaryColors[id];
        const fallback = Object.hasOwn(boundaryColors, 'team') ? 'team' : Object.keys(boundaryColors)[0];
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

  controls(title, names) {
    const group = title.toLowerCase().replaceAll(' ', '-');
    return `<div role="group" aria-label="${title} visibility">
      <div class="control-heading"><h2>${title}</h2><button type="button" class="group-toggle" data-group="${group}">Hide all ${title.toLowerCase()}</button></div>
      <div class="buttons">${names.map(name => `<button type="button" data-kind="${group}" data-item="${key(name)}" aria-pressed="true" aria-label="Show ${escapeText(name)}">${escapeText(name)}</button>`).join('')}</div>
    </div>`;
  }

  layer(name) {
    return this.shadowRoot.querySelector(`[data-layer="${name}"]`);
  }

  setVisible(name, visible) {
    this.layer(name).toggleAttribute('hidden', !visible);
    this.shadowRoot.querySelector(`[data-item="${name}"]`).setAttribute('aria-pressed', String(visible));
  }

  updateGroupButtons() {
    for (const [group, names] of Object.entries(visibilityGroups)) {
      const allVisible = names.every(name => !this.layer(key(name)).hasAttribute('hidden'));
      this.shadowRoot.querySelector(`[data-group="${group}"]`).textContent = `${allVisible ? 'Hide' : 'Show'} all ${group.replaceAll('-', ' ')}`;
    }
  }
}

customElements.define('swan-hourglass', SwanHourglass);
