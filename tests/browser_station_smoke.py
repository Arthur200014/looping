"""Chromium DOM smoke; in-memory participants in ONE browser, MathJax stub only.

Works in a sandbox where navigation to file:// and localhost:// is blocked:
compiled ESM sources are combined into one evaluation scope (imports/exports removed).
Normal module loading and the actual MathJax CDN are NOT checked by this test.
"""
from pathlib import Path
import re
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parent.parent
sources = [
    'dist/shared/core/RoomState.js', 'dist/shared/core/reducer.js',
    'dist/shared/sync/InMemoryTransport.js', 'dist/shared/core/NavigationController.js',
    'dist/shared/math/MathJaxRenderer.js', 'dist/shared/ui/StationShell.js',
    'tests/fixtures/stations.mjs', 'tests/fixtures/station-smoke.mjs',
]
code = []
for name in sources:
    text = (root / name).read_text()
    text = re.sub(r'^import\s+[^;]+;\s*$', '', text, flags=re.MULTILINE)
    code.append(re.sub(r'^export\s+', '', text, flags=re.MULTILINE))

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1280, 'height': 820})
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    css = (root / 'shared/ui/station-shell.css').read_text()
    page.set_content('<!doctype html><meta charset="utf-8"><style>' + css + '</style>'
        '<main style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr));gap:12px">'
        '<div id="teacher"></div><div id="student"></div></main>')
    page.evaluate('() => {' + '\n'.join(code) + '}')
    assert page.locator('#student h2').inner_text() == 'Введение'
    page.locator('#teacher button[data-chapter-index="1"]').click()
    assert page.locator('#student h2').inner_text() == 'Тренировка'
    page.locator('#teacher button[data-chapter-index="0"]').click()
    assert page.locator('#student h2').inner_text() == 'Введение'
    assert page.locator('#student button[data-chapter-index="1"]').is_disabled()
    answer = page.locator('#student input[data-field-id="answer"]')
    answer.fill('1/2')
    answer.press('End')
    answer.press('4')
    assert answer.input_value() == '1/24'
    assert answer.evaluate('(el) => document.activeElement === el')
    assert page.evaluate('__b21.hub.getSnapshot().answers.student.answer') == '1/24'
    page.locator('#student input[data-option-id="yes"]').check()
    page.locator('#teacher input[data-option-id="no"]').check()
    assert page.evaluate('__b21.hub.getSnapshot().choices.student.confidence') == 'yes'
    assert page.evaluate('__b21.hub.getSnapshot().choices.teacher.confidence') == 'no'
    assert page.locator('#student .oge-formula').get_attribute('data-math-state') == 'ready'
    assert page.evaluate('__b21.mathCalls.typeset >= 4')
    before = page.evaluate('__b21.hub.getSnapshot().revision')
    page.evaluate('''() => {for(let n=0;n<100;n++) { const r=__b21.teacherCtrl.goTo(n%2,n%2?'practice':'intro');
        if(!r.accepted)throw Error(r.reason); }}''')
    assert page.evaluate('__b21.hub.getSnapshot().revision') == before + 100
    assert page.evaluate('__b21.hub.getSubscriberCount()') == 2
    page.evaluate('__b21.teacherCtrl.goTo(0,"intro")')
    page.locator('#student input[data-field-id="answer"]').fill('7')
    previous = page.evaluate('__b21.hub.getSnapshot().revision')
    page.locator('#student input[data-field-id="answer"]').fill('8')
    assert page.evaluate('__b21.hub.getSnapshot().revision') == previous + 1
    page.locator('#teacher button[data-action="reset"]').click()
    assert page.evaluate('__b21.hub.getSnapshot().attempt') == 2
    assert page.locator('#student input[data-field-id="answer"]').input_value() == ''
    page.evaluate('__b21.studentShell.mount();__b21.studentShell.unmount()')
    assert page.evaluate('__b21.hub.getSubscriberCount()') == 1
    assert not page.evaluate('__b21.hub.getSnapshot().participants.student.connected')
    page.evaluate('__b21.studentShell.mount()')
    page.locator('#student input[data-field-id="answer"]').fill('again')
    assert page.evaluate('__b21.hub.getSnapshot().answers.student.answer') == 'again'
    page.evaluate('__b21.teacherShell.unmount();__b21.studentShell.unmount()')
    assert page.evaluate('__b21.hub.getSubscriberCount()') == 0
    assert page.evaluate('__b21.hub.getConnectedCount()') == 0
    page.set_viewport_size({'width': 375, 'height': 812})
    page.evaluate('__b21.teacherShell.mount();__b21.studentShell.mount()')
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    assert page.locator('#student input[data-field-id="answer"]').is_visible()
    assert errors == [], errors
    browser.close()
print('PASS Chromium: chapter 0/1, input focus, choices, mock MathJax, reset, 100 switches, remount, cleanup, 375px width; no JS pageerrors.')
print('NOT_VERIFIED: HTTP/ESM page loading, real MathJax CDN, two independent browser processes.')
