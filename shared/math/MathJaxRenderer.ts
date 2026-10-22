/** Only this adapter knows about MathJax's browser global and CDN. */
export interface MathRenderer {
  typeset(element: Element): Promise<void>;
  clear(element: Element): void;
}

export interface MathJaxEngine {
  typesetPromise(elements: Element[]): Promise<unknown>;
  typesetClear?(elements: Element[]): void;
}

type MathJaxGlobal = MathJaxEngine | {
  tex?: { inlineMath: string[][]; displayMath: string[][] };
  options?: { skipHtmlTags: string[] };
};
type MathJaxWindow = Window & { MathJax?: MathJaxGlobal };

export function createMathJaxRenderer(engine: MathJaxEngine): MathRenderer {
  return {
    async typeset(element: Element): Promise<void> {
      await engine.typesetPromise([element]);
    },
    clear(element: Element): void {
      engine.typesetClear?.([element]);
    },
  };
}

const pendingLoads = new WeakMap<Document, Promise<MathRenderer>>();
const DEFAULT_SRC = 'https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-mml-chtml.js';

/**
 * Loads the official MathJax 3 browser bundle once per document.
 * The external script needs network access and a CSP that permits it.
 * A failed load is not cached: another call may retry.
 */
export function loadMathJax(doc: Document = document, src: string = DEFAULT_SRC): Promise<MathRenderer> {
  const win = doc.defaultView as MathJaxWindow | null;
  if (!win) return Promise.reject(new Error('MathJax requires a window document'));
  const windowObject = win;
  const loaded = windowObject.MathJax;
  if (loaded && typeof (loaded as MathJaxEngine).typesetPromise === 'function') {
    return Promise.resolve(createMathJaxRenderer(loaded as MathJaxEngine));
  }
  const cached = pendingLoads.get(doc);
  if (cached) return cached;
  // Configure before inserting the bundle. No scripts or HTML come from station content.
  windowObject.MathJax = {
    tex: { inlineMath: [['\\(', '\\)']], displayMath: [['\\[', '\\]']] },
    options: { skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'] },
  };
  const promise = new Promise<MathRenderer>((resolve, reject) => {
    const script = doc.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.ogeMathjax = 'true';
    script.onload = () => {
      const engine = windowObject.MathJax;
      if (engine && typeof (engine as MathJaxEngine).typesetPromise === 'function') {
        resolve(createMathJaxRenderer(engine as MathJaxEngine));
      } else {
        reject(new Error('MathJax loaded without typesetPromise'));
      }
    };
    script.onerror = () => reject(new Error('Could not load MathJax'));
    (doc.head ?? doc.documentElement).append(script);
    // On failure allow a future retry and avoid leaving a failed script behind.
    promiseCatchSafely(script);
    function promiseCatchSafely(el: HTMLScriptElement): void {
      el.addEventListener('error', () => {
        el.remove();
        windowObject.MathJax = undefined;
      }, { once: true });
    }
  }).catch(error => {
    pendingLoads.delete(doc);
    throw error;
  });
  pendingLoads.set(doc, promise);
  return promise;
}
