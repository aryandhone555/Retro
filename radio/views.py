import json
from pathlib import Path
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render


def home(request):
    return render(request, 'radio/index.html')


def songs(request):
    """Return the local playlist metadata. No external music API is used."""
    music_dir = Path(settings.BASE_DIR) / 'radio' / 'static' / 'music'
    metadata_file = music_dir / 'songs.json'

    if metadata_file.exists():
        try:
            data = json.loads(metadata_file.read_text(encoding='utf-8'))
            if data:
                return JsonResponse(data, safe=False)
        except (json.JSONDecodeError, OSError):
            pass

    tracks = []
    for file in sorted(music_dir.glob('*.mp3')):
        title = file.stem.replace('_', ' ').replace('-', ' ').strip()
        tracks.append({
            'title': title or 'Unknown Song',
            'artist': 'Unknown Artist',
            'year': '',
            'file': f'/static/music/{file.name}',
        })
    return JsonResponse(tracks, safe=False)
