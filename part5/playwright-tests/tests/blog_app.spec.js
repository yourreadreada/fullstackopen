const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Matti Luukkainen',
        username: 'mluukkai',
        password: 'salainen'
      }
    })
    await page.goto('/')
  })

  test('Login form is shown', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible()
    await expect(page.getByLabel('Username')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await page.goto('/login')
      await page.getByLabel('Username').fill('mluukkai')
      await page.getByLabel('Password').fill('salainen')
      await page.getByRole('button', { name: 'login' }).click()

      await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.goto('/login')
      await page.getByLabel('Username').fill('mluukkai')
      await page.getByLabel('Password').fill('wrongpassword')
      await page.getByRole('button', { name: 'login' }).click()

      await expect(page.getByText('Wrong username or password')).toBeVisible()
      await expect(page.getByText('Matti Luukkainen logged in')).not.toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await page.goto('/login')
      await page.getByLabel('Username').fill('mluukkai')
      await page.getByLabel('Password').fill('salainen')
      await page.getByRole('button', { name: 'login' }).click()
      await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
    })

    test('a new blog can be created', async ({ page }) => {
      await page.getByRole('button', { name: 'create new blog' }).click()
      await page.getByPlaceholder('title of the blog').fill('A blog created by Playwright')
      await page.getByPlaceholder('author of the blog').fill('Playwright Runner')
      await page.getByPlaceholder('url of the blog').fill('http://playwright.dev')
      await page.getByRole('button', { name: 'create' }).click()

      await expect(page.getByText('A blog created by Playwright Playwright Runner')).toBeVisible()
    })

    describe('and a blog exists', () => {
      beforeEach(async ({ page }) => {
        await page.getByRole('button', { name: 'create new blog' }).click()
        await page.getByPlaceholder('title of the blog').fill('Playwright Likeable Blog')
        await page.getByPlaceholder('author of the blog').fill('Tester')
        await page.getByPlaceholder('url of the blog').fill('http://likeable.org')
        await page.getByRole('button', { name: 'create' }).click()
        await expect(page.getByText('Playwright Likeable Blog Tester')).toBeVisible()
      })

      test('it can be liked', async ({ page }) => {
        await page.getByRole('link', { name: 'Playwright Likeable Blog Tester' }).click()
        await expect(page.getByText('0 likes')).toBeVisible()
        await page.getByRole('button', { name: 'like' }).click()
        await expect(page.getByText('1 likes')).toBeVisible()
      })

      test('it can be deleted by its creator', async ({ page }) => {
        await page.getByRole('link', { name: 'Playwright Likeable Blog Tester' }).click()
        page.on('dialog', async dialog => dialog.accept())
        await page.getByRole('button', { name: 'remove' }).click()
        await expect(page.getByText('Playwright Likeable Blog Tester')).not.toBeVisible()
      })
    })
  })
})
