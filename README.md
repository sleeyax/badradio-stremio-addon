# Bad Radio Stremio Addon

Simple Stremio addon that exposes the [badradio](https://badradio.nz) 24/7 live stream and displays the current track as the item title.

## Features

- One radio catalog entry that always shows the current track title
- Stream resource returns the live MP3 stream URL
- Meta resource supplies artwork and station info

## Install / Run Locally

```bash
npm install
npm run build
npm start
```

Then add the addon to Stremio via:

```
http://localhost:7000/manifest.json
```

## Endpoints (for manual testing)

- Manifest: `http://localhost:7000/manifest.json`
- Catalog: `http://localhost:7000/catalog/radio/badradio_catalog.json`
- Meta: `http://localhost:7000/meta/radio/badradio:station.json`
- Stream: `http://localhost:7000/stream/radio/badradio:station.json`

