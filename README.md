# Candy Machine - Image Dataset Tagger.

![Candy Machine Logo](assets/logo-small.png)

A better image tagger for creating LORAs.

## Requirements:

- Python 3

## Free for Personal, Non-Commercial Use.

Free for personal, non-commercial use. If you're using it in a business context or
for commercial use (i.e. to make money from it), please contact me to arrange a license.
This helps support my development costs.

## Running Image Tagger on GPU

Requires CUDA 12.2 and cuDNN8.x.

```
[activate venv]
pip install onnxruntime-gpu --extra-index-url https://aiinfra.pkgs.visualstudio.com/PublicPackages/_packaging/onnxruntime-cuda-12/pypi/simple/
```

## How to Run on Windows

```powershell
cd candy-machine
run
```

## How to Run on MacOS/Unix

Note, I haven't tested this yet, there may be bugs.

```sh
cd candy-machine
chmod +x run.sh
./run.sh
```

## Known Issues

- Can't add more images to a project. (Workaround: create a new project.)
- Can't edit the trigger word / synonyms. (Workaround: edit the project's `config.json` and
  the caption files.)
- Can't edit a project's tag layout or the default tag layout (Workaround: edit `default_categories.json`
  in the server directory, or a project's `categories.json`. For the latter, be sure not to remove tags
  that are being actively used.)

## Feature Pipeline

- Delete tags
- Sort tags by usage, hide uncommon tags
- Edit trigger word / synonyms
- Add more images
- Image zoom / color name help
- Rename tags (across the project)
- Export wizard to prepare the data and generate the best settings for [Kohya SS](https://github.com/bmaltais/kohya_ss)
- Customize tag layout from import analysis
- Saved presets for tag layouts (i.e. photography, anime, style LORAs etc)
- Watermark removal (inpainting?)
- Detection and removal of [Nightshade-poisoned images](https://nightshade.cs.uchicago.edu/whatis.html#)

## Want to Contribute?

Here's the stack:

- Python server to do things like moving images, resizing etc - using virtual env.
- Parcel
- Flowbite React
- Tailwind CSS

Before spending time writing code, please open an issue with your proposal so we can discuss. Thanks!

### Setup:

```powershell
python -m venv venv
call .\venv\Scripts\activate
pip install -r requirements.txt
```

### Run the UI:

Prerequisites: Node and Yarn.

```powershell
yarn start
```

### Run Server:

```powershell
python server\main.py
```
