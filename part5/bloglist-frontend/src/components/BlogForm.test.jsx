import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'

test('<BlogForm /> calls event handler with right details when blog created', async () => {
  const createBlog = vi.fn()
  const user = userEvent.setup()

  render(<BlogForm createBlog={createBlog} />)

  const titleInput = screen.getByPlaceholderText('title of the blog')
  const authorInput = screen.getByPlaceholderText('author of the blog')
  const urlInput = screen.getByPlaceholderText('url of the blog')
  const sendButton = screen.getByText('create')

  await user.type(titleInput, 'Canonical String Reduction')
  await user.type(authorInput, 'Edsger W. Dijkstra')
  await user.type(urlInput, 'http://www.cs.utexas.edu/canonical')
  await user.click(sendButton)

  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog.mock.calls[0][0].title).toBe('Canonical String Reduction')
  expect(createBlog.mock.calls[0][0].author).toBe('Edsger W. Dijkstra')
  expect(createBlog.mock.calls[0][0].url).toBe('http://www.cs.utexas.edu/canonical')
})
