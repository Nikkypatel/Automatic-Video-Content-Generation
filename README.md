# Automatic Video Content Generation

## Project Overview

The Accelerator is a FastAPI-based backend service designed for the Rean Foundation to provide three core functionalities:

1. **Image Generation**: Generate images based on a text prompt.
2. **Video Generation**: Generate videos based on a prompt, target language, and optional story.
3. **Video Translation**: Translate an existing video into a target language.

## Directory Structure

```
accelerator/
│── app/
│   │── __init__.py
│   │── main.py            # FastAPI app and endpoints
│   │── auth.py            # Authentication logic
│   │── models.py          # Pydantic models for request/response
│   │── dependencies.py    # Dependency injection for authentication
│   │── image_gen.py       # Image generation logic 
│   │── video_gen.py       # Video generation logic 
│   │── video_trans.py     # Video translation logic 
│── requirements.txt       # Dependencies
│── README.md              # Project documentation
```

## Technology Stack

- **FastAPI**: Web framework for building APIs
- **OpenAI API**: For image generation (DALL-E) and text-to-speech
- **Whisper**: For speech-to-text transcription
- **MoviePy**: For video editing and creation
- **Deep Translator**: For text translation
- **JWT**: For secure authentication
- **Python 3.9+**: Required for compatibility with all libraries

## API Endpoints

### 1. Authentication

```
POST /login
```

Request:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

Response:
```json
{
  "access_token": "<token>",
  "token_type": "bearer"
}
```

### 2. Image Generation

```
POST /image_generation
```

Request:
```json
{
  "prompt": "A futuristic hospital"
}
```

Response:
```json
{
  "image_url": "<generated_image_url>"
}
```

### 3. Video Generation

```
POST /video_generation
```

Request:
```json
{
  "prompt": "A doctor explaining AI",
  "target_language": "en",
  "story": "AI in healthcare"
}
```

Response:
```json
{
  "video_url": "<generated_video_url>"
}
```

### 4. Video Translation

```
POST /video_translation
```

Request: Multipart form with:
- `video_file`: The video file to translate
- `target_language`: Target language code (e.g., "es", "hi")

Response:
```json
{
  "translated_video_url": "<translated_video_url>"
}
```

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd accelerator
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   # Create a .env file with the following variables
   OPENAI_API_KEY=your_openai_api_key
   SECRET_KEY=your_jwt_secret_key
   ```

5. Run the application:
   ```bash
   uvicorn app.main:app --reload
   ```

6. Access the API documentation at:
   ```
   http://localhost:8000/docs
   ```

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key
- `SECRET_KEY`: Secret key for JWT token generation
- `OPENAI_MODEL`: OpenAI model to use (default: "gpt-4")

## Team Responsibilities

- **Ashish**: Refine image_gen.py and video_gen.py with actual generation logic.
- **Nikhitha**: Refine image_gen.py and video_trans.py with actual translation logic.
- **Bharath**: Implement FastAPI endpoints and connect to React frontend.

## Frontend Integration

The backend is designed to be consumed by a React frontend with a healthcare-themed UI:

- **Color Scheme**:
  - Primary: Blue (#007BFF) - Trust and professionalism
  - Secondary: White (#FFFFFF) - Cleanliness and simplicity
  - Accent: Green (#28A745) - Health and positivity

- **Layout**:
  - Header with logo and navigation
  - Dashboard with cards for each functionality
  - Modals for input and output display

## License

[License Information]

## Contact

[Contact Information]
