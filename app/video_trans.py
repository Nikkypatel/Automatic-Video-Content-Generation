import openai
import os
import subprocess
import logging
from deep_translator import GoogleTranslator
from gtts import gTTS
import moviepy
from moviepy import ImageClip, AudioFileClip, concatenate_videoclips, VideoFileClip
# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create output directory
OUTPUT_DIR = "output"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def extract_audio(video_path, audio_path):
    """Extract audio from a video file"""
    try:
        logger.info(f"Extracting audio from {video_path}")
        command = f"ffmpeg -i \"{video_path}\" -q:a 0 -map a \"{audio_path}\" -y"
        subprocess.run(command, shell=True, check=True)
        logger.info(f"Audio extracted to {audio_path}")
    except subprocess.CalledProcessError as e:
        logger.error(f"Error extracting audio: {str(e)}")
        raise

import openai

def transcribe_audio(audio_path, openai_api_key=None):
    """Transcribe audio using OpenAI Whisper API (latest openai>=1.x)"""
    try:
        logger.info(f"Transcribing audio from {audio_path}")
        
        if not openai_api_key:
            openai_api_key = os.getenv("OPENAI_API_KEY")
            if not openai_api_key:
                raise ValueError("OPENAI_API_KEY not provided and not found in environment")
        
        client = openai.OpenAI(api_key=openai_api_key)
        
        with open(audio_path, "rb") as audio_file:
            response = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file
            )
        
        transcribed_text = response.text
        logger.info(f"Transcription completed: {transcribed_text[:50]}...")
        return transcribed_text
    
    except Exception as e:
        logger.error(f"Error transcribing audio: {str(e)}")
        raise


def translate_text(text, target_language):
    """Translate text to target language"""
    try:
        logger.info(f"Translating text to {target_language}")
        translated_text = GoogleTranslator(source='auto', target=target_language).translate(text)
        logger.info(f"Translation completed: {translated_text[:50]}...")
        return translated_text
    except Exception as e:
        logger.error(f"Error translating text: {str(e)}")
        raise

def text_to_speech(text, lang, output_audio):
    """Convert text to speech"""
    try:
        logger.info(f"Converting text to speech in {lang}")
        tts = gTTS(text, lang=lang)
        tts.save(output_audio)
        logger.info(f"Speech saved to {output_audio}")
    except Exception as e:
        logger.error(f"Error converting text to speech: {str(e)}")
        raise

def replace_audio(video_path, new_audio_path, output_video):
    """Replace the audio in a video with a new audio track"""
    try:
        logger.info(f"Replacing audio in {video_path}")
        # Add the -y flag to automatically overwrite existing files without prompting
        command = f"ffmpeg -i \"{video_path}\" -i \"{new_audio_path}\" -c:v copy -map 0:v:0 -map 1:a:0 -shortest \"{output_video}\" -y"
        subprocess.run(command, shell=True, check=True)
        logger.info(f"Video with replaced audio saved to {output_video}")
    except subprocess.CalledProcessError as e:
        logger.error(f"Error replacing audio: {str(e)}")
        raise

def process_video(video_path, target_language, openai_api_key=None):
    """
    Process a video by translating its audio to the target language
    
    Args:
        video_path: Path to the input video
        target_language: Target language code (e.g., 'es', 'fr', 'hi')
        openai_api_key: OpenAI API key (optional, will use env var if not provided)
        
    Returns:
        Dictionary with paths to the output files
    """
    try:
        logger.info(f"Processing video: {video_path} to {target_language}")
        
        # Create unique directory for this translation
        timestamp = os.path.basename(video_path).split('.')[0]
        output_dir = os.path.join(OUTPUT_DIR, f"translation_{timestamp}")
        os.makedirs(output_dir, exist_ok=True)
        
        # Also create directory in public folder for frontend access
        frontend_dir = os.path.join("UI", "public", "temp_translations", f"translation_{timestamp}")
        os.makedirs(frontend_dir, exist_ok=True)
        
        # Define file paths
        original_audio = os.path.join(output_dir, "original_audio.mp3")
        translated_audio = os.path.join(output_dir, "translated_audio.mp3")
        output_video_path = os.path.join(output_dir, "translated_video.mp4")
        
        # Frontend paths
        frontend_original_audio = os.path.join(frontend_dir, "original_audio.mp3")
        frontend_translated_audio = os.path.join(frontend_dir, "translated_audio.mp3")
        frontend_output_video = os.path.join(frontend_dir, "translated_video.mp4")
        
        # Extract audio from the video
        extract_audio(video_path, original_audio)
        
        # Transcribe the audio
        transcript = transcribe_audio(original_audio, openai_api_key)
        
        # Translate the transcript
        translated_text = translate_text(transcript, target_language)
        
        # Convert the translated text to speech
        text_to_speech(translated_text, target_language, translated_audio)
        
        # Replace the audio in the video
        replace_audio(video_path, translated_audio, output_video_path)
        
        # Copy files to frontend directory
        import shutil
        shutil.copy(original_audio, frontend_original_audio)
        shutil.copy(translated_audio, frontend_translated_audio)
        shutil.copy(output_video_path, frontend_output_video)
        
        # Clean up the temporary video file
        if os.path.exists(video_path):
            os.remove(video_path)
            logger.info(f"Removed temporary video file: {video_path}")
        
        # Return paths for the main.py endpoint
        return {
            "output_path": output_video_path,
            "original_audio": original_audio,
            "translated_audio": translated_audio,
            "frontend_paths": {
                "video": f"/temp_translations/translation_{timestamp}/translated_video.mp4",
                "original_audio": f"/temp_translations/translation_{timestamp}/original_audio.mp3",
                "translated_audio": f"/temp_translations/translation_{timestamp}/translated_audio.mp3"
            }
        }
    except Exception as e:
        logger.error(f"Error processing video: {str(e)}")
        # Clean up any temporary files
        if os.path.exists(video_path):
            os.remove(video_path)
        raise