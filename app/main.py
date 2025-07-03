from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from typing import Optional
import uvicorn
import os

from app.dependencies import get_current_user
from app.models import (
    Token, 
    ImageGenerationRequest, 
    ImageGenerationResponse, 
    VideoGenerationRequest, 
    VideoGenerationResponse,
    VideoTranslationRequest,
    VideoTranslationResponse
)
from app.auth import authenticate_user, create_access_token
from app.image_gen import ImageModel
from app.video_gen import generate_story_for_video, ImageModel as VideoImageModel, AudioModel, generate_video
from app.video_trans import process_video

# Create FastAPI app
app = FastAPI(
    title="Rean Foundation Accelerator",
    description="FastAPI backend for image generation, video generation, and video translation",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Login endpoint
@app.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}

# Image generation endpoint
@app.post("/image_generation", response_model=ImageGenerationResponse)
async def generate_image(
    request: ImageGenerationRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Create temporary directory for image
        dir_name = "temp_images"
        os.makedirs(dir_name, exist_ok=True)
        img_name = f"image_{hash(request.prompt)}"
        
        # Generate image
        image_model = ImageModel()
        image_path = image_model.generate_image_for_video(
            prompt=request.prompt,
            dir_name=dir_name,
            img_name=img_name
        )
        
        # For demo purposes, just return the local path
        # In production, upload to storage service and return URL
        # Use the correct file extension (.jpg) and path format for the frontend
        # The path should be relative to the public directory for proper display in the UI
        # Ensure the path starts with a forward slash for proper URL resolution in the browser
        frontend_path = f"/temp_images/{img_name}.jpg"
        return {"image_url": frontend_path}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating image: {str(e)}"
        )

# Video generation endpoint
@app.post("/video_generation", response_model=VideoGenerationResponse)
async def generate_video_endpoint(
    request: VideoGenerationRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Create directory for video assets
        dir_name = f"video_{hash(request.prompt)}"
        os.makedirs(dir_name, exist_ok=True)
        
        # Generate story based on prompt
        story = generate_story_for_video(
            prompt=request.prompt,
            num_scenes=3,  # Default number of scenes
            style="informative" if not request.story else None,
            format="legacy"
        )
        
        # Process each scene
        image_model = VideoImageModel()
        audio_model = AudioModel()
        scenes = []
        
        for i, (scene_key, scene_data) in enumerate(story["response"].items(), 1):
            # Generate image
            image_model.generate_image_for_video(
                prompt=scene_data["image_prompt"],
                dir_name=dir_name,
                img_name=f"scene_{i}"
            )
            
            # Generate audio with translation if needed
            if request.target_language and request.target_language != "en":
                # Here you'd translate the narration first
                # For simplicity, we're using the original text
                translated_narration = scene_data["narration"]  # Replace with actual translation
            else:
                translated_narration = scene_data["narration"]
                
            audio_model.generate_audio_for_video(
                prompt=translated_narration,
                dir_name=dir_name,
                audio_name=f"scene_{i}.mp3"
            )
            
            scenes.append(i)
        
        # Combine everything into video
        video_store = os.path.join("UI", "public", "temp_videos", dir_name)
        os.makedirs(video_store, exist_ok=True)
        path = generate_video(video_store, dir_name, scenes)
        
        # Return video URL
        # Use a path relative to the public directory for proper serving by Vite
        frontend_path = f"/temp_videos/{dir_name}/video.mp4"
        return {"video_url": frontend_path}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating video: {str(e)}"
        )

# Video translation endpoint
@app.post("/video_translation", response_model=VideoTranslationResponse)
async def translate_video_endpoint(
    video_file: UploadFile = File(...),
    target_language: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    try:
        # Save the uploaded video
        dir_name = f"temp_videos_{hash(video_file.filename)}"
        os.makedirs(dir_name, exist_ok=True)
        temp_file_path = f"temp_video_{hash(video_file.filename)}.mp4"
        with open(temp_file_path, "wb") as buffer:
            content = await video_file.read()
            buffer.write(content)
        
        # Process the video
        result = process_video(
            video_path=temp_file_path,
            target_language=target_language
        )
        
        # Return the frontend paths directly
        return {
            "translated_video_url": result["frontend_paths"]["video"],
            "original_audio": result["frontend_paths"]["original_audio"],
            "translated_audio": result["frontend_paths"]["translated_audio"]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error translating video: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)