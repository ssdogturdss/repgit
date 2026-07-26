#!/usr/bin/env python3
"""Dependency-free local static server for the LaunchPilot demo."""

from __future__ import annotations

import argparse
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent


class LaunchPilotHandler(SimpleHTTPRequestHandler):
    """Serve local app files with development-safe headers and SPA fallback."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "SAMEORIGIN")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Content-Security-Policy", "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'self'")
        super().end_headers()

    def do_GET(self):
        # The UI uses hash routing. Still return the app shell for route-like paths.
        path = urlparse(self.path).path
        if path != "/" and not Path(self.translate_path(path)).exists() and "." not in Path(path).name:
            self.path = "/index.html"
        return super().do_GET()

    def log_message(self, fmt, *args):
        print("[LaunchPilot] " + fmt % args)


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve the LaunchPilot local demo.")
    parser.add_argument("--host", default="127.0.0.1", help="Loopback host to bind (default: 127.0.0.1)")
    parser.add_argument("--port", type=int, default=3000, help="Port to bind (default: 3000)")
    args = parser.parse_args()

    if not 1 <= args.port <= 65535:
        parser.error("--port must be between 1 and 65535")

    os.chdir(ROOT)
    server = ThreadingHTTPServer((args.host, args.port), LaunchPilotHandler)
    print(f"[LaunchPilot] Serving {ROOT} at http://{args.host}:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
