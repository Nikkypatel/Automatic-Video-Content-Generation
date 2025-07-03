import axios from 'axios'

// Base API configuration
const API_URL = '/api'

// Image Generation API
export const generateImage = async (prompt) => {
  try {
    const response = await axios.post(`${API_URL}/image_generation`, { prompt })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error generating image:', error)
    return { 
      success: false, 
      error: error.response?.data?.detail || 'Failed to generate image. Please try again.'
    }
  }
}

// Video Generation API
export const generateVideo = async (prompt, targetLanguage, story) => {
  try {
    const response = await axios.post(`${API_URL}/video_generation`, {
      prompt,
      target_language: targetLanguage,
      story
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error generating video:', error)
    return { 
      success: false, 
      error: error.response?.data?.detail || 'Failed to generate video. Please try again.'
    }
  }
}

// Video Translation API
export const translateVideo = async (videoFile, targetLanguage) => {
  try {
    const formData = new FormData()
    formData.append('video_file', videoFile)
    formData.append('target_language', targetLanguage)
    
    const response = await axios.post(`${API_URL}/video_translation`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error translating video:', error)
    return { 
      success: false, 
      error: error.response?.data?.detail || 'Failed to translate video. Please try again.'
    }
  }
}