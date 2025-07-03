import { useNavigate } from 'react-router-dom'
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  CardMedia,
  useTheme
} from '@mui/material'
import {
  Image as ImageIcon,
  Videocam as VideocamIcon,
  Translate as TranslateIcon
} from '@mui/icons-material'

const FeatureCard = ({ title, description, icon, path, imageUrl }) => {
  const navigate = useNavigate()
  const theme = useTheme()

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <CardMedia
        component="div"
        sx={{
          pt: '56.25%', // 16:9 aspect ratio
          backgroundColor: theme.palette.primary.light + '20',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
        </Box>
      </CardMedia>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="h2" color="primary">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button 
          size="large" 
          variant="contained" 
          fullWidth 
          onClick={() => navigate(path)}
        >
          Get Started
        </Button>
      </CardActions>
    </Card>
  )
}

const Dashboard = () => {
  const theme = useTheme()

  const features = [
    {
      title: 'Image Generation',
      description: 'Generate high-quality medical and healthcare images based on text prompts. Perfect for educational materials, presentations, and visual aids.',
      icon: <ImageIcon sx={{ fontSize: 80, color: theme.palette.primary.main }} />,
      path: '/image-generation'
    },
    {
      title: 'Video Generation',
      description: 'Create informative healthcare videos with customized narration in multiple languages. Ideal for patient education and medical training.',
      icon: <VideocamIcon sx={{ fontSize: 80, color: theme.palette.primary.main }} />,
      path: '/video-generation'
    },
    {
      title: 'Video Translation',
      description: 'Translate existing healthcare videos into different languages while maintaining the original visual content. Great for reaching diverse patient populations.',
      icon: <TranslateIcon sx={{ fontSize: 80, color: theme.palette.primary.main }} />,
      path: '/video-translation'
    }
  ]

  return (
    <Box sx={{ py: 4 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom color="primary" fontWeight="bold">
          REAN Foundation Accelerator
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
          Empowering healthcare professionals with AI-driven tools for creating engaging visual content
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {features.map((feature) => (
          <Grid item key={feature.title} xs={12} sm={6} md={4}>
            <FeatureCard {...feature} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default Dashboard