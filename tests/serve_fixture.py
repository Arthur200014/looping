"""Serve the repository root with JavaScript MIME types for real browser ESM tests."""
from __future__ import annotations

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


class FixtureHandler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map,
                      '.js': 'text/javascript', '.mjs': 'text/javascript',
                      '.css': 'text/css', '.html': 'text/html'}


def create_server(port: int = 8765, host: str = '127.0.0.1') -> ThreadingHTTPServer:
    return ThreadingHTTPServer((host, port), partial(FixtureHandler, directory=str(ROOT)))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8765)
    parser.add_argument('--host', default='127.0.0.1')
    args = parser.parse_args()
    with create_server(args.port, args.host) as server:
        print(f'Serving {ROOT} at http://{args.host}:{server.server_port}/tests/fixtures/station-http.html', flush=True)
        server.serve_forever()
