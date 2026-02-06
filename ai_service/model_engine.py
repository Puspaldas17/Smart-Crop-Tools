import random
from io import BytesIO
from PIL import Image

def analyze_image(image_bytes: bytes) -> dict:
    """
    Mock implementation of disease detection.
    In production, this would load a PyTorch/TensorFlow model or call HF API.
    """
    try:
        # Verify it's a valid image
        image = Image.open(BytesIO(image_bytes))
        image.verify() 
        
        # Mock Inference Logic
        # Randomly return Healthy or a specific disease for demo purposes
        # In a real scenario, this would be model.predict(image)
        
        diseases = [
            {
                "status": "Healthy",
                "disease": None,
                "confidence": 0.98,
                "recommendation": "Crop is healthy. Continue standard irrigation and monitoring."
            },
            {
                "status": "Diseased",
                "disease": "Leaf Blight",
                "confidence": 0.89,
                "recommendation": "Apply Copper Oxychloride 50WP. Ensure proper drainage to reduce humidity."
            },
            {
                "status": "Diseased",
                "disease": "Yellow Rust",
                "confidence": 0.92,
                "recommendation": "Spray Propiconazole 25 EC. Avoid excess nitrogen fertilization."
            }
        ]
        
        # For demo: Pick random result
        # To test specific cases easily, we could check filename, but random is fine for now
        result = random.choice(diseases)
        
        return result

    except Exception as e:
        raise ValueError(f"Failed to process image: {str(e)}")
