import { useState } from 'react'
import { TextField, Button, Box, Typography } from '@mui/material'

const BlogForm = ({ createBlog }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    createBlog({
      title,
      author,
      url,
    })
    setTitle('')
    setAuthor('')
    setUrl('')
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, my: 2 }}>
      <Typography variant="h6">Create a new blog</Typography>
      <TextField
        fullWidth
        margin="dense"
        label="Title"
        placeholder="title of the blog"
        value={title}
        onChange={({ target }) => setTitle(target.value)}
      />
      <TextField
        fullWidth
        margin="dense"
        label="Author"
        placeholder="author of the blog"
        value={author}
        onChange={({ target }) => setAuthor(target.value)}
      />
      <TextField
        fullWidth
        margin="dense"
        label="URL"
        placeholder="url of the blog"
        value={url}
        onChange={({ target }) => setUrl(target.value)}
      />
      <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
        create
      </Button>
    </Box>
  )
}

export default BlogForm
