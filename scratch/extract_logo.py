import os
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
from collections import deque

src_path = r'C:\Users\hudav\.gemini\antigravity\brain\4c378bdf-abd6-488b-a0a6-c948df51de4a\.user_uploaded\media_1787126088578.png'
out_dir = r'c:\Users\hudav\Documents\GitHub\app\public'
scratch_dir = r'c:\Users\hudav\Documents\GitHub\app\scratch'

os.makedirs(scratch_dir, exist_ok=True)
os.makedirs(out_dir, exist_ok=True)

img = Image.open(src_path).convert('RGBA')
arr = np.array(img, dtype=np.uint8)
h, w, _ = arr.shape

gray = 0.299 * arr[:, :, 0].astype(np.float32) + 0.587 * arr[:, :, 1].astype(np.float32) + 0.114 * arr[:, :, 2].astype(np.float32)

# Step 1: Detect background from outer edges inward
# Along each row from left -> right, and right -> left:
# Find the shadow trough and the start of the die-cut white border
mask = np.ones((h, w), dtype=bool)

for y in range(h):
    # From left to right
    row = gray[y, :]
    # Find background region: starting at 0, moving right
    # Background is high (>250), drops into shadow (<235), then jumps to die-cut white border (>250)
    found_left = False
    in_shadow = False
    for x in range(w // 2):
        val = row[x]
        if val < 235:
            in_shadow = True
        elif in_shadow and val >= 253:
            # We hit the die-cut border!
            mask[y, :x] = False
            found_left = True
            break
    if not found_left:
        # If no shadow trough detected on this row, check if whole row is background
        if np.all(row < 240):
            pass # within logo
        else:
            mask[y, :w // 2] = False

    # From right to left
    found_right = False
    in_shadow_r = False
    for x in range(w - 1, w // 2, -1):
        val = row[x]
        if val < 235:
            in_shadow_r = True
        elif in_shadow_r and val >= 253:
            # Hit die-cut border from right
            mask[y, x+1:] = False
            found_right = True
            break
    if not found_right:
        if np.all(row < 240):
            pass
        else:
            mask[y, w // 2:] = False

# Also scan vertically from top and bottom
for x in range(w):
    col = gray[:, x]
    # From top down
    in_shadow_t = False
    for y in range(h // 2):
        val = col[y]
        if val < 235:
            in_shadow_t = True
        elif in_shadow_t and val >= 253:
            mask[:y, x] = False
            break
            
    # From bottom up
    in_shadow_b = False
    for y in range(h - 1, h // 2, -1):
        val = col[y]
        if val < 235:
            in_shadow_b = True
        elif in_shadow_b and val >= 253:
            mask[y+1:, x] = False
            break

# Fill any small holes in the mask (everything inside is solid sticker)
mask = ndimage.binary_fill_holes(mask)

# Smooth the mask boundary slightly for anti-aliasing
mask_float = mask.astype(np.float32)
mask_blurred = ndimage.gaussian_filter(mask_float, sigma=0.6)
alpha = np.clip(mask_blurred * 255.0, 0, 255).astype(np.uint8)

# Create final RGBA image
result_arr = np.copy(arr)
result_arr[:, :, 3] = alpha

# Crop tightly to bounding box
y_indices, x_indices = np.where(alpha > 10)
y_min, y_max = np.min(y_indices), np.max(y_indices)
x_min, x_max = np.min(x_indices), np.max(x_indices)

# Add 12px margin
margin = 12
y_min = max(0, y_min - margin)
y_max = min(h, y_max + margin)
x_min = max(0, x_min - margin)
x_max = min(w, x_max + margin)

cropped_arr = result_arr[y_min:y_max, x_min:x_max]
logo_img = Image.fromarray(cropped_arr, mode='RGBA')

print(f'Cropped logo size: {logo_img.size}')

# Save test outputs
logo_img.save(os.path.join(scratch_dir, 'logo_transparent.png'), optimize=True)

# Test composite on dark espresso background (#2a1a17)
bg_espresso = Image.new('RGBA', logo_img.size, (42, 26, 23, 255))
composite_espresso = Image.alpha_composite(bg_espresso, logo_img)
composite_espresso.save(os.path.join(scratch_dir, 'test_espresso.png'))

print('Saved preview images to scratch/')
