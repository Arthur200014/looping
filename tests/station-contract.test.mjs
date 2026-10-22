import {test} from 'node:test';
import assert from 'node:assert/strict';
import { validateStations } from '../dist/shared/ui/StationShell.js';
import { createMathJaxRenderer, loadMathJax } from '../dist/shared/math/MathJaxRenderer.js';
import { stations } from './fixtures/stations.mjs';

test('fixture manifest validates and rejects duplicate location, invalid field and invalid choices', () => {
  assert.doesNotThrow(() => validateStations(stations));
  assert.throws(() => validateStations([]), /At least one/);
  assert.throws(() => validateStations([stations[0], stations[0]]), /Duplicate station/);
  assert.throws(() => validateStations([{...stations[0],chapterIndex:-1}]), /Invalid station/);
  assert.throws(() => validateStations([{...stations[0],answer:{fieldId:'',label:'Answer'}}]), /Invalid answer/);
  assert.throws(() => validateStations([{...stations[0],choice:{choiceId:'c',label:'Choose',options:[{id:'a',label:'A'},{id:'a',label:'B'}]}}]), /Invalid choice/);
});

test('MathJax adapter delegates typeset/clear to supplied engine (no network)', async () => {
  const element={};const calls=[];
  const renderer=createMathJaxRenderer({typesetPromise: async els => {calls.push(['render',els]);},typesetClear:els=>{calls.push(['clear',els]);}});
  await renderer.typeset(element);renderer.clear(element);
  assert.deepEqual(calls,[['render',[element]],['clear',[element]]]);
});

test('MathJax loader rejects a non-window document deterministically', async () => {
  await assert.rejects(loadMathJax({defaultView:null}), /requires a window/);
});
