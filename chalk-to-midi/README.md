# Chalk to MIDI Converter

This Python utility converts an image of a chalk drawing (or any high-contrast line art) into a MIDI music file. It interprets the X-axis as time and the Y-axis as pitch.

## Setup

1.  Navigate to this folder:
    ```bash
    cd chalk-to-midi
    ```

2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

## Usage

Run the script providing the path to your image:

```bash
python main.py path/to/your/drawing.jpg my_music.mid
```

## How it works

1.  **Image Loading**: Loads the image and converts it to grayscale.
2.  **Edge Detection**: Uses Canny edge detection to identify the chalk lines.
3.  **Scanning**: Scans the image from left to right (pixel by pixel).
4.  **Mapping**:
    *   **Time**: Each pixel column represents a step in time.
    *   **Pitch**: The vertical position of a pixel determines the note pitch (Higher pixel = Higher pitch).
    *   **Duration**: Continuous horizontal lines create sustained notes.
5.  **Output**: Generates a standard `.mid` file that can be played in any media player or DAW.
