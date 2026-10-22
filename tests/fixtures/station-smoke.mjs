import { createRoomState } from '../../dist/shared/core/RoomState.js';
import { InMemoryRoomHub } from '../../dist/shared/sync/InMemoryTransport.js';
import { NavigationController } from '../../dist/shared/core/NavigationController.js';
import { StationShell } from '../../dist/shared/ui/StationShell.js';
import { createMathJaxRenderer } from '../../dist/shared/math/MathJaxRenderer.js';
import { stations } from './stations.mjs';
const hub = new InMemoryRoomHub(createRoomState({roomId:'fixture-room',sessionId:'fixture-session',roles:{teacher:'teacher',student:'student'}}));
const mathCalls = {typeset:0,clear:0};
const engine = {
  typesetPromise: async elements => {mathCalls.typeset += 1; for(const e of elements){e.dataset.stubTypeset='true';}},
  typesetClear: () => {mathCalls.clear += 1;},
};
const math = createMathJaxRenderer(engine);
const teacherCtrl = new NavigationController(hub.createClient('teacher'));
const studentCtrl = new NavigationController(hub.createClient('student'));
const teacherShell = new StationShell({root:document.getElementById('teacher'),controller:teacherCtrl,actorId:'teacher',stations,math});
const studentShell = new StationShell({root:document.getElementById('student'),controller:studentCtrl,actorId:'student',stations,math});
teacherShell.mount();studentShell.mount();
window.__b21 = {hub,mathCalls,teacherCtrl,studentCtrl,teacherShell,studentShell};
