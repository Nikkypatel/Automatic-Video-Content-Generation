from openai import OpenAI
from PIL import Image
from io import BytesIO
import os
import requests
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class ImageModel:
    def __init__(self):
        """Initialize the OpenAI client for image generation"""
        try:
            logger.info("Initializing OpenAI client for image generation")
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise ValueError("OPENAI_API_KEY environment variable not set")
            
            self.client = OpenAI(api_key=api_key)
            logger.info("OpenAI client initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing OpenAI client: {str(e)}")
            raise

    def generate_image_for_video(self, prompt: str, dir_name: str, img_name: str) -> str:
        """
        Generate an image using OpenAI's DALL-E model
        
        Args:
            prompt: Text prompt for image generation
            dir_name: Directory to save the image
            img_name: Name for the generated image file
            
        Returns:
            Path to the generated image
        """
        try:
            logger.info(f"Generating image with prompt: {prompt[:50]}...")
            
            # Ensure directory exists
            # Save to the public directory instead of src/assets for proper serving by Vite
            frontend_dir = os.path.join("UI", "public", dir_name)
            os.makedirs(frontend_dir, exist_ok=True)
            
            # Also ensure the backend directory exists
            backend_dir = os.path.join(dir_name)
            os.makedirs(backend_dir, exist_ok=True)
            
            # Call OpenAI API to generate image
            response = self.client.images.generate(
                model="dall-e-3",
                prompt=prompt,
                size="1024x1024",
                quality="standard",
                n=1,
            )
            
            logger.info("Image generated successfully")
            
            # Download and save the image
            image_url = response.data[0].url
            image_response = requests.get(image_url)
            image = Image.open(BytesIO(image_response.content))
            
            # Save the image in both locations
            backend_path = f"{backend_dir}/{img_name}.jpg"
            frontend_path = f"{frontend_dir}/{img_name}.jpg"
            
            # Save to backend directory
            image.save(frontend_path)
            logger.info(f"Image saved to frontend at {frontend_path}")
            
            image.save(backend_path)
            logger.info(f"Image saved to backend at {backend_path}")
            
            
            # Ensure the image is actually saved by checking file existence
            if not os.path.exists(frontend_path):
                logger.error(f"Failed to save image to frontend at {frontend_path}")
                # Try creating the directory again and saving
                os.makedirs(os.path.dirname(frontend_path), exist_ok=True)
                image.save(frontend_path)
            
            # Return a frontend-compatible path for the API response
            # This should be a path that works with the React frontend's asset handling
            frontend_url_path = f"/assets/{dir_name}/{img_name}.jpg"
            return frontend_url_path
            
        except Exception as e:
            logger.error(f"Error generating image: {str(e)}")
            raise