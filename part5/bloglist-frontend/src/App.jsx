import { useState, useEffect, useRef } from 'react'
import { Routes, Route, Link, useNavigate, useMatch } from 'react-router-dom'
import { Container, AppBar, Toolbar, Button, Typography, TextField, Box, Paper, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material'
import blogService from './services/blogs'
import loginService from './services/login'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import BlogView from './components/BlogView'
import Notification from './components/Notification'
import Togglable from './components/Togglable'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState(null)

  const blogFormRef = useRef()
  const navigate = useNavigate()

  useEffect(() => {
    blogService.getAll().then(initialBlogs => {
      setBlogs(initialBlogs)
    })
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const savedUser = JSON.parse(loggedUserJSON)
      setUser(savedUser)
      blogService.setToken(savedUser.token)
    }
  }, [])

  const notify = (text, type = 'success') => {
    setNotification({ text, type })
    setTimeout(() => {
      setNotification(null)
    }, 5000)
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const loggedUser = await loginService.login({ username, password })
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(loggedUser))
      blogService.setToken(loggedUser.token)
      setUser(loggedUser)
      setUsername('')
      setPassword('')
      notify(`Welcome ${loggedUser.name}!`)
      navigate('/')
    } catch {
      notify('Wrong username or password', 'error')
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    blogService.setToken(null)
    setUser(null)
    notify('Logged out successfully')
    navigate('/')
  }

  const addBlog = async (blogObject) => {
    try {
      if (blogFormRef.current) {
        blogFormRef.current.toggleVisibility()
      }
      const returnedBlog = await blogService.create(blogObject)
      setBlogs(blogs.concat(returnedBlog))
      notify(`a new blog '${returnedBlog.title}' by ${returnedBlog.author} added`)
      navigate('/')
    } catch {
      notify('Failed to create blog', 'error')
    }
  }

  const handleLike = async (blog) => {
    try {
      const updatedBlogData = {
        title: blog.title,
        author: blog.author,
        url: blog.url,
        likes: (blog.likes || 0) + 1,
        user: blog.user ? (blog.user.id || blog.user) : undefined
      }

      const returnedBlog = await blogService.update(blog.id, updatedBlogData)
      setBlogs(blogs.map(b => b.id !== blog.id ? b : { ...returnedBlog, user: blog.user }))
    } catch {
      notify('Error updating likes', 'error')
    }
  }

  const handleDelete = async (blog) => {
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}?`)) {
      try {
        await blogService.remove(blog.id)
        setBlogs(blogs.filter(b => b.id !== blog.id))
        notify(`Blog '${blog.title}' removed`)
        navigate('/')
      } catch {
        notify('Failed to delete blog', 'error')
      }
    }
  }

  const sortedBlogs = [...blogs].sort((a, b) => (b.likes || 0) - (a.likes || 0))

  const match = useMatch('/blogs/:id')
  const matchedBlog = match
    ? blogs.find(b => b.id === match.params.id)
    : null

  const navBtnStyle = { color: 'inherit', textTransform: 'none', mx: 1 }

  return (
    <Container>
      <AppBar position="static" sx={{ mb: 3 }}>
        <Toolbar>
          <Button component={Link} to="/" sx={navBtnStyle}>blogs</Button>
          {user && <Button component={Link} to="/create" sx={navBtnStyle}>create new</Button>}
          <Box sx={{ flexGrow: 1 }} />
          {user ? (
            <Box display="flex" alignItems="center">
              <Typography variant="body2" sx={{ mr: 2 }}>
                {user.name} logged in
              </Typography>
              <Button color="inherit" variant="outlined" size="small" onClick={handleLogout}>
                logout
              </Button>
            </Box>
          ) : (
            <Button component={Link} to="/login" sx={navBtnStyle}>login</Button>
          )}
        </Toolbar>
      </AppBar>

      <Typography variant="h4" gutterBottom>
        Blog Application
      </Typography>

      <Notification notification={notification} />

      <Routes>
        <Route path="/" element={
          <div>
            {user && (
              <Togglable buttonLabel="create new blog" ref={blogFormRef}>
                <BlogForm createBlog={addBlog} />
              </Togglable>
            )}
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableBody>
                  {sortedBlogs.map(blog => (
                    <TableRow key={blog.id}>
                      <TableCell>
                        <Link to={`/blogs/${blog.id}`} style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 500 }}>
                          {blog.title} {blog.author}
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        } />

        <Route path="/blogs/:id" element={
          <BlogView
            blog={matchedBlog}
            handleLike={handleLike}
            handleDelete={handleDelete}
            currentUser={user}
          />
        } />

        <Route path="/create" element={
          user ? (
            <Paper sx={{ p: 3, maxWidth: 500, my: 2 }}>
              <BlogForm createBlog={addBlog} />
            </Paper>
          ) : (
            <Typography variant="body1">Please log in to create blogs.</Typography>
          )
        } />

        <Route path="/login" element={
          <Box component="form" onSubmit={handleLogin} sx={{ maxWidth: 360, mt: 3 }}>
            <Typography variant="h5" gutterBottom>Log in</Typography>
            <TextField
              fullWidth
              margin="normal"
              label="Username"
              value={username}
              onChange={({ target }) => setUsername(target.value)}
            />
            <TextField
              fullWidth
              margin="normal"
              type="password"
              label="Password"
              value={password}
              onChange={({ target }) => setPassword(target.value)}
            />
            <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
              login
            </Button>
          </Box>
        } />
      </Routes>
    </Container>
  )
}

export default App
