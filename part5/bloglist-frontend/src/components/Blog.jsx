import { useState } from 'react'
import { Card, CardContent, Typography, Button, Box, Link as MuiLink } from '@mui/material'

const Blog = ({ blog, handleLike, handleDelete, currentUser }) => {
  const [visible, setVisible] = useState(false)

  const showWhenVisible = { display: visible ? '' : 'none' }

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  const isCreator = currentUser && blog.user && (
    (typeof blog.user === 'object' && blog.user.username === currentUser.username) ||
    blog.user === currentUser.username ||
    blog.user.id === currentUser.id
  )

  return (
    <Card variant="outlined" className="blog" sx={{ my: 1 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle1" className="blog-header">
            <strong>{blog.title}</strong> — <em>{blog.author}</em>
          </Typography>
          <Button size="small" variant="outlined" onClick={toggleVisibility}>
            {visible ? 'hide' : 'view'}
          </Button>
        </Box>

        <div style={showWhenVisible} className="blog-details">
          <Typography variant="body2" sx={{ mt: 1 }}>
            <MuiLink href={blog.url} target="_blank" rel="noreferrer">
              {blog.url}
            </MuiLink>
          </Typography>
          <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
            <Typography variant="body2" className="likes">
              likes {blog.likes}{' '}
            </Typography>
            {currentUser && (
              <Button size="small" variant="contained" sx={{ ml: 1 }} onClick={() => handleLike(blog)}>
                like
              </Button>
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            added by {blog.user ? (blog.user.name || blog.user.username) : 'anonymous'}
          </Typography>
          {isCreator && (
            <Button size="small" variant="contained" color="error" sx={{ mt: 1 }} onClick={() => handleDelete(blog)}>
              remove
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default Blog
