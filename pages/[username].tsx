import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { Box, CircularProgress } from '@mui/material'

// This page now redirects to the new POS implementation
function LegacyUserPage() {
  const router = useRouter()
  const { username } = router.query

  useEffect(() => {
    if (username) {
      // Redirect to new POS page with username
      router.replace(`/pos?username=${username}`)
    }
  }, [username, router])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress />
    </Box>
  )
}

export default LegacyUserPage