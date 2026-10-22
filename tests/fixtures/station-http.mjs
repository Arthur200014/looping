/** B2.2 real-browser fixture: imports actual compiled ESM and the real MathJax CDN. */
import { createRoomState } from '../../dist/shared/core/RoomState.js';
import { InMemoryRoomHub } from '../../dist/shared/sync/InMemoryTransport.js';
import { NavigationController } from '../../dist/shared/core/NavigationController.js';
import { StationShell } from '../../dist/shared/ui/StationShell.js';
import { loadMathJax } from '../../dist/shared/math/MathJaxRenderer.js';
import { stations } from './stations.mjs';

const status = document.getElementById('fixture-status');
try {
  const math = await loadMathJax(document);
  // MathJax's initialization completes asynchronously; do not attach tests to a half-ready engine.
  if (window.MathJax?.startup?.promise) await window.MathJax.startup.promise;
  const hub = new InMemoryRoomHub(createRoomState({
    roomId: 'synthetic-room', sessionId: 'synthetic-session',
    roles: { teacher: 'teacher', student: 'student' },
  }));
  const teacherCtrl = new NavigationController(hub.createClient('teacher'));
  const studentCtrl = new NavigationController(hub.createClient('student'));
  const teacherShell = new StationShell({
    root: document.getElementById('teacher'), controller: teacherCtrl,
    actorId: 'teacher', stations, math,
  });
  const studentShell = new StationShell({
    root: document.getElementById('student'), controller: studentCtrl,
    actorId: 'student', stations, math,
  });
  teacherShell.mount();
  studentShell.mount();
  window.__b22 = { hub, math, teacherCtrl, studentCtrl, teacherShell, studentShell };
  status.textContent = 'Готово: реальные ES-модули и MathJax 3.2.2';
  status.dataset.state = 'ready';
} catch (error) {
  status.textContent = 'Ошибка загрузки MathJax или модулей: ' + String(error);
  status.dataset.state = 'error';
  window.__b22Error = String(error);
}
