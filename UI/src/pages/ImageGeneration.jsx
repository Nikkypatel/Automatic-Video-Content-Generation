import { useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Paper,
  Divider
} from '@mui/material'
import { Image as ImageIcon } from '@mui/icons-material'
import { generateImage } from '../services/api'

const ImageGeneration = () => {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await generateImage(prompt)
      if (response.success) {
        // Get the image URL from the response
        let imageUrl = response.data.image_url
        
        // For Vite's asset handling, we need to use import.meta.env.BASE_URL
        // This ensures the correct path resolution for static assets
        const baseUrl = '/'
        
        // The backend returns paths like '/temp_images/image_xxx.jpg'
        if (imageUrl.includes('temp_images')) {
          // Remove any leading slash for consistency
          imageUrl = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl
          
          // Construct the full URL with the base URL
          imageUrl = `${baseUrl}${imageUrl}`
        }
        
        const newImage = {
          id: Date.now(),
          prompt,
          imageUrl: imageUrl
        }
        setResult(newImage)
        setHistory(prev => [newImage, ...prev].slice(0, 5)) // Keep only the 5 most recent
        setPrompt('')
      } else {
        setError(response.error)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom color="primary">
        Healthcare Image Generation
      </Typography>
      <Typography variant="body1" paragraph>
        Generate high-quality medical and healthcare images based on text prompts.
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Enter your image prompt"
              placeholder="e.g., A doctor explaining a medical chart to a patient in a modern hospital setting"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              multiline
              rows={3}
              variant="outlined"
              disabled={loading}
              sx={{ mb: 2 }}
            />
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading || !prompt.trim()}
              startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <ImageIcon />}
            >
              {loading ? 'Generating...' : 'Generate Image'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {result && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom color="primary">
            Generated Image
          </Typography>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="medium">
              Prompt: {result.prompt}
            </Typography>
            <Box
              sx={{
                mt: 2,
                display: 'flex',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                borderRadius: 1,
                p: 2
              }}
            >
              <Box
                component="img"
                src={result.imageUrl}
                alt={result.prompt}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '500px',
                  objectFit: 'contain',
                  borderRadius: 1
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.svg';
                  console.error('Failed to load image:', result.imageUrl);
                }}
              />
            </Box>
          </Paper>
        </Box>
      )}

      {history.length > 0 && (
        <Box>
          <Divider sx={{ my: 4 }} />
          <Typography variant="h5" gutterBottom color="primary">
            Recent Generations
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {history.map((item) => (
              <Paper key={item.id} elevation={1} sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Prompt: {item.prompt}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5',
                    borderRadius: 1,
                    p: 1
                  }}
                >
                  <Box
                    component="img"
                    src={item.imageUrl}
                    alt={item.prompt}
                    sx={{
                      maxWidth: '100%',
                      height: '200px',
                      objectFit: 'contain',
                      borderRadius: 1
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-image.svg';
                    }}
                  />
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default ImageGeneration