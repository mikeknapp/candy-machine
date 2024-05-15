### Candy Machine.

A better image tagger for creating LORAs.

## Requirements:

- Python 3

## Run Locally (Windows)

```sh
run
```

## Run Locally (MacOS/Unix)

```sh
chmod +x dev.sh
./dev.sh
```

## Licensing

### Personal Use

For personal use, this project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

### Commercial Use

A commercial license is required for commercial use. Please see [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md) for more details and contact @mikeknapp (Github) to inquire about commercial licensing terms.

## Feature List (Target Initial Release):

- Import directory: convert files to .jpg and copy files to working directory, rename to 0001.jpg etc.
- Global: Pre-built categories but you can modify them youself, including re-arranging the order, etc.
- Project: Select which categories to include, and which tags to add by default (i.e. photography).
- Project: Set min and max tags per category.
- Only show tags with > N uses, otherwise hide under a ... tag.
- Sort tags by frequency.
- Quick tag add box.
- Keyboard shortcuts.
- Crop image.
- Warning if image too small.
- % done
- Export wizard with .json of suggested settings for LORA.

Roadmap:

- Have saved presets (i.e. photography, anime, style LORAs etc)
- Watermark removal (inpainting via A1111?)

Technical Notes:

- Python server to do things like moving image, resizing etc - using virtual env.
- Parcel
- Flowbite React
- Tailwind CSS
