import { Paper, Typography, Button, Box, Link as MuiLink } from '@mui/material'

const BlogView = ({ blog, handleLike, handleDelete, currentUser }) => {
  if (!blog) {
    return null
  }

  const isCreator = currentUser && blog.user && (
    (typeof blog.user === 'object' && blog.user.username === currentUser.username) ||
    blog.user === currentUser.username ||
    blog.user.id === currentUser.id
  )

  return (
    <Paper sx={{ p: 3, my: 3 }} elevation={3}>
      <Typography variant="h4" gutterBottom>
        {blog.title} {blog.author}
      </Typography>
      <Typography variant="body1" sx={{ my: 1 }}>
        <MuiLink href={blog.url} target="_blank" rel="noreferrer">
          {blog.url}
        </MuiLink>
      </Typography>
      <Box display="flex" alignItems="center" sx={{ my: 1 }}>
        <Typography variant="body1">
          {blog.likes} likes
        </Typography>
        {currentUser && (
          <Button size="small" variant="contained" sx={{ ml: 2 }} onClick={() => handleLike(blog)}>
            like
          </Button>
        )}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
        added by {blog.user ? (blog.user.name || blog.user.username) : 'anonymous'}
      </Typography>
      {isCreator && (
        <Button variant="contained" color="error" sx={{ mt: 2 }} onClick={() => handleDelete(blog)}>
          remove
        </Button>
      )}
    </Paper>
  )
}

export default BlogView
