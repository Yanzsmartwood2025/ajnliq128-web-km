# Character image assets

Assets for Aria and Joziel are grouped by use:

- `aria/cards/` and `joziel/cards/`: named program artwork, mapped in `manifest.json`.
- `aria/carousel/` and `joziel/carousel/`: background scenes, listed in playback order in `manifest.json`.
- `aria/social/` and `joziel/social/`: character-specific social network icons, stored as transparent PNGs at 512 × 512.

The social icon filenames use the platform name. Aria's set uses the neon style; Joziel's set uses the blue-flame style. These files are image assets and do not change the card or carousel UI.

Existing card and carousel files use the `.jpg` extension to match their actual JPEG encoding. The uploaded image bytes were retained unchanged, with no resizing or recompression. The repeated Aria source `01-1000239391.png` was identical to `10-1000239391.png` and is included once.
