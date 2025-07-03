import os
import json
import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from dotenv import load_dotenv
from openai import OpenAI
from PIL import Image
from io import BytesIO
import requests
import moviepy
from moviepy import ImageClip, AudioFileClip, concatenate_videoclips

# Image generation class
class ImageModel:
    def __init__(self):
        logging.info("Initializing OpenAI client for image generation")
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable not set")
        self.client = OpenAI(api_key=api_key)
        logging.info("Initialized OpenAI client for image generation")

    def generate_image_for_video(self, prompt: str, dir_name: str, img_name: str) -> str:
        """Generate an image using OpenAI's DALL-E model"""
        logging.info(f"Generating image with prompt: {prompt[:50]}...")
        try:
            response = self.client.images.generate(
                model="dall-e-3",
                prompt=prompt,
                size="1024x1024",
                quality="standard",
                n=1,
            )
            logging.info("Generated image for video")
            
            image_url = response.data[0].url
            image_response = requests.get(image_url)
            image = Image.open(BytesIO(image_response.content))
            
            # Ensure directory exists in both backend and frontend locations
            os.makedirs(dir_name, exist_ok=True)
            
            # Save the image in the backend directory
            image_path = f"{dir_name}/{img_name}.jpg"
            image.save(image_path)
            logging.info(f"Saved image to {image_path}")
            
            # Also save to frontend public directory for proper serving by Vite
            frontend_dir = os.path.join("..", "UI", "public", dir_name)
            os.makedirs(frontend_dir, exist_ok=True)
            frontend_path = f"{frontend_dir}/{img_name}.jpg"
            image.save(frontend_path)
            logging.info(f"Saved image to frontend at {frontend_path}")
            
            return image_path
        except Exception as e:
            logging.error(f"Error generating image: {str(e)}")
            raise

# Audio generation class
class AudioModel:
    def __init__(self):
        logging.info("Initializing OpenAI client for audio generation")
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable not set")
        self.client = OpenAI(api_key=api_key)
        logging.info("Initialized OpenAI client for audio generation")

    def generate_audio_for_video(self, prompt: str, dir_name: str, audio_name: str) -> str:
        """Generate audio using OpenAI's TTS model"""
        logging.info("Generating audio for video")
        try:
            # Ensure directory exists
            os.makedirs(dir_name, exist_ok=True)
            
            response = self.client.audio.speech.create(
                model="tts-1-hd",
                voice="shimmer",
                input=prompt,
                speed=0.90
            )
            logging.info("Generated audio for video")
            
            audio_path = f"{dir_name}/{audio_name}"
            with open(audio_path, "wb") as audio_file:
                for chunk in response.iter_bytes():
                    audio_file.write(chunk)
            logging.info(f"Saved audio to {audio_path}")
            
            return audio_path
        except Exception as e:
            logging.error(f"Error generating audio: {str(e)}")
            raise

# Video synchronization function
def generate_video(video_store: str, dir_name: str, scenes: list, output_name: str = "video.mp4") -> str:
    """
    Generate a video by combining images and audio for each scene
    
    Args:
        video_store: Directory to store the final video (in UI/public/temp_videos)
        dir_name: Directory containing the scene images and audio
        scenes: List of scene numbers to include in the video
        output_name: Name of the output video file (default: video.mp4)
        
    Returns:
        Path to the generated video
    """
    try:
        logging.info(f"Generating video with {len(scenes)} scenes")
        
        video_size = (1920, 1080)
        fps = 30
        
        # Ensure directory exists
        os.makedirs(dir_name, exist_ok=True)
        
        # Ensure video store directory exists
        os.makedirs(video_store, exist_ok=True)

        # Output paths
        output_path = f"{dir_name}/{output_name}"
        frontend_path = f"{video_store}/{output_name}"

        clips = []
        for scene_num in scenes:
            logging.info(f"Processing scene {scene_num}")

            img_clip = ImageClip(f"{dir_name}/scene_{scene_num}.jpg")
            audio_clip = AudioFileClip(f"{dir_name}/scene_{scene_num}.mp3")
            
            # Set the duration of the image clip to match the audio duration
            img_clip = img_clip.with_duration(audio_clip.duration).resized(video_size).with_audio(audio_clip)

            clips.append(img_clip)

        logging.info("Concatenating video clips")
        final_video = concatenate_videoclips(clips)
        
        # Write the final video file
        final_video.write_videofile(
            output_path,
            fps=fps,
            codec="libx264",
            audio_codec="aac"
        )
        
        # Copy the video to the frontend assets directory
        import shutil
        shutil.copy(output_path, frontend_path)
        logging.info(f"Video copied to frontend at {frontend_path}")

        # Close clips to release resources
        final_video.close()
        for clip in clips:
            clip.close()
        
        # Clean up temporary files (images and audio)
        try:
            for scene_num in scenes:
                # Remove image and audio files
                image_path = f"{dir_name}/scene_{scene_num}.jpg"
                audio_path = f"{dir_name}/scene_{scene_num}.mp3"
                
                if os.path.exists(image_path):
                    os.remove(image_path)
                    logging.info(f"Removed temporary image: {image_path}")
                    
                if os.path.exists(audio_path):
                    os.remove(audio_path)
                    logging.info(f"Removed temporary audio: {audio_path}")
            
            # Keep the final video file in the temporary directory
            logging.info(f"Cleaned up temporary files in {dir_name}")
        except Exception as cleanup_error:
            logging.warning(f"Error cleaning up temporary files: {str(cleanup_error)}")
        
        logging.info(f"Video generated successfully: {frontend_path}")
        return frontend_path
    except Exception as e:
        logging.error(f"Error generating video: {str(e)}")
        raise

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class MediaElement(BaseModel):
    """Class for defining multimedia elements of a scene"""
    image_prompt: str = Field(
        description="Detailed prompt for image generation that captures the essence of the scene"
    )
    audio_narration: str = Field(
        description="Text for text-to-speech narration that conveys the emotional tone of the scene"
    )
    background_music: str = Field(
        default="ambient",
        description="Type of background music for the scene (e.g., suspenseful, cheerful, melancholic)"
    )
    duration_seconds: float = Field(
        default=5.0,
        description="Suggested duration of this scene in seconds"
    )

class Scene(BaseModel):
    """Class for defining a scene in the story"""
    title: str = Field(
        description="Short descriptive title for the scene"
    )
    description: str = Field(
        description="Detailed description of what happens in the scene"
    )
    media: MediaElement = Field(
        description="Multimedia elements for the scene"
    )
    transition: str = Field(
        default="cut",
        description="Transition to the next scene (e.g., fade, dissolve, cut)"
    )

class StoryResponse(BaseModel):
    """Response model for generated story"""
    title: str = Field(description="Title of the story")
    theme: str = Field(description="Central theme of the story")
    scenes: List[Scene] = Field(description="List of scenes that compose the story")
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Additional metadata about the generated story"
    )
    
# Function to generate a story for video
def generate_story_for_video(prompt: str, num_scenes: int = 5, style: Optional[str] = None, api_key: Optional[str] = None, format: str = "structured") -> Dict[str, Any]:
    """
    Wrapper function to generate a story for video production
    
    Args:
        prompt: The user's story prompt
        num_scenes: Suggested number of scenes
        style: Optional style guidance
        api_key: Optional OpenAI API key
        format: Output format ("structured" or "legacy")
        
    Returns:
        Dictionary containing the structured story
    """
    generator = StoryGenerator(api_key=api_key)
    
    if format.lower() == "legacy":
        return generator.generate_story_legacy_format(prompt, num_scenes)
    else:
        story = generator.generate_story(prompt, num_scenes, style)
        return story.dict()

class StoryGenerator:
    """Generates structured stories for automatic video creation"""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize the StoryGenerator with OpenAI API key"""
        self._initialize_llm(api_key)
        
    def _initialize_llm(self, api_key: Optional[str] = None):
        """Initialize the OpenAI client"""
        try:
            # Use provided API key or get from environment
            if not api_key:
                api_key = os.getenv("OPENAI_API_KEY")
                
            if not api_key:
                raise ValueError("No OpenAI API key provided. Set OPENAI_API_KEY environment variable or pass api_key to constructor.")
                
            # Initialize OpenAI client
            self.client = OpenAI(api_key=api_key)
            self.model_name = os.getenv("OPENAI_MODEL", "gpt-4") or "gpt-4"
            logger.info(f"LLM initialized successfully with model: {self.model_name}")
        except Exception as e:
            logger.error(f"Error initializing LLM: {str(e)}")
            raise
            
    def _create_system_prompt(self) -> str:
        """Create the system prompt for story generation"""
        return """You are a creative storyteller and expert screenwriter specializing in creating engaging, visually compelling stories.

Your task is to generate a structured story that can be converted into a video sequence. Each story should be divided into distinct scenes that flow naturally together to tell a cohesive story.

For each scene, provide:
1. A title that captures the essence of the scene
2. A detailed description of what happens
3. The setting (where and when the scene takes place)
4. Characters present in the scene
5. Multimedia elements:
   - Image prompt: VERY detailed visual description for image generation with style, lighting, mood, colors, and details with proper syncronization with the audio narration, the next scene should be a continuation of the previous scene and the image prompt should be detailed enough accurately represent the continuation of the story in terms of the visual representation
   - Audio narration: Engaging narrative text for voice-over that advances the story and conveys emotion
   - Background music suggestion
   - Suggested duration in seconds
6. Transition to the next scene

Important requirements:
- Each scene's audio narration should continue the story from the previous scene
- Audio narration should sound like a professional storyteller
- Image prompts should be extremely detailed for high-quality generation
- The story should have a clear beginning, middle, and end
- The whole story when read through all scenes should feel cohesive and complete

Your output will be used directly for automated video generation, so be specific about visual and audio elements."""

    def _create_function_schema(self) -> Dict[str, Any]:
        """Create the function schema for story generation"""
        return {
            "name": "generate_story",
            "description": "Generate a structured story with scenes and multimedia elements for video creation",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "Title of the story"
                    },
                    "theme": {
                        "type": "string",
                        "description": "Central theme of the story"
                    },
                    "scenes": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "title": {
                                    "type": "string",
                                    "description": "Short descriptive title for the scene"
                                },
                                "description": {
                                    "type": "string",
                                    "description": "Detailed description of what happens in the scene"
                                },
                                "media": {
                                    "type": "object",
                                    "properties": {
                                        "image_prompt": {
                                            "type": "string",
                                            "description": "Extremely detailed prompt for image generation that captures the essence of the scene with style, lighting, colors and mood details"
                                        },
                                        "audio_narration": {
                                            "type": "string",
                                            "description": "Engaging narrative text for voice-over that continues the story from the previous scene"
                                        },
                                        "background_music": {
                                            "type": "string",
                                            "description": "Type of background music for the scene (e.g., suspenseful, cheerful, melancholic)"
                                        },
                                        "duration_seconds": {
                                            "type": "number",
                                            "description": "Suggested duration of this scene in seconds"
                                        }
                                    },
                                    "required": ["image_prompt", "audio_narration", "background_music", "duration_seconds"]
                                },
                                "transition": {
                                    "type": "string",
                                    "description": "Transition to the next scene (e.g., fade, dissolve, cut)"
                                }
                            },
                            "required": ["title", "description", "media", "transition"]
                        }
                    },
                },
                "required": ["title", "theme", "scenes"]
            }
        }

    def generate_story(self, prompt: str, num_scenes: int = 5, style: Optional[str] = None) -> StoryResponse:
        """
        Generate a structured story based on the input prompt
        
        Args:
            prompt: The user's story prompt or request
            num_scenes: Suggested number of scenes (default: 5)
            style: Optional style guidance (e.g., "dramatic", "comedic")
            
        Returns:
            StoryResponse object containing the structured story
        """
        try:
            logger.info(f"Generating story for prompt: {prompt[:50]}...")
            
            # Prepare the messages
            user_prompt = f"Create a story with approximately {num_scenes} scenes based on the following prompt: {prompt}"
            if style:
                user_prompt += f"\nThe story should be in a {style} style."
                
            user_prompt += "\n\nMake sure each scene flows naturally from the previous one, with audio narration that continues the story and image prompts that are extremely detailed for high-quality generation."
                
            messages = [
                {"role": "system", "content": self._create_system_prompt()},
                {"role": "user", "content": user_prompt}
            ]
            
            # Call the OpenAI API with function calling
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                tools=[{"type": "function", "function": self._create_function_schema()}],
                tool_choice={"type": "function", "function": {"name": "generate_story"}},
                temperature=0.7,
                max_tokens=3000
            )
            
            # Extract and parse the function call
            tool_call = response.choices[0].message.tool_calls[0]
            if tool_call:
                result = json.loads(tool_call.function.arguments)
                
                # Add metadata
                if "metadata" not in result:
                    result["metadata"] = {}
                    
                result["metadata"]["generation_timestamp"] = datetime.now().isoformat()
                result["metadata"]["prompt"] = prompt
                result["metadata"]["model"] = self.model_name
                
                # Convert to Pydantic model for validation
                story_response = StoryResponse(**result)
                logger.info(f"Successfully generated story '{story_response.title}' with {len(story_response.scenes)} scenes")
                
                return story_response
            else:
                raise ValueError("No function call in the response")
                
        except Exception as e:
            logger.error(f"Error generating story: {str(e)}")
            raise

    def generate_story_legacy_format(self, message: str, num_scenes: int = 5) -> Dict[str, Any]:
        """
        Generate a story in the legacy format as per the provided template
        
        Args:
            message: The user's story prompt or request
            num_scenes: Suggested number of scenes
            
        Returns:
            Dictionary in the legacy format with scenes
        """
        try:
            # First generate structured story
            story_response = self.generate_story(message, num_scenes)
            
            # Convert to legacy format
            legacy_format = {"response": {}}
            legacy_format["title"] = story_response.title
            legacy_format["theme"] = story_response.theme
            for i, scene in enumerate(story_response.scenes, 1):
                scene_key = f"scene{i}"
                legacy_format["response"][scene_key] = {
                    "title": scene.title,
                    "description": scene.description,
                    "narration": scene.media.audio_narration,
                    "image_prompt": scene.media.image_prompt,
                    "background_music": scene.media.background_music,
                    "duration_seconds": scene.media.duration_seconds
                }
            
            return legacy_format
            
        except Exception as e:
            logger.error(f"Error generating story in legacy format: {str(e)}")
            raise