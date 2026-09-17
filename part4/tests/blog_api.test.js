const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')

describe('when there are initially some blogs saved', () => {
  let token = null
  let testUser = null

  beforeEach(async () => {
    await User.deleteMany({})
    await Blog.deleteMany({})

    const passwordHash = await bcrypt.hash('secretpassword', 10)
    testUser = new User({ username: 'testroot', name: 'Tester', passwordHash })
    await testUser.save()

    const userForToken = { username: testUser.username, id: testUser._id }
    token = jwt.sign(userForToken, process.env.SECRET || 'secretkey')

    const blogObjects = helper.initialBlogs.map(b => new Blog({ ...b, user: testUser._id }))
    await Blog.insertMany(blogObjects)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('unique identifier property of blog posts is named id', async () => {
    const response = await api.get('/api/blogs')
    const blog = response.body[0]
    assert(blog.id !== undefined)
    assert(blog._id === undefined)
  })

  describe('addition of a new blog', () => {
    // Exercise 4.23: authenticated addition
    test('succeeds with valid data and token', async () => {
      const newBlog = {
        title: 'Full Stack Open rocks',
        author: 'Matti Luukkainen',
        url: 'https://fullstackopen.com/',
        likes: 15
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

      const titles = blogsAtEnd.map(b => b.title)
      assert(titles.includes('Full Stack Open rocks'))
    })

    // Exercise 4.23: fails with 401 Unauthorized if token missing
    test('fails with status code 401 Unauthorized if token is not provided', async () => {
      const newBlog = {
        title: 'Unauthorized blog',
        author: 'Ghost',
        url: 'https://ghost.org/',
        likes: 1
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('defaults likes to 0 if likes property is missing', async () => {
      const newBlog = {
        title: 'Blog without likes',
        author: 'Unknown',
        url: 'http://example.com/no-likes'
      }

      const response = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.likes, 0)
    })

    test('fails with status code 400 if title is missing', async () => {
      const newBlog = {
        author: 'No Title',
        url: 'http://example.com/no-title'
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('fails with status code 400 if url is missing', async () => {
      const newBlog = {
        title: 'No URL',
        author: 'Ghost Author'
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })
  })

  describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid and user is creator', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

      const titles = blogsAtEnd.map(b => b.title)
      assert(!titles.includes(blogToDelete.title))
    })
  })

  describe('updating a blog', () => {
    test('succeeds in updating the number of likes', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      const updatedData = {
        ...blogToUpdate,
        likes: blogToUpdate.likes + 10
      }

      const response = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedData)
        .expect(200)

      assert.strictEqual(response.body.likes, blogToUpdate.likes + 10)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})
