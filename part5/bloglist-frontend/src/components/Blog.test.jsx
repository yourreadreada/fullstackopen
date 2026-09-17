import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

describe('<Blog />', () => {
  let container
  const mockLikeHandler = vi.fn()
  const mockDeleteHandler = vi.fn()

  const blog = {
    title: 'Testing React components',
    author: 'Test Author',
    url: 'https://reactpatterns.com',
    likes: 42,
    user: {
      username: 'tester',
      name: 'Test User',
      id: '123'
    }
  }

  const currentUser = {
    username: 'tester',
    name: 'Test User',
    id: '123'
  }

  beforeEach(() => {
    container = render(
      <Blog
        blog={blog}
        handleLike={mockLikeHandler}
        handleDelete={mockDeleteHandler}
        currentUser={currentUser}
      />
    ).container
  })

  // Exercise 5.13
  test('renders title and author, but does not render url or likes by default', () => {
    const header = container.querySelector('.blog-header')
    expect(header).toHaveTextContent('Testing React components')
    expect(header).toHaveTextContent('Test Author')

    const details = container.querySelector('.blog-details')
    expect(details).toHaveStyle('display: none')
  })

  // Exercise 5.14
  test('url and likes are shown when view button is clicked', async () => {
    const user = userEvent.setup()
    const button = screen.getByText('view')
    await user.click(button)

    const details = container.querySelector('.blog-details')
    expect(details).not.toHaveStyle('display: none')
    expect(details).toHaveTextContent('https://reactpatterns.com')
    expect(details).toHaveTextContent('likes 42')
  })

  // Exercise 5.15
  test('clicking like button twice calls event handler twice', async () => {
    const user = userEvent.setup()
    const viewButton = screen.getByText('view')
    await user.click(viewButton)

    const likeButton = screen.getByText('like')
    await user.click(likeButton)
    await user.click(likeButton)

    expect(mockLikeHandler.mock.calls).toHaveLength(2)
  })
})
