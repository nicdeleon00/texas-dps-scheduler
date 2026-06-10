# Texas DPS Scheduler

Automatically finds and books Texas DPS (driver license office) appointments that match your criteria — location, date range, time of day — and rebooks if it finds something better.

This is a personal copy of [phamleduy04/texas-dps-scheduler](https://github.com/phamleduy04/texas-dps-scheduler) (v5.3.2, MIT licensed) with fixes so it runs on macOS, including Intel Macs. All credit for the scheduler itself goes to the original author.

![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux-blue)
![Node](https://img.shields.io/badge/node-%E2%89%A518-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

## How it works

1. Gets an auth token from the DPS scheduler site (by default, by opening a real Chrome window and auto-filling your info).
2. Polls the DPS API for appointment slots near your zip codes, on your preferred days, within your date and time windows.
3. When a matching slot appears, it holds and books it instantly, then prints (and optionally pushes) your confirmation link.

It books appointments **for you, with your information** — the same thing you'd do by hand on [txdpsscheduler.com](https://www.txdpsscheduler.com), just faster.

## Requirements

- **Node.js 18+** (tested on Node 26)
- **macOS** (Intel or Apple Silicon) or Linux
- **Google Chrome** — on Intel Macs the bot drives your installed Chrome. On Apple Silicon it downloads its own Chromium automatically.

## Quick start

```bash
git clone <your-repo-url>
cd texas-dps-scheduler
npm install          # installs deps + browser (skips browser if Chrome already present)
cp example.config.yml config.yml
# edit config.yml with your info (see below)
npm start
```

On first run a Chrome window opens, fills in your details, and grabs an auth token. After that the bot polls in the terminal until it books a slot. Press `Ctrl+C` to stop it at any time.

## Configuration

Copy `example.config.yml` to `config.yml` (the name matters — the app looks for `config.yml` exactly). The example file documents every option; these are the ones that matter most:

### Personal info

```yaml
personalInfo:
  firstName: 'John'
  lastName: 'Doe'
  dob: '01/01/2001'        # MM/DD/YYYY
  email: 'you@example.com' # confirmation goes here — use a real one
  lastFourSSN: '1234'
  phoneNumber: ''          # optional, digits only, for SMS notifications
  cardNumber: ''           # your DL number — only needed for renewals
  typeId: 71               # service type; 71 = new driver license
```

Other service types (renewals, CDL, etc.) are listed in the [TypeId wiki page](https://github.com/phamleduy04/texas-dps-scheduler/wiki/TypeId-list).

Prefer not to keep personal info in the YAML file? Set `loadFromEnv: true` and put the values in a `.env` file instead (see `example.env`). Both `config.yml` and `.env` are gitignored — **never commit either one.**

### Location and timing

```yaml
location:
  zipCode: ['75067', '75080'] # search near these zips
  miles: 15                   # max distance from your zip
  pickDPSLocation: false      # true = pick offices interactively on first run
  preferredDays: ['Monday']   # or [''] for any day
  sameDay: false              # true = only hunt same-day slots
  daysAround:
    startDate: null           # MM/DD/YYYY, blank = today
    start: 0                  # earliest day offset from startDate
    end: 7                    # latest day offset
  timesAround:
    start: 6                  # earliest hour (24h)
    end: 18                   # latest hour
  specificDates: ['']         # or exact dates like ['06/15/2026']
```

### App settings

```yaml
appSettings:
  cancelIfExist: false  # true = cancel your existing booking when a better slot is found
  interval: 10000       # ms between polling rounds
  captcha:
    strategy: 'browser' # browser | solver | manual (see below)
  pushNotification:
    enabled: false      # ntfy.sh push notifications on booking
```

**Captcha strategies:**

| Strategy | What it does |
|----------|-------------|
| `browser` (default) | Opens a visible Chrome window and gets the token automatically. Easiest — no account needed. |
| `solver` | Uses a paid captcha-solving API (Capsolver/2Captcha key required). For headless servers. |
| `manual` | Prompts you to paste a token yourself. |

## Day-to-day usage

- **Start:** `npm start` from the project directory.
- **Stop:** `Ctrl+C`.
- **Change DPS office selection:** if you used `pickDPSLocation`, delete the `cache/` folder to be re-prompted.
- **Stale auth token:** the token is cached in `cache/token.tmp`. If you get repeated `401` errors, delete the `cache/` folder and restart.
- **Existing appointment:** the bot detects it and warns you. It only cancels it when `cancelIfExist: true` and it has found a replacement slot.

When a slot is booked you'll see the confirmation number and a link like `https://www.txdpsscheduler.com/?b=<confirmation>` to print your appointment.

## macOS notes (what's different in this copy)

The upstream `npm install` breaks on macOS, in two ways:

1. **Patchright demands sudo** to install the branded Chrome channel, which fails in non-interactive shells (and `--with-deps` is Linux-only anyway).
2. **Google's Chrome download URL now redirects**, and patchright's bundled install script uses `curl` without `-L`, so it downloads a 138-byte redirect page and tries to mount it as a disk image.

This copy replaces the postinstall one-liner with [`scripts/install-browser.js`](scripts/install-browser.js):

- **macOS + Intel:** uses your system Google Chrome (`/Applications/Google Chrome.app`). If Chrome is missing, it tells you to install it from [google.com/chrome](https://www.google.com/chrome/) instead of failing cryptically.
- **macOS + Apple Silicon:** downloads patchright's Chromium (no sudo needed).
- **Linux/Windows:** unchanged upstream behavior.

The upstream GitHub Actions workflows (Docker image publishing, SonarQube) were removed since they're tied to the original repo's secrets and registry.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Not found config.yml file` | The file must be named `config.yml` (not `config.yaml`) and you must run `npm start` from the project root. |
| `Config file is not valid` + zod errors | Compare your file against `example.config.yml`; the error lists the exact field. |
| Repeated `401` / token expired | Delete `cache/` and restart. |
| `403` rate limited | Normal — the bot backs off and retries. Consider raising `interval`. |
| Chrome window opens but stalls | The DPS site changed or the captcha score was too low; the bot retries up to 10 times. Just let it run. |
| `Google Chrome not found` during install | Install Chrome, then re-run `npm install`. |

## A note on fair use

This automates a public booking flow with your own identity, one appointment at a time. Don't run multiple instances, don't book slots you won't use, and keep the polling interval reasonable. From the original author: *"Just don't abuse it :)"*

## Credits & license

- Original project: [phamleduy04/texas-dps-scheduler](https://github.com/phamleduy04/texas-dps-scheduler) — MIT
- This copy keeps the original [LICENSE](LICENSE) and adds macOS install fixes.
