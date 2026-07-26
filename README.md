# LaunchPilot

LaunchPilot is a local iOS delivery-planning demo. It helps identify the human-operated work needed for TestFlight, but it cannot autonomously submit an app to Apple.

> **Important:** This demo never compiles source code, stores credentials, signs an app, contacts Apple, or uploads a build. Any `TESTFLIGHT_READY` status is simulated local data only.

## Run locally

Requirements: Bash and Python 3.9+.

```bash
chmod +x run.sh
./run.sh
```

Open `http://127.0.0.1:3000` if a browser does not open automatically. Stop the server with `Ctrl+C`.

Optional environment variables:

```bash
PORT=4000 ./run.sh
NO_BROWSER=true ./run.sh
```

## Why did `run` show `❌ exit status 1`?

`exit status 1` means the launcher failed before it could run normally. It is a generic failure code; the important detail is the terminal line immediately above it.

The launcher now prints a specific explanation for these common causes:

| Terminal message | Cause | Fix |
| --- | --- | --- |
| `python3 was not found on PATH` | Python 3 is not installed or not discoverable. | Install Python 3.9+ and retry. Confirm with `python3 --version`. |
| `LaunchPilot must be launched with Bash` | The file was run using `sh run.sh` or a non-Bash shell. | Use `chmod +x run.sh && ./run.sh`. |
| `PORT must be a number between 1 and 65535` | The `PORT` environment value is invalid. | Use a valid port, for example `PORT=4000 ./run.sh`. |
| `127.0.0.1:3000 is unavailable or already in use` | Another process already owns the selected port. | Stop that process or use `PORT=4000 ./run.sh`. |
| `the local server failed to start` | Python started but `server.py` exited. | Read the indented **Server output** printed directly after the error; it is the root cause. |

### Quick diagnostics

```bash
# Confirm Bash and Python
bash --version
python3 --version

# Start without trying to open a browser
NO_BROWSER=true ./run.sh

# Avoid a port conflict
PORT=4000 NO_BROWSER=true ./run.sh
```

Do not use `sh run.sh`; `run.sh` uses Bash features intentionally.

## Get real testers onto TestFlight

Use the **TestFlight** tab to select a project, review readiness, and copy its checklist. For an actual release:

1. Join the [Apple Developer Program](https://developer.apple.com/programs/) and ensure you have an App Store Connect role that permits uploads and TestFlight management.
2. In App Store Connect, create or verify the app record, Bundle ID, and required metadata.
3. On macOS, create an archive using Xcode or trusted macOS CI with the correct signing team, certificate, provisioning, version, and build number.
4. Complete privacy, export-compliance, and app-information fields.
5. Upload through Xcode Organizer, Transporter, or approved CI delivery tooling.
6. Wait for Apple processing.
7. Add internal testers, or create an external tester group and complete Beta App Review if Apple requires it.
8. Send the TestFlight invitation after the build is available.

Open [App Store Connect](https://appstoreconnect.apple.com/) only when ready to authenticate with your own Apple account and perform those actions.

## Demo workflow

1. Open **Projects** and select **Orbit Commerce**.
2. Approve its build plan and start a local simulated build.
3. Open **TestFlight** for a project-specific production handoff checklist.
4. Complete actual Apple steps in your own approved tooling.
5. Reset browser-local demo state in **Settings** when needed.

All demo state remains in browser `localStorage`; no information leaves your machine from this application.

## Architecture

- `run.sh` preflights Bash, Python, host/port configuration, and port availability, then prints server diagnostics on failure.
- `server.py` is a Python standard-library static server bound to loopback by default.
- `index.html`, `styles.css`, and `app.js` form a dependency-free single-page application.

See [SPEC.md](SPEC.md) for the complete implementation contract.
