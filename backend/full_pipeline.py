import base64
import json
import io
import cv2
import numpy as np
from PIL import Image

def solve_door_extraction(image_path, json_data):
    # --- 1. Load Image ---
    # Load original image
    original_img = cv2.imread(image_path)
    if original_img is None:
        raise ValueError("Could not load image. Check the path.")
    
    img_h, img_w = original_img.shape[:2]

    # --- 2. Reconstruct Full-Size Mask from JSON ---
    item = json_data[0]
    box = item['box_2d'] # [x_min, y_min, x_max, y_max]
    
    # Check bounds (User provided: 238, 107, 770, 922)
    # Assuming Pascal VOC format [xmin, ymin, xmax, ymax]
    x1, y1, x2, y2 = box
    box_w = x2 - x1
    box_h = y2 - y1
    
    # Decode Base64 Mask
    # Strip data URI prefix if present (e.g., "data:image/png;base64,")
    mask_data = item['mask']
    if mask_data.startswith('data:'):
        # Extract only the base64 part after the comma
        mask_data = mask_data.split(',', 1)[1]
    
    mask_bytes = base64.b64decode(mask_data)
    mask_pil = Image.open(io.BytesIO(mask_bytes))
    
    # Resize mask to fit the bounding box using Nearest Neighbor to keep edges sharp
    mask_pil = mask_pil.resize((box_w, box_h), resample=Image.NEAREST)
    mask_crop = np.array(mask_pil)

    # Place crop into full-size empty mask
    full_mask = np.zeros((img_h, img_w), dtype=np.uint8)
    
    # Ensure dimensions match (handle edge cases where box might exceed image)
    # (Simple clipping for safety)
    safe_x2 = min(x1 + mask_crop.shape[1], img_w)
    safe_y2 = min(y1 + mask_crop.shape[0], img_h)
    crop_h = safe_y2 - y1
    crop_w = safe_x2 - x1
    
    full_mask[y1:safe_y2, x1:safe_x2] = mask_crop[:crop_h, :crop_w]

    # --- 3. Virtual Corner Approximation (The "Math" Step) ---
    # Find all white pixels (the door)
    y_idxs, x_idxs = np.nonzero(full_mask)
    points = np.column_stack((x_idxs, y_idxs))

    # Calculate Centroid
    center_x, center_y = np.mean(points, axis=0)
    
    # Calculate Angles for Bucketing
    angles = np.arctan2(points[:, 1] - center_y, points[:, 0] - center_x) * 180 / np.pi
    
    # Bucket points into Top/Bottom/Left/Right
    # Top: -135 to -45 | Bottom: 45 to 135 | Right: -45 to 45 | Left: >135 or <-135
    top_pts = points[(angles > -135) & (angles < -45)]
    bot_pts = points[(angles > 45) & (angles < 135)]
    right_pts = points[np.abs(angles) <= 45]
    left_pts = points[np.abs(angles) >= 135]

    def fit_line(pts, is_vertical=False):
        if len(pts) < 10: return None # Safety check
        if is_vertical:
            # x = m*y + c
            m, c = np.polyfit(pts[:, 1], pts[:, 0], 1)
            return (m, c)
        else:
            # y = m*x + c
            m, c = np.polyfit(pts[:, 0], pts[:, 1], 1)
            return (m, c)

    line_top = fit_line(top_pts)
    line_bot = fit_line(bot_pts)
    line_left = fit_line(left_pts, is_vertical=True)
    line_right = fit_line(right_pts, is_vertical=True)

    # Intersection Solver
    def intersect(h_line, v_line):
        # h: y = m1*x + c1
        # v: x = m2*y + c2
        m1, c1 = h_line
        m2, c2 = v_line
        y = (m1 * c2 + c1) / (1 - m1 * m2)
        x = m2 * y + c2
        return [x, y]

    tl = intersect(line_top, line_left)
    tr = intersect(line_top, line_right)
    br = intersect(line_bot, line_right)
    bl = intersect(line_bot, line_left)
    
    src_pts = np.array([tl, tr, br, bl], dtype="float32")

    # --- 4. Warp to Normal Door Ratio ---
    # Standard door is approx 1:2.5 ratio. Let's create a high-res output.
    out_w, out_h = 1000, 2500
    dst_pts = np.array([[0, 0], [out_w, 0], [out_w, out_h], [0, out_h]], dtype="float32")
    
    M = cv2.getPerspectiveTransform(src_pts, dst_pts)
    
    # Warp the image AND the mask
    warped_img = cv2.warpPerspective(original_img, M, (out_w, out_h))
    warped_mask = cv2.warpPerspective(full_mask, M, (out_w, out_h))

    # --- 5. Clean & Extract Chalk ---
    # Apply mask to remove background artifacts (make background black)
    # Ensure mask is strict binary
    _, binary_mask = cv2.threshold(warped_mask, 127, 255, cv2.THRESH_BINARY)
    binary_mask_3c = cv2.cvtColor(binary_mask, cv2.COLOR_GRAY2BGR)
    
    cleaned_door = cv2.bitwise_and(warped_img, binary_mask_3c)
    
    # Chalk Enhancement (CLAHE)
    # Convert to LAB color space to enhance Luminance channel
    lab = cv2.cvtColor(cleaned_door, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    
    # Apply CLAHE to L-channel
    clahe = cv2.createCLAHE(clipLimit=4.0, tileGridSize=(16,16))
    cl = clahe.apply(l)
    
    enhanced_lab = cv2.merge((cl, a, b))
    enhanced_chalk = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)

    return cleaned_door, enhanced_chalk

# ==========================================
# EXECUTION
# ==========================================

# 1. Your JSON Data
json_input = [
  {
    "box_2d": [238, 107, 770, 922],
    "mask": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAAAAAB5Gfe6AAAB6ElEQVR42u3YAU4DMQwEQP//06aAQJUQglMvd0l29gPtjmxXTZWIfKefk94/kKH/Snr/zSH6eOIBdoLoMxIPsLJED0h6/6Uk+pI8PicbYN6p6NsSDzAJQd+deIB3gw4HuHUSOlygezWBk6VWAhgyMusADNqanjAHv1U8wGsKcwLU+Fs6KUCdAHBMYbL6XwA1/qhO+ivQdR7AvyAmXYEagbvSEbzuobLzEg/QANIBOh6g4wE6HqABpAM0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMgQAAAAAAAAAAAAAAAAAAAAAAAAAAAgD8CoKAAAAAAAAAAAAAAAAAAC8B5gAAAAAAAAAAAAAAAAAAADg7zAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACA+QX0twImAAAANwCAFUgVAGAFTIAJAAAAAAAAAAAAAAAAAAAAALL6AwAAILu/CQAAAIAjCAAAgNj+ANL7V3r/Su9f2e3zAOpHostvB1AfNX+ruilAvZiUnusC1OCk9Z0WoO5KZuubAWqm7N3uIoBasfgpALVBossfFagtk9hZ5DNvnUSCrulqmfoAAAAASUVORK5CYII=",
    "label": "the door excluding the doorframe"
  }
]

# 2. Run the function
# Replace 'door_image.jpg' with your actual image filename
cleaned, chalk = solve_door_extraction('../sample_door_photos/IMG_3104.jpeg', json_input)

# 3. Save Results (Uncomment when running)
cv2.imwrite('step1_cleaned_door.jpg', cleaned)
cv2.imwrite('step2_enhanced_chalk.jpg', chalk)
print("Processing Complete. Check step1_cleaned_door.jpg and step2_enhanced_chalk.jpg")