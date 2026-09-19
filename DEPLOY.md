# Deploying

The app is static. There is no build step on the server and nothing is fetched
from the internet at runtime.

## What must be uploaded

Every one of these, **with the folder structure intact**:

```
index.html
app.compiled.js
game-data.js
styles.css
.nojekyll                      <- easy to miss: dotfiles are hidden by default
vendor/react-18.2.0.min.js
vendor/react-dom-18.2.0.min.js
vendor/peerjs-1.5.4.min.js
assets/                        <- only if you use the bundled token art
```

`app.js`, `tests/`, `tools/`, `package.json` and the Markdown files are
development sources. They do no harm on the server and are not needed there.

## The failure this page exists to prevent

Dragging files onto GitHub's web uploader takes **files and skips folders**. The
repository then has every root file and no `vendor/` at all, the three script
tags 404, and the app stops at `React is not defined`.

Check it from the deployed site, not from your computer:

```
https://<your-site>/vendor/react-18.2.0.min.js
```

A 404 there means the folder is not on the server, whatever your local copy
looks like. Use `git add vendor/` and push, or drag the **folder** rather than
its contents.

## GitHub Pages specifically

Pages runs Jekyll, which does not publish `vendor/`. `.nojekyll` next to
`index.html` turns Jekyll off. It is in this repository already - make sure it
survives the upload, because most file browsers hide dotfiles.

Both faults produce the same message in the app, so rule out the missing folder
first: it is far more common.
