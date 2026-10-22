"""Real HTTP / ESM / CDN MathJax B2.2 E2E; fail loudly if browser networking is blocked.

Requires: npm run build, Python playwright and Chromium. Starts local HTTP server.
Unlike browser_station_smoke.py, this test never rewrites modules or injects MathJax.
"""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import sys
from concurrent.futures import ThreadPoolExecutor
from urllib.error import URLError
from urllib.request import urlopen

from playwright.sync_api import Error as BrowserError
from playwright.sync_api import TimeoutError as BrowserTimeout
from playwright.sync_api import sync_playwright

from serve_fixture import create_server


def verify_http_files(url: str) -> None:
    for path, expected in [
        ('tests/fixtures/station-http.html', 'text/html'),
        ('tests/fixtures/station-http.mjs', 'javascript'),
        ('tests/fixtures/stations.mjs', 'javascript'),
        ('dist/shared/ui/StationShell.js', 'javascript'),
        ('dist/shared/math/MathJaxRenderer.js', 'javascript'),
        ('shared/ui/station-shell.css', 'text/css'),
    ]:
        with urlopen(url + '/' + path, timeout=5) as response:
            actual = response.headers.get_content_type()
            if response.status != 200 or expected not in actual:
                raise AssertionError(f'{path}: HTTP {response.status} {actual}, wanted {expected}')
            if not response.read(64):
                raise AssertionError(f'{path}: empty response')
    print('PASS HTTP GET: 6 static assets, 200, correct MIME, nonempty', flush=True)


def run_browser(url: str) -> None:
    with sync_playwright() as pw:
        browser_binary = None if os.environ.get('B2_USE_PLAYWRIGHT_CHROMIUM') == '1' else os.environ.get('CHROMIUM_EXECUTABLE', '/usr/bin/chromium')
        browser = pw.chromium.launch(executable_path=browser_binary, args=['--no-sandbox'])
        page = browser.new_page(viewport={'width': 1280, 'height': 800})
        artifact_dir = Path(os.environ.get('B2_ARTIFACT_DIR', 'artifacts/browser'))
        artifact_dir.mkdir(parents=True, exist_ok=True)
        page.context.tracing.start(screenshots=True, snapshots=True, sources=True)
        errors: list[str] = []
        console_errors: list[str] = []
        responses: list[tuple[str, int]] = []
        request_failures: list[str] = []
        page.on('requestfailed', lambda request: request_failures.append(f'{request.url}: {request.failure}'))
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('console', lambda message: console_errors.append(message.text) if message.type == 'error' else None)
        page.on('response', lambda response: responses.append((response.url, response.status)))
        try:
            page.goto(url + '/tests/fixtures/station-http.html', wait_until='domcontentloaded', timeout=12000)
            page.wait_for_function("['ready','error'].includes(document.querySelector('#fixture-status')?.dataset.state)", timeout=20000)
            status = page.locator('#fixture-status')
            if status.get_attribute('data-state') == 'error':
                raise AssertionError(f'Fixture failed: {status.inner_text()}')
            page.locator('#student .oge-formula[data-math-state="ready"]').wait_for(timeout=12000)
            # Tests rendered CHTML structure, not the presence of unprocessed TeX text.
            fraction = page.locator('#student mjx-mfrac').first
            fraction.wait_for(timeout=6000)
            top = page.locator('#student mjx-mfrac mjx-num').first.bounding_box()
            bottom = page.locator('#student mjx-mfrac mjx-den').first.bounding_box()
            assert top is not None and bottom is not None and top['y'] < bottom['y'], 'MathJax fraction is not vertically stacked'
            assert page.evaluate("typeof window.MathJax?.typesetPromise") == 'function'
            assert page.evaluate('window.MathJax.version') == '3.2.2', 'Loaded MathJax version is not exactly 3.2.2'
            assert any('cdn.jsdelivr.net/npm/mathjax@3.2.2/' in address and status == 200 for address, status in responses), 'MathJax 3.2.2 was not fetched from CDN'
            print('PASS MathJax: real CDN request, typesetPromise, vertically stacked fraction', flush=True)

            page.locator('#teacher button[data-chapter-index="1"]').click()
            assert page.locator('#student h2').inner_text() == 'Тренировка'
            page.locator('#teacher button[data-chapter-index="0"]').click()
            assert page.locator('#student h2').inner_text() == 'Введение'
            student_input = page.locator('#student input[data-field-id="answer"]')
            student_input.fill('1/2')
            student_input.press('End')
            student_input.press('3')
            assert student_input.input_value() == '1/23'
            assert student_input.evaluate('(el) => document.activeElement === el'), 'Input lost focus'
            assert page.evaluate("__b22.hub.getSnapshot().answers.student.answer") == '1/23'
            page.locator('#teacher button[data-action="reset"]').click()
            assert page.evaluate('__b22.hub.getSnapshot().attempt') == 2
            assert page.locator('#student input[data-field-id="answer"]').input_value() == ''
            assert page.evaluate('__b22.hub.getSubscriberCount()') == 2
            page.evaluate('__b22.teacherShell.unmount(); __b22.studentShell.unmount()')
            assert page.evaluate('__b22.hub.getSubscriberCount()') == 0
            assert page.evaluate('__b22.hub.getConnectedCount()') == 0
            print('PASS navigation/focus/reset/cleanup via HTTP ESM', flush=True)

            page.set_viewport_size({'width': 375, 'height': 812})
            page.evaluate('__b22.teacherShell.mount(); __b22.studentShell.mount()')
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            assert page.locator('#student input[data-field-id="answer"]').is_visible()
            assert not errors, f'Uncaught browser errors: {errors}'
            assert not console_errors, f'Console errors: {console_errors}'
            print('PASS viewport 375px (emulated), browser pageerror and console error lists empty', flush=True)
        except (BrowserError, BrowserTimeout) as exc:
            raise RuntimeError(f'Browser HTTP / MathJax check BLOCKED/FAIL: {exc}') from exc
        finally:
            # Evidence is captured on both success and failure. A blank/blocked page is NOT a successful test.
            try:
                page.screenshot(path=str(artifact_dir / 'page.png'), full_page=True, timeout=5000)
            except Exception as exc:
                print(f'Screenshot unavailable: {exc}', flush=True)
            try:
                page.context.tracing.stop(path=str(artifact_dir / 'trace.zip'))
            except Exception as exc:
                print(f'Browser trace unavailable: {exc}', flush=True)
            try:
                mathjax_version = page.evaluate('window.MathJax?.version ?? null') if not page.is_closed() else None
            except BrowserError:
                mathjax_version = None
            (artifact_dir / 'browser-events.json').write_text(json.dumps({
                'pageerrors': errors, 'console_errors': console_errors,
                'request_failures': request_failures,
                'responses': responses,
                'mathjax_version': mathjax_version,
            }, indent=2), encoding='utf-8')
            print(f'Browser pageerrors: {errors}; console errors: {console_errors}; request failures: {request_failures}', flush=True)
            browser.close()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--assets-only", action="store_true", help="Check real HTTP GET/MIME without asserting browser/CDN access")
    args = parser.parse_args()
    # Port zero finds a free test-only local port; never connects to production.
    with create_server(0) as server:
        base = f'http://127.0.0.1:{server.server_port}'
        print('Fixture:', base + '/tests/fixtures/station-http.html', flush=True)
        with ThreadPoolExecutor(max_workers=1) as executor:
            running = executor.submit(server.serve_forever, poll_interval=0.1)
            try:
                verify_http_files(base)
                if not args.assets_only:
                    run_browser(base)
            finally:
                server.shutdown()
                running.result(timeout=5)
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (AssertionError, RuntimeError, URLError) as exc:
        print(f'NOT_VERIFIED: {exc}', file=sys.stderr, flush=True)
        sys.exit(2)
