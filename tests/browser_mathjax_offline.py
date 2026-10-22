"""Optional true MathJax engine rendering smoke without CDN or local HTTP navigation.

This is not B2.2 CDN/ESM verification. It consumes a preinstalled local MathJax
bundle via --bundle without copying any licensed fonts/bundle into the repository.
"""
from __future__ import annotations

import argparse
from pathlib import Path

from playwright.sync_api import sync_playwright


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--bundle', type=Path, required=True, help='Local MathJax tex-mml-chtml.js bundle')
    parser.add_argument('--version', required=True, help='Actual version to assert, e.g. 3.2.1')
    args = parser.parse_args()
    bundle = args.bundle.read_text(encoding='utf-8')
    with sync_playwright() as pw:
        browser = pw.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        page = browser.new_page(viewport={'width': 375, 'height': 812})
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.set_content('<!doctype html><html lang="ru"><div id="formula">\\[\\frac{1}{2}\\]</div></html>')
        page.evaluate('''() => {window.MathJax = {tex: {inlineMath: [['\\\\(', '\\\\)']], displayMath: [['\\\\[', '\\\\]']]}}}''')
        page.add_script_tag(content=bundle)
        page.wait_for_function('typeof window.MathJax?.typesetPromise === "function"', timeout=10000)
        version = page.evaluate('MathJax.version')
        assert version == args.version, f'Installed {version} does not match expected {args.version}'
        page.evaluate('''async () => {await MathJax.startup.promise; await MathJax.typesetPromise([document.getElementById('formula')]);}''')
        fraction = page.locator('#formula mjx-mfrac').first
        fraction.wait_for(timeout=6000)
        num = page.locator('#formula mjx-mfrac mjx-num').first.bounding_box()
        den = page.locator('#formula mjx-mfrac mjx-den').first.bounding_box()
        assert num and den and num['y'] < den['y'], f'Fraction is not stacked: {num}, {den}'
        assert not errors, f'Browser page errors: {errors}'
        print(f'PASS actual MathJax {version} (LOCAL, NOT CDN): typesetPromise, numerator above denominator, 375px Chromium')
        print('NOT_VERIFIED: required MathJax 3.2.2 CDN, real HTTP ESM imports')
        browser.close()


if __name__ == '__main__':
    main()
