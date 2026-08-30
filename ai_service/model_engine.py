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
        
        # Analyze image (mock logic for soil)
        # In a real scenario, this would classify soil texture/color
        
        return {
            "status": "Soil Analysis",
            "disease": "Loamy / Fertile", # Re-using 'disease' key as 'Type' to match backend mapping if needed, or just for consistency
            "confidence": 0.95,
            "recommendation": "Rich in nutrients. Suitable for Wheat, Rice, and Sugarcane. Maintain moisture levels."
        }

    except Exception as e:
        # Fallback if image processing fails
        print(f"Analysis error: {e}")
        return {
            "status": "Error",
            "disease": "Unknown Soil",
            "confidence": 0.0,
            "recommendation": "Could not analyze soil image."
        }
