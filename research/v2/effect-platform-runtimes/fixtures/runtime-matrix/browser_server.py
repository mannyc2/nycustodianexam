from __future__ import annotations

import argparse
import http.server
import json
import pathlib
import socketserver
import threading
import time
from typing import Any


class ProbeHandler(http.server.SimpleHTTPRequestHandler):
    server_version = "R23ProbeServer/1.0"

    def __init__(self, *args: Any, directory: str, event_log: pathlib.Path, **kwargs: Any) -> None:
        self.event_log = event_log
        super().__init__(*args, directory=directory, **kwargs)

    def _log_event(self, payload: dict[str, Any]) -> None:
        payload = {"timestamp_ns": time.time_ns(), **payload}
        with self.event_log.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(payload, sort_keys=True) + "\n")

    def do_GET(self) -> None:  # noqa: N802
        if self.path == "/slow":
            self._log_event({"event": "slow_request_started", "client": self.client_address[0]})
            time.sleep(1.0)
            body = b"slow-response"
            try:
                self.send_response(200)
                self.send_header("content-type", "text/plain")
                self.send_header("content-length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
                self._log_event({"event": "slow_response_written"})
            except (BrokenPipeError, ConnectionResetError) as error:
                self._log_event({"event": "client_disconnect_observed", "error": type(error).__name__})
            return
        super().do_GET()

    def log_message(self, format: str, *args: Any) -> None:
        self._log_event({"event": "http_log", "message": format % args})


class ThreadingServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--directory", required=True)
    parser.add_argument("--event-log", required=True)
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()

    event_log = pathlib.Path(args.event_log)
    event_log.write_text("", encoding="utf-8")
    handler = lambda *h_args, **h_kwargs: ProbeHandler(
        *h_args,
        directory=args.directory,
        event_log=event_log,
        **h_kwargs,
    )
    server = ThreadingServer(("127.0.0.1", args.port), handler)
    print(json.dumps({"event": "server_ready", "port": args.port}), flush=True)
    try:
        server.serve_forever()
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
