import { useState, useImperativeHandle } from 'react'
import { Button, Box } from '@mui/material'

const Togglable = (props) => {
  const [visible, setVisible] = useState(false)

  const hideWhenVisible = { display: visible ? 'none' : '' }
  const showWhenVisible = { display: visible ? '' : 'none' }

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  if (props.ref) {
    useImperativeHandle(props.ref, () => {
      return { toggleVisibility }
    })
  }

  return (
    <Box sx={{ my: 2 }}>
      <div style={hideWhenVisible}>
        <Button variant="contained" onClick={toggleVisibility}>
          {props.buttonLabel}
        </Button>
      </div>
      <div style={showWhenVisible}>
        {props.children}
        <Button variant="outlined" color="secondary" onClick={toggleVisibility} sx={{ mt: 1 }}>
          cancel
        </Button>
      </div>
    </Box>
  )
}

export default Togglable
