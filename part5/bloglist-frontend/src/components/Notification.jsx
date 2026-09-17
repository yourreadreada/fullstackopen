import { Alert } from '@mui/material'

const Notification = ({ notification }) => {
  if (!notification || !notification.text) {
    return null
  }

  return (
    <Alert severity={notification.type === 'error' ? 'error' : 'success'} sx={{ my: 2 }}>
      {notification.text}
    </Alert>
  )
}

export default Notification
