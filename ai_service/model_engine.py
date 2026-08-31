import random
import time
from io import BytesIO
from PIL import Image

def analyze_image(image_bytes: bytes) -> dict:
    """
    Mock AI engine that returns random leaf, disease, and pesticide data.
    """
    try:
        # Verify it's a valid image
        image = Image.open(BytesIO(image_bytes))
        image.verify()
        
        # Simulate processing time for realistic effect
        time.sleep(1.2)
        
        crops = [
            {
                "crop": "Tomato", 
                "diseases": ["Early Blight", "Late Blight", "Leaf Mold", "Healthy"], 
                "pesticides": {
                    "Early Blight": "Copper Fungicide or Chlorothalonil", 
                    "Late Blight": "Mancozeb or Copper spray", 
                    "Leaf Mold": "Fungicide with Difenoconazole", 
                    "Healthy": "None needed. Keep up the good work!"
                }
            },
            {
                "crop": "Rice", 
                "diseases": ["Rice Blast", "Brown Spot", "Healthy", "Bacterial Blight"],
                "pesticides": {
                    "Rice Blast": "Tricyclazole or Isoprothiolane", 
                    "Brown Spot": "Mancozeb or Propiconazole", 
                    "Healthy": "None needed. Keep up the good work!", 
                    "Bacterial Blight": "Copper oxychloride"
                }
            },
            {
                "crop": "Corn (Maize)", 
                "diseases": ["Common Rust", "Northern Leaf Blight", "Healthy"],
                "pesticides": {
                    "Common Rust": "Fungicide containing Pyraclostrobin", 
                    "Northern Leaf Blight": "Mancozeb", 
                    "Healthy": "None needed. Crop looks great!"
                }
            },
            {
                "crop": "Cotton", 
                "diseases": ["Aphids Infestation", "Bollworm Damage", "Healthy"],
                "pesticides": {
                    "Aphids Infestation": "Imidacloprid or Neem Oil", 
                    "Bollworm Damage": "Spinosad or Chlorantraniliprole", 
                    "Healthy": "None needed. Monitor weekly."
                }
            }
        ]
        
        selected_crop = random.choice(crops)
        leaf_type = selected_crop["crop"]
        disease = random.choice(selected_crop["diseases"])
        pesticide = selected_crop["pesticides"][disease]
        
        confidence = round(random.uniform(0.85, 0.98), 2)
        
        return {
            "status": "Success",
            "leaf_type": leaf_type,
            "disease": disease,
            "confidence": confidence,
            "recommendation": pesticide
        }

    except Exception as e:
        print(f"Analysis error: {e}")
        return {
            "status": "Error",
            "leaf_type": "Unknown",
            "disease": "Unknown",
            "confidence": 0.0,
            "recommendation": "Could not analyze image."
        }
