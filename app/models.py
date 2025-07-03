from pydantic import BaseModel
from typing import Optional, Dict, Any, List

# Authentication models
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class User(BaseModel):
    username: str
    disabled: Optional[bool] = None

# Image generation models
class ImageGenerationRequest(BaseModel):
    prompt: str

class ImageGenerationResponse(BaseModel):
    image_url: str

# Video generation models
class VideoGenerationRequest(BaseModel):
    prompt: str
    target_language: str = "en"
    story: Optional[str] = None

class VideoGenerationResponse(BaseModel):
    video_url: str

# Video translation models
class VideoTranslationRequest(BaseModel):
    video_url: str
    target_language: str

class VideoTranslationResponse(BaseModel):
    translated_video_url: str

# Story models for internal use
class MediaElement(BaseModel):
    image_prompt: str
    audio_narration: str
    background_music: str = "ambient"
    duration_seconds: float = 5.0

class Scene(BaseModel):
    title: str
    description: str
    media: MediaElement
    transition: str = "cut"

class StoryResponse(BaseModel):
    title: str
    theme: str
    scenes: List[Scene]
    metadata: Dict[str, Any] = {}