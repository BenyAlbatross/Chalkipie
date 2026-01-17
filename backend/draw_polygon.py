import json
from PIL import Image, ImageDraw, ImageOps

# Test data
mask_data = [
    {
        "label": "door",
        "polygon": [
            {"x": 166, "y": 48},
            {"x": 814, "y": 48},
            {"x": 814, "y": 966},
            {"x": 166, "y": 966}
        ]
    }
]

# Load and correct image orientation
image = Image.open("../sample_door_photos/IMG_3104.jpeg")
image = ImageOps.exif_transpose(image)

# Convert to RGBA for transparency
annotated_image = image.convert("RGBA")

# Process mask
for item in mask_data:
    label = item.get("label", "unknown")
    polygon = item.get("polygon", [])
    
    # Create mask layer
    mask_layer = Image.new("L", image.size, 0)
    draw = ImageDraw.Draw(mask_layer)
    
    # Convert polygon to coordinate tuples
    coords = [(p["x"], p["y"]) for p in polygon]
    
    # Draw filled polygon
    draw.polygon(coords, fill=255)
    
    # Create colored overlay (semi-transparent cyan)
    color_layer = Image.new("RGBA", image.size, (0, 255, 255, 100))
    blank = Image.new("RGBA", image.size, (0, 0, 0, 0))
    mask_overlay = Image.composite(color_layer, blank, mask_layer)
    
    # Combine with original
    annotated_image = Image.alpha_composite(annotated_image, mask_overlay)
    print(f"Applied mask for: {label} with {len(coords)} vertices")

# Save output
annotated_image.save("polygon_output.png")
print("Saved to polygon_output.png")
