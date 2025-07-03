import { Box, Typography, Container, Link, Divider } from '@mui/material'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.background.paper,
        borderTop: (theme) => `1px solid ${theme.palette.divider}`
      }}
    >
      <Container maxWidth="lg">
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'center', md: 'flex-start' } }}>
          <Box sx={{ mb: { xs: 2, md: 0 } }}>
            <Typography variant="h6" color="primary" gutterBottom>
              REAN Foundation Accelerator
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Empowering healthcare with AI-driven solutions
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-end' } }}>
            <Typography variant="body2" color="text.secondary">
              © {currentYear} REAN Foundation. All rights reserved.
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Link href="#" color="primary" sx={{ mx: 1 }}>
                Privacy Policy
              </Link>
              <Link href="#" color="primary" sx={{ mx: 1 }}>
                Terms of Service
              </Link>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer