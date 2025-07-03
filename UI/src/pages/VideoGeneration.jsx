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
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material'
import { Videocam as VideocamIcon } from '@mui/icons-material'
import { generateVideo } from '../services/api'

const VideoGeneration = () => {
  const [prompt, setPrompt] = useState('')
  const [targetLanguage, setTargetLanguage] = useState('en')
  const [story, setStory] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])

  const languages = [
    { code: 'en', name: 'English' },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await generateVideo(prompt, targetLanguage, story)
      if (response.success) {
        // Get the video URL from the response
        let videoUrl = response.data.video_url
        
        // For Vite's asset handling, we need to use import.meta.env.BASE_URL
        // This ensures the correct path resolution for static assets
        const baseUrl = '/'
        
        // The backend returns paths like '/video_123456/video.mp4'
        if (videoUrl.startsWith('/')) {
          // Remove any leading slash for consistency
          videoUrl = videoUrl.startsWith('/') ? videoUrl.substring(1) : videoUrl
          
          // Construct the full URL with the base URL
          videoUrl = `${baseUrl}${videoUrl}`
        }
        
        const newVideo = {
          id: Date.now(),
          prompt,
          targetLanguage,
          story: story || 'None',
          videoUrl: videoUrl
        }
        setResult(newVideo)
        setHistory(prev => [newVideo, ...prev].slice(0, 3)) // Keep only the 3 most recent
        setPrompt('')
        setStory('')
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
        Healthcare Video Generation
      </Typography>
      <Typography variant="body1" paragraph>
        Create informative healthcare videos with customized narration in multiple languages.
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Enter your video prompt"
                  placeholder="e.g., A doctor explaining the importance of vaccination"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  multiline
                  rows={2}
                  variant="outlined"
                  disabled={loading}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined" disabled={loading}>
                  <InputLabel id="target-language-label">Target Language</InputLabel>
                  <Select
                    labelId="target-language-label"
                    id="target-language"
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    label="Target Language"
                  >
                    {languages.map((lang) => (
                      <MenuItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Story Theme (Optional)"
                  placeholder="e.g., AI in healthcare"
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  variant="outlined"
                  disabled={loading}
                  helperText="Leave blank for default informative style"
                />
              </Grid>
            </Grid>
            
            {error && (
              <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading || !prompt.trim()}
              startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <VideocamIcon />}
              sx={{ mt: 3 }}
            >
              {loading ? 'Generating...' : 'Generate Video'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {result && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom color="primary">
            Generated Video
          </Typography>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                  Prompt: {result.prompt}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Language: {languages.find(l => l.code === result.targetLanguage)?.name || result.targetLanguage}
                </Typography>
                {result.story !== 'None' && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Story Theme: {result.story}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
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
                  <video
                    controls
                    width="100%"
                    style={{ maxHeight: '500px', borderRadius: '4px' }}
                  >
                    <source src={result.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      )}

      {history.length > 0 && (
        <Box>
          <Divider sx={{ my: 4 }} />
          <Typography variant="h5" gutterBottom color="primary">
            Recent Generations
          </Typography>
          <Grid container spacing={3}>
            {history.map((item) => (
              <Grid item key={item.id} xs={12} md={6} lg={4}>
                <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Prompt: {item.prompt}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Language: {languages.find(l => l.code === item.targetLanguage)?.name || item.targetLanguage}
                  </Typography>
                  <Box
                    sx={{
                      mt: 2,
                      display: 'flex',
                      justifyContent: 'center',
                      backgroundColor: '#f5f5f5',
                      borderRadius: 1,
                      p: 1
                    }}
                  >
                    <video
                      controls
                      width="100%"
                      style={{ maxHeight: '200px', borderRadius: '4px' }}
                    >
                      <source src={item.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  )
}

export default VideoGeneration