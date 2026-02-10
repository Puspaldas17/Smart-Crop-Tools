import random
from io import BytesIO
from PIL import Image
import numpy as np

def analyze_image(image_bytes: bytes) -> dict:
    """
    Heuristic-based disease detection using color analysis.
    """
    try:
        # Verify it's a valid image
        image = Image.open(BytesIO(image_bytes))
        image.verify()
        
        # Re-open for processing (verify closes the file)
        image = Image.open(BytesIO(image_bytes)).convert('RGB')
        image = image.resize((224, 224)) # Resize for speed
        
        # Convert to numpy array
        img_array = np.array(image)
        
        # Calculate color statistics
        # R, G, B channels
        r = img_array[:, :, 0]
        g = img_array[:, :, 1]
        b = img_array[:, :, 2]
        
        # Simple Greenness Index: 2G - R - B
        # If high positive, it's green. If low or negative, it's yellow/brown/other.
        greenness = 2 * g.astype(float) - r.astype(float) - b.astype(float)
        
        # Calculate percentage of "healthy green" pixels
        # Threshold can be tuned. Let's say > 20 is "green enough"
        green_pixels = np.sum(greenness > 20)
        total_pixels = img_array.shape[0] * img_array.shape[1]
        green_ratio = green_pixels / total_pixels
        
        # Heuristic Logic
        if green_ratio > 0.4:
            # Mostly green -> Healthy
            return {
                "status": "Healthy",
                "disease": None,
                "confidence": round(0.85 + (green_ratio * 0.1), 2),
                "recommendation": "Crop appears healthy and vigorous. Maintain current irrigation and nutrient schedule."
            }
        
        # If not green, check for specific "disease" colors (Yellow/Brown)
        # Yellow: High R, High G, Low B
        # Brown: Medium R, Low G, Low B
        
        # Simple fallback for now: If not green, it's likely diseased (or not a leaf)
        # We can randomize the specific disease to keep the demo varied for non-green images,
        # or try to distinguish yellow (Rust) vs brown (Blight).
        
        avg_r = np.mean(r)
        avg_g = np.mean(g)
        
        if avg_r > avg_g + 10:
             # Reddish/Brown -> Leaf Blight or Rust
            return {
                "status": "Diseased",
                "disease": "Brown Rust / Leaf Blight",
                "confidence": 0.92,
                "recommendation": "Fungal infection detected. Apply Propiconazole 25 EC and ensure proper spacing between plants."
            }
        else:
            # Yellowish -> Nitrogen deficiency or Yellow Rust
            return {
                "status": "Deficiency / Disease",
                "disease": "Nitrogen Deficiency / Yellowing",
                "confidence": 0.88,
                "recommendation": "Yellowing detected. Check soil nitrogen levels. If pustules are visible, treat for Yellow Rust."
            }

    except Exception as e:
        # Fallback if image processing fails
        print(f"Analysis error: {e}")
        return {
            "status": "Unknown",
            "disease": "Could not analyze",
            "confidence": 0.0,
            "recommendation": "Please upload a clearer image of the crop leaf."
        }
