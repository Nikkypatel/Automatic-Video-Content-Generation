import { useState, useRef } from 'react'
import {
  Box,
  Typography,
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
  Grid,
  TextField,
  Chip,
  Tooltip,
  LinearProgress
} from '@mui/material'
import { 
  CloudUpload as CloudUploadIcon, 
  Translate as TranslateIcon,
  HealthAndSafety as HealthIcon,
  Info as InfoIcon
} from '@mui/icons-material'
import { translateVideo } from '../services/api'

const VideoTranslation = () => {
  const [file, setFile] = useState(null)
  const [targetLanguage, setTargetLanguage] = useState('es')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const fileInputRef = useRef(null)

  const languages = [
    { code: 'af', name: 'Afrikaans' },
    { code: 'ar', name: 'Arabic' },
    { code: 'bn', name: 'Bengali' },
    { code: 'bs', name: 'Bosnian' },
    { code: 'ca', name: 'Catalan' },
    { code: 'cs', name: 'Czech' },
    { code: 'cy', name: 'Welsh' },
    { code: 'da', name: 'Danish' },
    { code: 'de', name: 'German' },
    { code: 'el', name: 'Greek' },
    { code: 'en', name: 'English' },
    { code: 'eo', name: 'Esperanto' },
    { code: 'es', name: 'Spanish' },
    { code: 'et', name: 'Estonian' },
    { code: 'fi', name: 'Finnish' },
    { code: 'fr', name: 'French' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'hi', name: 'Hindi' },
    { code: 'hr', name: 'Croatian' },
    { code: 'hu', name: 'Hungarian' },
    { code: 'hy', name: 'Armenian' },
    { code: 'id', name: 'Indonesian' },
    { code: 'is', name: 'Icelandic' },
    { code: 'it', name: 'Italian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'jw', name: 'Javanese' },
    { code: 'km', name: 'Khmer' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ko', name: 'Korean' },
    { code: 'la', name: 'Latin' },
    { code: 'lv', name: 'Latvian' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'mr', name: 'Marathi' },
    { code: 'my', name: 'Myanmar (Burmese)' },
    { code: 'ne', name: 'Nepali' },
    { code: 'nl', name: 'Dutch' },
    { code: 'no', name: 'Norwegian' },
    { code: 'pl', name: 'Polish' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ro', name: 'Romanian' },
    { code: 'ru', name: 'Russian' },
    { code: 'si', name: 'Sinhala' },
    { code: 'sk', name: 'Slovak' },
    { code: 'sq', name: 'Albanian' },
    { code: 'sr', name: 'Serbian' },
    { code: 'su', name: 'Sundanese' },
    { code: 'sv', name: 'Swedish' },
    { code: 'sw', name: 'Swahili' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'th', name: 'Thai' },
    { code: 'tl', name: 'Filipino' },
    { code: 'tr', name: 'Turkish' },
    { code: 'uk', name: 'Ukrainian' },
    { code: 'ur', name: 'Urdu' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'zh-CN', name: 'Chinese (Mandarin/China)' },
    { code: 'zh-TW', name: 'Chinese (Mandarin/Taiwan)' },
    { code: 'zh', name: 'Chinese (Mandarin)' }
  ];
  

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.type.startsWith('video/')) {
        setFile(selectedFile)
        setError('')
      } else {
        setFile(null)
        setError('Please select a valid video file')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a video file')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await translateVideo(file, targetLanguage)
      if (response.success) {
        const newTranslation = {
          id: Date.now(),
          fileName: file.name,
          targetLanguage,
          translatedVideoUrl: response.data.translated_video_url
        }
        setResult(newTranslation)
        setHistory(prev => [newTranslation, ...prev].slice(0, 3)) // Keep only the 3 most recent
        setFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <HealthIcon sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
        <Typography variant="h4" component="h1" gutterBottom color="primary" sx={{ mb: 0 }}>
          Healthcare Video Translation
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="body1" sx={{ mr: 1 }}>
          Translate existing healthcare videos into different languages while maintaining the original visual content.
        </Typography>
        <Tooltip title="This tool helps healthcare providers create multilingual versions of educational videos for diverse patient populations.">
          <InfoIcon fontSize="small" color="action" />
        </Tooltip>
      </Box>
      <Box sx={{ mb: 3 }}>
        <Chip 
          icon={<TranslateIcon />} 
          label="Supports 64 languages" 
          color="primary" 
          variant="outlined" 
          sx={{ mr: 1, mb: 1 }} 
        />
        <Chip 
          icon={<HealthIcon />} 
          label="Healthcare optimized" 
          color="secondary" 
          variant="outlined" 
          sx={{ mr: 1, mb: 1 }} 
        />
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box
                  sx={{
                    border: '2px dashed #ccc',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    backgroundColor: '#f8f9fa',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: '#f0f7ff'
                    },
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Box 
                    className="healthcare-gradient" 
                    sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      height: '4px', 
                      width: '100%' 
                    }} 
                  />
                  <input
                    type="file"
                    accept="video/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    disabled={loading}
                  />
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    {file ? file.name : 'Drag & drop your healthcare video here or click to browse'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Supported formats: MP4, MOV, AVI, etc.
                  </Typography>
                  {file && (
                    <Box sx={{ mt: 2 }}>
                      <Chip
                        label={`${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`}
                        color="primary"
                        variant="outlined"
                        onDelete={() => {
                          setFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12}>
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
            </Grid>
            
            {error && (
              <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {loading && (
              <Box sx={{ width: '100%', mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Translating your healthcare video. This may take a few minutes...
                </Typography>
                <LinearProgress 
                  variant="indeterminate" 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    '& .MuiLinearProgress-bar': {
                      backgroundImage: 'linear-gradient(135deg, #007BFF 0%, #28A745 100%)'
                    }
                  }} 
                />
              </Box>
            )}
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading || !file}
              startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <TranslateIcon />}
              sx={{ 
                mt: 3,
                backgroundImage: !loading && file ? 'linear-gradient(135deg, #007BFF 0%, #28A745 100%)' : 'none',
                '&:hover': {
                  backgroundImage: !loading && file ? 'linear-gradient(135deg, #0056b3 0%, #1e7e34 100%)' : 'none'
                }
              }}
            >
              {loading ? 'Translating...' : 'Translate Video'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {result && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <HealthIcon sx={{ fontSize: 24, color: 'secondary.main', mr: 1 }} />
            <Typography variant="h5" color="secondary" sx={{ mb: 0 }}>
              Translated Healthcare Video
            </Typography>
          </Box>
          <Paper elevation={3} sx={{ 
            p: 3, 
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box 
              className="healthcare-gradient" 
              sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                height: '4px', 
                width: '100%' 
              }} 
            />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                  Original File: {result.fileName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TranslateIcon fontSize="small" sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography variant="body1" color="primary" fontWeight="medium">
                    Translated to: {languages.find(l => l.code === result.targetLanguage)?.name || result.targetLanguage}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  This video has been translated while preserving the original visual content, making healthcare information accessible across language barriers.
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Box
                  sx={{
                    mt: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5',
                    borderRadius: 2,
                    p: 2,
                    boxShadow: 'inset 0 0 5px rgba(0,0,0,0.1)'
                  }}
                >
                  <video
                    controls
                    width="100%"
                    style={{ maxHeight: '500px', borderRadius: '8px' }}
                  >
                    <source src={result.translatedVideoUrl} type="video/mp4" />
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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <HealthIcon sx={{ fontSize: 24, color: 'primary.main', mr: 1 }} />
            <Typography variant="h5" color="primary" sx={{ mb: 0 }}>
              Recent Translations
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Your previously translated healthcare videos are available below for quick reference.
          </Typography>
          <Grid container spacing={3}>
            {history.map((item) => (
              <Grid item key={item.id} xs={12} md={6} lg={4}>
                <Paper elevation={2} sx={{ 
                  p: 2, 
                  height: '100%', 
                  borderRadius: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.1)'
                  },
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      height: '3px', 
                      backgroundColor: 'secondary.main' 
                    }} 
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight="medium">
                      {item.fileName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TranslateIcon fontSize="small" sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography variant="body2" color="primary">
                      {languages.find(l => l.code === item.targetLanguage)?.name || item.targetLanguage}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      mt: 2,
                      display: 'flex',
                      justifyContent: 'center',
                      backgroundColor: '#f5f5f5',
                      borderRadius: 2,
                      p: 1,
                      boxShadow: 'inset 0 0 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    <video
                      controls
                      width="100%"
                      style={{ maxHeight: '200px', borderRadius: '8px' }}
                    >
                      <source src={item.translatedVideoUrl} type="video/mp4" />
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

export default VideoTranslation