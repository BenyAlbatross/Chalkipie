import os
import json
import base64
import numpy as np
from PIL import Image, ImageDraw, ImageOps
from io import BytesIO
from dotenv import load_dotenv
from google import genai
from google.genai import types

# 1. Setup
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=API_KEY)

def segment_door(image_path):
    # Load image and correct orientation based on EXIF data
    image = Image.open(image_path)
    image = ImageOps.exif_transpose(image)  # Fix rotation based on EXIF orientation
    
    # 2. Define the exact Prompt for Segmentation
    # This specific phrasing triggers the segmentation capability in Gemini 2.5/3.0
    prompt = """
    Give the segmentation mask for the apple in the image. 
    Output a JSON of the segmentation mask where the entry contains the 2D bounding box in the key "box_2d", 
    the segmentation mask in key "mask", and the text label in the key "label". 
    Use descriptive labels.
    """

    print("Sending request to Gemini 3 Flash...")
    
    # 3. Call the API
    response = client.models.generate_content(
        model="gemini-3-flash-preview", # Or 'gemini-2.5-flash' if 3.0 is in preview
        contents=[image, prompt],
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        )
    )

    # 4. Parse Response
    try:
        # Gemini returns a JSON string, sometimes wrapped in markdown code blocks
        json_text = response.text.strip()
        if json_text.startswith("```json"):
            json_text = json_text[7:-3].strip()
        
        results = json.loads(json_text)
        print(f"Detected {len(results)} object(s).")
        
        # 5. Overlay Masks
        overlay_mask(image, results)
        
    except Exception as e:
        print(f"Error parsing response: {e}")
        print("Raw response:", response.text)

def overlay_mask(original_image, json_results):
    # Convert original to RGBA to allow transparency
    annotated_image = original_image.convert("RGBA")
    
    for item in json_results:
        label = item.get("label", "unknown")
        mask_coords = item.get("mask", None)
        box = item.get("box_2d", []) # [y_min, x_min, y_max, x_max] (Normalized 0-1000)

        if mask_coords:
            # Create a mask layer
            mask_layer = Image.new("L", original_image.size, 0)
            draw = ImageDraw.Draw(mask_layer)
            
            # Handle different mask formats
            # Format 1: [[x1, y1, x2, y2, ...]] - flat array wrapped in list
            # Format 2: [[x1, y1], [x2, y2], ...] - array of coordinate pairs
            if mask_coords and isinstance(mask_coords[0], list) and len(mask_coords[0]) > 2:
                # Flat array format - convert to coordinate pairs
                flat_coords = mask_coords[0]
                pixel_coords = [(int(flat_coords[i]), int(flat_coords[i+1])) 
                               for i in range(0, len(flat_coords), 2)]
            else:
                # Already in coordinate pairs format
                pixel_coords = [(int(x), int(y)) for x, y in mask_coords]
            
            # Draw filled polygon on mask
            draw.polygon(pixel_coords, fill=255)
            
            # Create a colored overlay (e.g., Semi-transparent Cyan)
            color_layer = Image.new("RGBA", original_image.size, (0, 255, 255, 100)) # Cyan, 100/255 alpha
            
            # Apply the mask to the color layer 
            blank = Image.new("RGBA", original_image.size, (0,0,0,0))
            mask_overlay = Image.composite(color_layer, blank, mask_layer)
            
            # Combine
            annotated_image = Image.alpha_composite(annotated_image, mask_overlay)
            print(f"Applied mask for: {label}")

    # Save output
    annotated_image.save("door_segmented.png")
    print("Saved output to door_segmented.png")

if __name__ == "__main__":
    segment_door("../apple.png")