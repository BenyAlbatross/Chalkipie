import json
from PIL import Image, ImageDraw, ImageOps

def apply_test_mask(image_path, mask_data_json):
    """
    Test script to apply a mask from raw JSON data to an image.
    
    Args:
        image_path: Path to the input image
        mask_data_json: JSON string or list containing mask data
    """
    # Load and correct image orientation
    image = Image.open(image_path)
    image = ImageOps.exif_transpose(image)
    
    # Parse JSON if it's a string
    if isinstance(mask_data_json, str):
        mask_data = json.loads(mask_data_json)
    else:
        mask_data = mask_data_json
    
    # Convert to RGBA for transparency
    annotated_image = image.convert("RGBA")
    
    # Process each mask in the data
    for item in mask_data:
        label = item.get("label", "unknown")
        mask_coords = item.get("mask", None)
        box = item.get("box_2d", [])
        
        mask_layer = None
        
        if mask_coords:
            # Create a mask layer
            mask_layer = Image.new("L", image.size, 0)
            draw = ImageDraw.Draw(mask_layer)
            
            # Handle different mask formats
            # Format 1: [x1, y1, x2, y2, ...] - flat array
            # Format 2: [[x1, y1], [x2, y2], ...] - array of coordinate pairs
            if isinstance(mask_coords, list):
                if len(mask_coords) > 0 and isinstance(mask_coords[0], list):
                    # Nested array format
                    if len(mask_coords[0]) > 2:
                        # [[x1, y1, x2, y2, ...]] - flat array wrapped in list
                        flat_coords = mask_coords[0]
                        pixel_coords = [(int(flat_coords[i]), int(flat_coords[i+1])) 
                                       for i in range(0, len(flat_coords) - 1, 2)]
                    else:
                        # [[x1, y1], [x2, y2], ...] - coordinate pairs
                        pixel_coords = [(int(x), int(y)) for x, y in mask_coords]
                else:
                    # [x1, y1, x2, y2, ...] - flat array
                    pixel_coords = [(int(mask_coords[i]), int(mask_coords[i+1])) 
                                   for i in range(0, len(mask_coords) - 1, 2)]
            
            # Draw filled polygon on mask
            draw.polygon(pixel_coords, fill=255)
            print(f"Applied polygon mask for: {label}")
            print(f"  Polygon vertices: {len(pixel_coords)}")
            
        elif box:
            # No mask provided, use box_2d as rectangular mask
            # box_2d format: [x_min, y_min, x_max, y_max]
            mask_layer = Image.new("L", image.size, 0)
            draw = ImageDraw.Draw(mask_layer)
            
            x_min, y_min, x_max, y_max = box
            # Draw filled rectangle
            draw.rectangle([x_min, y_min, x_max, y_max], fill=255)
            print(f"Applied bounding box mask for: {label}")
            print(f"  Box: [{x_min}, {y_min}, {x_max}, {y_max}]")
        
        if mask_layer:
            # Create a colored overlay (semi-transparent cyan)
            color_layer = Image.new("RGBA", image.size, (0, 255, 255, 100))
            
            # Apply the mask to the color layer
            blank = Image.new("RGBA", image.size, (0, 0, 0, 0))
            mask_overlay = Image.composite(color_layer, blank, mask_layer)
            
            # Combine with the original image
            annotated_image = Image.alpha_composite(annotated_image, mask_overlay)
    
    # Save output
    output_path = "test_mask_output.png"
    annotated_image.save(output_path)
    print(f"\nSaved output to {output_path}")
    return annotated_image

if __name__ == "__main__":
    # Test data provided by user
    test_mask_data = [
        {"box_2d": [48, 166, 966, 814], "label": "door"}
    ]
    
    # Apply the mask
    apply_test_mask("../sample_door_photos/IMG_3104.jpeg", test_mask_data)
