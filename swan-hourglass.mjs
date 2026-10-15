const activities = ['Learning', 'Distilling', 'Changing', 'Using'];
const transitions = ['Translate', 'Bet', 'Release', 'Listen', 'Validate'];
const key = name => name.toLowerCase();

class SwanHourglass extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        :host { display: block; color: #242044; font-family: system-ui, sans-serif; }
        * { box-sizing: border-box; }
        .card { overflow: hidden; border: 1px solid #e1dfeb; border-radius: 20px; background: white; box-shadow: 0 12px 40px #24204408; }
        svg { display: block; width: 100%; height: auto; }
        svg text { fill: #242044; text-anchor: middle; dominant-baseline: middle; }
        .axis { stroke: #aba6c7; stroke-width: 1.5; stroke-dasharray: 5 7; }
        .space { font-size: 19px; font-weight: 700; }
        .pole { font-size: 18px; font-weight: 600; }
        .ring { fill: none; stroke: #7162c9; stroke-width: 13; }
        .activity-label { font-size: 20px; font-weight: 600; }
        .transition path { fill: none; stroke: #e9008f; stroke-width: 5; }
        .transition rect { fill: #e9008f; }
        .transition text { fill: white; font-size: 17px; font-weight: 650; }
        .validate path { stroke: #00a968; }
        .validate rect { fill: #00a968; }
        [hidden] { display: none !important; }
        .controls { border-top: 1px solid #e1dfeb; padding: 24px; display: grid; gap: 22px; }
        .control-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
        h2 { margin: 0; font-size: .85rem; letter-spacing: .08em; text-transform: uppercase; }
        .buttons { display: flex; flex-wrap: wrap; gap: 8px; }
        button { font: inherit; cursor: pointer; border: 1px solid #dcd8eb; border-radius: 8px; background: white; color: #68627e; padding: 8px 13px; font-size: .85rem; }
        button[aria-pressed="true"] { background: #f0ecff; border-color: #a99cde; color: #4a358d; }
        button[data-kind="transitions"][aria-pressed="true"] { background: #fff0f8; border-color: #ef9bce; color: #ac006a; }
        button[data-item="validate"][aria-pressed="true"] { background: #eafaef; border-color: #81cfa9; color: #007847; }
        button:hover { filter: brightness(.96); }
        button:focus-visible { outline: 3px solid #7263cb; outline-offset: 3px; }
        .group-toggle { padding: 4px 8px; border-color: transparent; color: #65539f; }
        .hint { margin: 0; font-size: .8rem; color: #777187; }
        @media (max-width: 500px) { .controls { padding: 16px; } }
      </style>
      <section class="card" aria-label="Interactive Swan Hourglass">
        <svg viewBox="0 -20 880 760" role="img" aria-labelledby="diagram-title diagram-description">
          <title id="diagram-title">Swan Hourglass</title>
          <desc id="diagram-description">Problem space on the left, solution space on the right; idea above, decision below. Learning and distilling form the upper ring. Using and changing form the lower ring. Translate, bet, release, listen, and validate connect the activities. Buttons below toggle their visibility.</desc>
          <defs>
            <marker id="pink-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 Z" fill="#e9008f" /></marker>
            <marker id="green-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M 0 0 L 10 5 L 0 10 Z" fill="#00a968" /></marker>
          </defs>
          <rect x="150" y="50" width="290" height="320" fill="#f0edff" />
          <rect x="440" y="50" width="290" height="320" fill="#ecefff" />
          <rect x="150" y="370" width="290" height="320" fill="#f5f2ff" />
          <rect x="440" y="370" width="290" height="320" fill="#f0f3ff" />
          <path class="axis" d="M440 50V690 M150 370H730" />
          <text class="pole" x="440" y="19">Idea</text>
          <text class="pole" x="440" y="718">Decision</text>
          <text class="space" x="85" y="358"><tspan x="85">Problem</tspan><tspan x="85" dy="24">space</tspan></text>
          <text class="space" x="795" y="358"><tspan x="795">Solution</tspan><tspan x="795" dy="24">space</tspan></text>

          <g class="hourglass" transform="translate(0 -10)">
          <g data-layer="learning" class="activity">
            <path class="ring" d="M394 355 A106.633 106.633 0 0 1 425 144" />
            <text class="activity-label" x="235" y="238">Learning</text>
          </g>
          <g data-layer="distilling" class="activity">
            <path class="ring" d="M455 144 A106.633 106.633 0 0 1 486 355" />
            <text class="activity-label" x="645" y="238">Distilling</text>
          </g>
          <g data-layer="using" class="activity">
            <path class="ring" d="M425 632 A114.554 114.554 0 0 1 394 405" />
            <text class="activity-label" x="235" y="523">Using</text>
          </g>
          <g data-layer="changing" class="activity">
            <path class="ring" d="M486 405 A114.554 114.554 0 0 1 455 632" />
            <text class="activity-label" x="645" y="523">Changing</text>
          </g>

          <g data-layer="translate" class="transition">
            <path d="M425 144 V132 C425 108 455 108 455 132 V144" marker-end="url(#pink-arrow)" />
            <rect x="378" y="78" width="124" height="31" rx="6" />
            <text x="440" y="94">Translate</text>
          </g>
          <g data-layer="bet" class="transition">
            <path d="M486 355 V405" marker-end="url(#pink-arrow)" />
            <rect x="505" y="364.5" width="76" height="31" rx="6" />
            <text x="543" y="380">Bet</text>
          </g>
          <g data-layer="release" class="transition">
            <path d="M455 632 V614 C455 590 425 590 425 614 V632" marker-end="url(#pink-arrow)" />
            <rect x="389" y="650" width="102" height="31" rx="6" />
            <text x="440" y="666">Release</text>
          </g>
          <g data-layer="listen" class="transition">
            <path d="M394 405 V355" marker-end="url(#pink-arrow)" />
            <rect x="299" y="364.5" width="76" height="31" rx="6" />
            <text x="337" y="380">Listen</text>
          </g>
          <g data-layer="validate" class="transition validate">
            <path d="M486 355 C455.333 359.505 424.667 359.505 394 355" marker-end="url(#green-arrow)" />
            <rect x="386" y="291" width="108" height="31" rx="6" />
            <text x="440" y="307">Validate</text>
          </g>
          </g>
        </svg>
        <div class="controls">
          ${this.controls('Activities', activities)}
          ${this.controls('Transitions', transitions)}
          <p class="hint">Toggle any element to explore the model. The quadrants stay visible.</p>
        </div>
      </section>
    `;
    root.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;
      if (button.dataset.item) {
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
      <div class="buttons">${names.map(name => `<button type="button" data-kind="${group}" data-item="${key(name)}" aria-pressed="true" aria-label="Show ${name}">${name}</button>`).join('')}</div>
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
