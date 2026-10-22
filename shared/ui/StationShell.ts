import { NavigationController } from '../core/NavigationController.js';
import type { RoomState } from '../core/RoomState.js';
import type { MathRenderer } from '../math/MathJaxRenderer.js';

export interface StationDefinition {
  readonly chapterIndex: number;
  readonly stationId: string;
  readonly title: string;
  readonly promptTex: string;
  readonly answer?: { readonly fieldId: string; readonly label: string };
  readonly choice?: {
    readonly choiceId: string;
    readonly label: string;
    readonly options: readonly { readonly id: string; readonly label: string }[];
  };
}

export interface StationShellOptions {
  root: HTMLElement;
  controller: NavigationController;
  actorId: string;
  stations: readonly StationDefinition[];
  math: MathRenderer;
}

function stationKey(chapterIndex: number, stationId: string): string {
  return JSON.stringify([chapterIndex, stationId]);
}

/** Checks content before mounting so a lesson cannot silently navigate to duplicate stations. */
export function validateStations(stations: readonly StationDefinition[]): void {
  if (stations.length === 0) throw new Error('At least one station is required');
  const ids = new Set<string>();
  for (const station of stations) {
    if (!Number.isSafeInteger(station.chapterIndex) || station.chapterIndex < 0 ||
        !station.stationId.trim() || !station.title.trim()) throw new Error('Invalid station');
    const key = stationKey(station.chapterIndex, station.stationId);
    if (ids.has(key)) throw new Error('Duplicate station');
    ids.add(key);
    if (station.answer && (!station.answer.fieldId.trim() || !station.answer.label.trim())) {
      throw new Error('Invalid answer field');
    }
    if (station.choice) {
      if (!station.choice.choiceId.trim() || !station.choice.label.trim() ||
          station.choice.options.length < 2 ||
          station.choice.options.some(opt => !opt.id.trim() || !opt.label.trim()) ||
          new Set(station.choice.options.map(opt => opt.id)).size !== station.choice.options.length) {
        throw new Error('Invalid choice field');
      }
    }
  }
}

/**
 * Owns one controller and its connection during mount/unmount.
 * Reuses the input DOM on state updates (including typing), so focus/caret survive.
 * Attaches precisely three delegated DOM handlers, once per mount, not per chapter.
 */
export class StationShell {
  private mounted = false;
  private abort: AbortController | null = null;
  private unsubscribe: (() => void) | null = null;
  private activeStation: string | null = null;
  private activeAttempt = 0;
  private mathSequence = 0;
  private mathNode: HTMLElement | null = null;
  private statusNode: HTMLElement | null = null;
  private contentNode: HTMLElement | null = null;
  private navNode: HTMLElement | null = null;
  private lastError = '';

  constructor(private readonly options: StationShellOptions) {
    if (!options.actorId.trim()) throw new Error('actorId is required');
    validateStations(options.stations);
  }

  mount(): void {
    if (this.mounted) return;
    const { root, controller } = this.options;
    const state = controller.start();
    if (!Object.hasOwn(state.participants, this.options.actorId)) {
      controller.stop();
      throw new Error('Actor is not in room');
    }
    this.mounted = true;
    const doc = root.ownerDocument;
    const main = doc.createElement('section');
    main.className = 'oge-shell';
    main.setAttribute('aria-label', 'Совместный урок');
    this.statusNode = doc.createElement('p');
    this.statusNode.className = 'oge-status';
    this.statusNode.setAttribute('role', 'status');
    this.statusNode.setAttribute('aria-live', 'polite');
    this.navNode = doc.createElement('nav');
    this.navNode.className = 'oge-nav';
    this.navNode.setAttribute('aria-label', 'Главы и станции');
    this.contentNode = doc.createElement('article');
    this.contentNode.className = 'oge-station';
    main.append(this.statusNode, this.navNode, this.contentNode);
    root.replaceChildren(main);
    this.abort = new AbortController();
    root.addEventListener('click', this.onClick, { signal: this.abort.signal });
    root.addEventListener('input', this.onInput, { signal: this.abort.signal });
    root.addEventListener('change', this.onChange, { signal: this.abort.signal });
    this.unsubscribe = controller.subscribe(next => this.render(next));
    this.render(state);
  }

  private readonly onClick = (event: MouseEvent): void => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest('button');
    if (!button || !this.options.root.contains(button) || button.disabled) return;
    if (button.dataset.action === 'reset') {
      this.handleResult(this.options.controller.reset());
    } else if (button.dataset.stationId !== undefined && button.dataset.chapterIndex !== undefined) {
      this.handleResult(this.options.controller.goTo(Number(button.dataset.chapterIndex), button.dataset.stationId));
    }
  };

  private readonly onInput = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.dataset.fieldId === undefined) return;
    this.handleResult(this.options.controller.setAnswer(target.dataset.fieldId, target.value));
  };

  private readonly onChange = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.type !== 'radio' ||
        target.dataset.choiceId === undefined || target.dataset.optionId === undefined || !target.checked) return;
    this.handleResult(this.options.controller.selectOption(target.dataset.choiceId, target.dataset.optionId));
  };

  private handleResult(result: ReturnType<NavigationController['setAnswer']>): void {
    if (result.accepted) {
      this.lastError = '';
    } else {
      this.lastError = `Действие не сохранено: ${result.reason}`;
      // Reconcile stale or unauthorized local editing against accepted state.
      this.render(this.options.controller.getState());
    }
    this.updateStatus(this.options.controller.getState());
  }

  private updateStatus(state: RoomState): void {
    if (!this.statusNode) return;
    const online = Object.values(state.participants).filter(p => p.connected).length;
    const text = `Подключено: ${online} · Попытка: ${state.attempt}` +
      (this.lastError ? ` · ${this.lastError}` : '');
    if (this.statusNode.textContent !== text) this.statusNode.textContent = text;
  }

  private render(state: RoomState): void {
    if (!this.mounted || !this.contentNode || !this.navNode) return;
    const actor = state.participants[this.options.actorId];
    if (!actor) return;
    const teacher = actor.role === 'teacher';
    this.updateStatus(state);
    const doc = this.options.root.ownerDocument;
    const nav = doc.createDocumentFragment();
    for (const station of this.options.stations) {
      const button = doc.createElement('button');
      button.type = 'button';
      button.textContent = `${station.chapterIndex}: ${station.title}`;
      button.dataset.chapterIndex = String(station.chapterIndex);
      button.dataset.stationId = station.stationId;
      button.disabled = !teacher;
      const current = stationKey(state.navigation.chapterIndex, state.navigation.stationId) ===
        stationKey(station.chapterIndex, station.stationId);
      if (current) button.setAttribute('aria-current', 'step');
      nav.append(button);
    }
    if (teacher) {
      const reset = doc.createElement('button');
      reset.type = 'button';
      reset.textContent = 'Начать заново';
      reset.dataset.action = 'reset';
      nav.append(reset);
    }
    // Nav is recreated for status/role only. Event delegation stays attached to root.
    this.navNode.replaceChildren(nav);
    const key = stationKey(state.navigation.chapterIndex, state.navigation.stationId);
    if (this.activeStation !== key || this.activeAttempt !== state.attempt) {
      this.activeStation = key;
      this.activeAttempt = state.attempt;
      this.renderStation(state);
    }
    this.updateFields(state);
  }

  private renderStation(state: RoomState): void {
    if (!this.contentNode) return;
    ++this.mathSequence;
    if (this.mathNode) this.options.math.clear(this.mathNode);
    this.mathNode = null;
    const doc = this.options.root.ownerDocument;
    const station = this.options.stations.find(s => stationKey(s.chapterIndex, s.stationId) === this.activeStation);
    if (!station) {
      const text = doc.createElement('p');
      text.textContent = `Станция ${state.navigation.chapterIndex}/${state.navigation.stationId} не найдена.`;
      this.contentNode.replaceChildren(text);
      return;
    }
    const fragment = doc.createDocumentFragment();
    const heading = doc.createElement('h2');
    heading.textContent = station.title;
    fragment.append(heading);
    const formula = doc.createElement('div');
    formula.className = 'oge-formula';
    formula.setAttribute('aria-label', 'Математическое условие');
    // textContent prevents user content from becoming executable markup.
    formula.textContent = `\\[${station.promptTex}\\]`;
    this.mathNode = formula;
    fragment.append(formula);
    if (station.answer) {
      const label = doc.createElement('label');
      label.className = 'oge-field';
      label.textContent = station.answer.label;
      const input = doc.createElement('input');
      input.type = 'text';
      input.autocomplete = 'off';
      input.spellcheck = false;
      input.dataset.fieldId = station.answer.fieldId;
      label.append(input);
      fragment.append(label);
    }
    if (station.choice) {
      const group = doc.createElement('fieldset');
      group.className = 'oge-choices';
      const legend = doc.createElement('legend');
      legend.textContent = station.choice.label;
      group.append(legend);
      for (const option of station.choice.options) {
        const label = doc.createElement('label');
        const input = doc.createElement('input');
        input.type = 'radio';
        input.name = `oge-${this.options.actorId}-${station.chapterIndex}-${station.stationId}-${station.choice.choiceId}`;
        input.value = option.id;
        input.dataset.choiceId = station.choice.choiceId;
        input.dataset.optionId = option.id;
        label.append(input, doc.createTextNode(option.label));
        group.append(label);
      }
      fragment.append(group);
    }
    this.contentNode.replaceChildren(fragment);
    const sequence = this.mathSequence;
    void this.options.math.typeset(formula).then(() => {
      if (this.mounted && this.mathSequence === sequence) formula.dataset.mathState = 'ready';
    }).catch(() => {
      if (this.mounted && this.mathSequence === sequence) {
        formula.dataset.mathState = 'unavailable';
        this.lastError = 'Не удалось отобразить формулу';
        this.updateStatus(this.options.controller.getState());
      }
    });
  }

  private updateFields(state: RoomState): void {
    if (!this.contentNode) return;
    for (const input of Array.from(this.contentNode.querySelectorAll<HTMLInputElement>('input[data-field-id]'))) {
      const saved = state.answers[this.options.actorId]?.[input.dataset.fieldId ?? ''] ?? '';
      if (input.value !== saved) input.value = saved;
    }
    for (const input of Array.from(this.contentNode.querySelectorAll<HTMLInputElement>('input[data-choice-id]'))) {
      const saved = state.choices[this.options.actorId]?.[input.dataset.choiceId ?? ''];
      input.checked = saved === input.dataset.optionId;
    }
  }

  unmount(): void {
    if (!this.mounted) return;
    this.mounted = false;
    ++this.mathSequence;
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.abort?.abort();
    this.abort = null;
    if (this.mathNode) this.options.math.clear(this.mathNode);
    this.mathNode = null;
    this.options.root.replaceChildren();
    this.options.controller.stop();
    this.activeStation = null;
    this.activeAttempt = 0;
    this.lastError = '';
    this.contentNode = this.navNode = this.statusNode = null;
  }
}
