# Retro Radio 📻

A tiny recreational 24/7 web radio built with Django, plain JavaScript and real local MP3 files.

Live: [text](https://retro-rj73.onrender.com/)

## Features

- No login and no database required for the playlist.
- Local MP3 files only — no music API.
- Continuous playlist with automatic next-track playback.
- Large live clock and date.
- Minimal retro background that changes every hour.
- Bottom-center now-playing card with animated spinning record.
- Responsive layout for desktop and mobile.
- Ready for GitHub + Render deployment.

## Add your songs

Put MP3 files in:

`radio/static/music/`

For exact title/artist/year display, edit:

`radio/static/music/songs.json`

Example:

```json
[
  {
    "title": "Song Name",
    "artist": "Artist Name",
    "year": "2024",
    "file": "/static/music/song-name.mp3"
  }
]
```

If `songs.json` is empty, the app automatically finds `.mp3` files in the folder and uses the filename as the title.

## Run locally

```bash
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
python manage.py runserver
```

Open `http://127.0.0.1:8000/`.

The browser will ask for one click on **START RADIO** because modern browsers block autoplay with sound until the user interacts with the page. After that, the playlist moves from one MP3 to the next automatically.

## GitHub

```bash
git init
git add .
git commit -m "Initial Retro Radio"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

## Render

Create a new Web Service from the GitHub repo. Render can use the included `render.yaml`, or use:

- Build command: `pip install -r requirements.txt && python manage.py collectstatic --no-input`
- Start command: `gunicorn radio.wsgi:application`

### Important MP3 note

GitHub blocks individual files larger than 100 MB. Large music collections also make every deployment heavier. For a small personal project, keep the MP3 files reasonably sized. This project intentionally stores the music locally with the app rather than calling a music API.

## 24/7 behavior

The site can continuously play while the page is open. It does not require a server-side audio process: the browser is the radio player. A visitor must interact once to start audio because of browser autoplay rules.
