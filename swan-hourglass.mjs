// Diagram content: CC-BY-SA-4.0. Rendering implementation: Unlicense.
// See readme.adoc and LICENSES/ for the licensing boundary and terms.
const content = {
  license: 'CC-BY-SA-4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  title: '(Black) Swan Hourglass',
  description: 'Problem space on the left, solution space on the right; idea space above, decision space below. Learning and distilling form the upper ring. Using and changing form the lower ring. Align, bet, release, and listen connect the activities. Green shortcuts probe a solution from Distilling to Learning, or propose one from Learning or Using to Distilling.',
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
  decisionNames: {
    align: { team: 'Define', outside: 'Align' },
    bet: { team: 'Bet', outside: 'Pitch' },
    release: { team: 'Release', outside: 'Handoff' },
    listen: { team: 'Listen', outside: 'Briefed' },
  },
  shortcutLabel: 'Propose',
  transitions: {
    align: 'Align',
    bet: 'Bet',
    release: 'Release',
    listen: 'Listen',
    probe: 'Probe',
    propose: 'Propose from learning',
    proposeFromUse: 'Propose from use',
  },
};

const activities = Object.values(content.activities);
const transitions = Object.values(content.transitions);
const escapeText = text => text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
const itemKeys = new Map(
  Object.entries({ ...content.activities, ...content.transitions })
      .map(([id, label]) => [label, id]),
);
const key = name => itemKeys.get(name);

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
        button:is([data-item="probe"], [data-item="propose"], [data-item="proposeFromUse"])[aria-pressed="true"] { background: #eafaef; border-color: #81cfa9; color: #007847; }
        button:hover { filter: brightness(.96); }
        button:focus-visible { outline: 3px solid #7263cb; outline-offset: 3px; }
        .group-toggle { padding: 4px 8px; border-color: transparent; color: #65539f; }
        .gap-control { display: grid; gap: 10px; }
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
            <clipPath id="clip-top-left"><rect data-gap-clip="top-left" x="0" y="-20" width="435" height="385" /></clipPath>
            <clipPath id="clip-top-right"><rect data-gap-clip="top-right" x="445" y="-20" width="435" height="385" /></clipPath>
            <clipPath id="clip-bottom-left"><rect data-gap-clip="bottom-left" x="0" y="375" width="435" height="365" /></clipPath>
            <clipPath id="clip-bottom-right"><rect data-gap-clip="bottom-right" x="445" y="375" width="435" height="365" /></clipPath>
            <marker id="pink-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 Z" fill="#e9008f" /></marker>
            <marker id="green-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M 0 0 L 10 5 L 0 10 Z" fill="#00a968" /></marker>
          </defs>
          <path data-quadrant="top-left" clip-path="url(#clip-top-left)" d="M440 111.072 A132 132 0 1 0 389.657 370 H440 Z" fill="#f0edff" />
          <path data-quadrant="top-right" clip-path="url(#clip-top-right)" d="M440 111.072 A132 132 0 1 1 490.343 370 H440 Z" fill="#ecefff" />
          <path data-quadrant="bottom-left" clip-path="url(#clip-bottom-left)" d="M440 628.928 A132 132 0 1 1 389.657 370 H440 Z" fill="#f5f2ff" />
          <path data-quadrant="bottom-right" clip-path="url(#clip-bottom-right)" d="M440 628.928 A132 132 0 1 0 490.343 370 H440 Z" fill="#f0f3ff" />
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
          <g data-layer="propose" class="transition shortcut">
            <title>${escapeText(content.transitions.propose)}</title>
            <path d="M425 144 C510 185 535 290 486 355" marker-end="url(#green-arrow)" />
            <rect x="357" y="194" width="96" height="31" rx="6" />
            <text x="405" y="210">${escapeText(content.shortcutLabel)}</text>
          </g>
          <g data-layer="proposeFromUse" class="transition shortcut">
            <title>${escapeText(content.transitions.proposeFromUse)}</title>
            <path d="M394 405 Q450 410 486 355" marker-end="url(#green-arrow)" />
            <rect x="392" y="428" width="96" height="31" rx="6" />
            <text x="440" y="444">${escapeText(content.shortcutLabel)}</text>
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
          <div class="gap-control">
            <label for="background-shape">Background shape</label>
            <select id="background-shape">
              <option value="half-circles" selected>Half-circles</option>
              <option value="boxes">Boxes</option>
            </select>
          </div>
          <div class="gap-control">
            <div class="gap-label"><label for="box-gap">Background gap</label><output for="box-gap" id="gap-value">10</output></div>
            <input id="box-gap" type="range" min="0" max="50" step="5" value="10" aria-describedby="gap-hint">
            <p class="hint" id="gap-hint">Cuts a centered gap out of the backgrounds in SVG units. Nothing moves.</p>
          </div>
          ${this.controls('Activities', activities)}
          ${this.controls('Transitions', transitions)}
          <div role="group" aria-label="Transition decision authority">
            <div class="control-heading"><h2>Decision</h2></div>
            <div class="buttons">${Object.entries(arrowStyles).map(([id, style]) => `<button type="button" data-arrow="${id}" aria-pressed="${style.defaultCurved}" aria-label="Outside decision for ${escapeText(content.transitions[id])}">${escapeText(content.decisionNames[id][style.defaultCurved ? 'outside' : 'team'])}: ${style.defaultCurved ? 'Outside' : 'Team'}</button>`).join('')}</div>
            <p class="hint">Team: straight arrow. Outside: outward arrow.</p>
          </div>
          <p class="hint">Toggle any element to explore the model. The quadrants stay visible.</p>
        </div>
      </section>
    `;
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
    root.querySelector('#box-gap').addEventListener('input', event => {
      const gap = Number(event.target.value);
      const offset = gap / 2;
      for (const clip of root.querySelectorAll('[data-gap-clip]')) {
        const left = clip.dataset.gapClip.endsWith('left');
        const top = clip.dataset.gapClip.startsWith('top');
        clip.setAttribute('x', String(left ? 0 : 440 + offset));
        clip.setAttribute('y', String(top ? -20 : 370 + offset));
        clip.setAttribute('width', String(440 - offset));
        clip.setAttribute('height', String((top ? 390 : 370) - offset));
      }
      root.querySelector('#gap-value').value = String(gap);
    });
    root.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;
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
        const name = content.decisionNames[id][curved ? 'outside' : 'team'];
        layer.querySelector('text').textContent = name;
        const visibilityButton = root.querySelector(`[data-item="${id}"]`);
        visibilityButton.textContent = name;
        visibilityButton.setAttribute('aria-label', `Show ${name}`);
        button.textContent = `${name}: ${curved ? 'Outside' : 'Team'}`;
      } else if (button.dataset.item) {
        this.setVisible(button.dataset.item, button.getAttribute('aria-pressed') !== 'true');
      } else {
        const names = button.dataset.group === 'activities' ? activities : transitions;
        const allVisible = names.every(name => !this.layer(key(name)).hasAttribute('hidden'));
        names.forEach(name => this.setVisible(key(name), !allVisible));
      }
      this.updateGroupButtons();
    });
  }

  controls(title, names) {
    const group = title.toLowerCase();
    return `<div role="group" aria-label="${title} visibility">
      <div class="control-heading"><h2>${title}</h2><button type="button" class="group-toggle" data-group="${group}">Hide all ${group}</button></div>
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
    for (const [group, names] of [['activities', activities], ['transitions', transitions]]) {
      const allVisible = names.every(name => !this.layer(key(name)).hasAttribute('hidden'));
      this.shadowRoot.querySelector(`[data-group="${group}"]`).textContent = `${allVisible ? 'Hide' : 'Show'} all ${group}`;
    }
  }
}

customElements.define('swan-hourglass', SwanHourglass);
