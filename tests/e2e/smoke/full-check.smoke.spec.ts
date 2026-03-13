import { expect, Page, Route, test } from '@playwright/test'

const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.signature'
const ONE_PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X3e8AAAAASUVORK5CYII=',
  'base64'
)

const defaultMe = {
  userId: 1,
  email: 'qa@ictroot.uk',
  name: 'qa-user',
  isBlocked: false,
}

const defaultProfile = {
  id: 1,
  userName: 'qa_user',
  firstName: 'QA',
  lastName: 'User',
  city: 'Yerevan',
  country: 'Armenia',
  region: 'AM',
  dateOfBirth: '2000-01-01T00:00:00.000Z',
  aboutMe: 'E2E smoke profile',
  avatars: [],
}

const countriesResponse = {
  error: false,
  msg: 'success',
  data: [
    {
      country: 'Armenia',
      iso2: 'AM',
      iso3: 'ARM',
      cities: ['Yerevan', 'Gyumri'],
    },
  ],
}

const json = (route: Route, data: unknown, status = 200) =>
  route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(data),
  })

const apiPath = (path: string) => `**/api/proxy${path}`

async function stubCountries(page: Page) {
  await page.route('**/countriesnow.space/api/v0.1/countries', route =>
    json(route, countriesResponse)
  )
}

async function stubAuthRestore(page: Page) {
  await page.route(apiPath('/v1/auth/update-tokens'), route =>
    json(route, { accessToken: ACCESS_TOKEN })
  )
  await page.route(apiPath('/v1/auth/me'), route => json(route, defaultMe))
  await stubCountries(page)
}

test.describe('Full check smoke @smoke', () => {
  test('auth login redirects user to profile settings when profile is missing', async ({
    page,
  }) => {
    let profileCallCount = 0

    await page.route(apiPath('/v1/auth/login'), route => json(route, { accessToken: ACCESS_TOKEN }))
    await page.route(apiPath('/v1/auth/me'), route => json(route, defaultMe))
    await page.route(apiPath('/v1/users/profile'), route => {
      profileCallCount += 1

      if (profileCallCount === 1) {
        return json(route, null)
      }

      return json(route, defaultProfile)
    })
    await stubCountries(page)

    await page.goto('/auth/login')
    await page.getByLabel('Email').fill('qa@ictroot.uk')
    await page.locator('input[name="password"]').fill('QaPassword123!')
    await page.getByRole('button', { name: 'Sign In' }).click()

    await expect(page).toHaveURL(/\/profile\/1\/settings\/general/)
  })

  test('logout shows confirmation and redirects to login after Yes', async ({ page }) => {
    await stubAuthRestore(page)
    await page.route(apiPath('/v1/auth/logout'), route =>
      route.fulfill({ status: 200, body: '{}' })
    )

    await page.goto('/search')

    await expect(page.getByRole('button', { name: 'Log Out' })).toBeVisible()
    await page.getByRole('button', { name: 'Log Out' }).click()
    await expect(page.getByText(/Are you really want to log out of your account/i)).toBeVisible()

    await page.getByRole('button', { name: 'Yes' }).click()
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('forgot password keeps reCAPTCHA gate before send', async ({ page }) => {
    await page.goto('/auth/password-recovery')

    const sendButton = page.getByRole('button', { name: 'Send Link' })

    await expect(sendButton).toBeDisabled()
    await page.getByLabel('Email').fill('qa@ictroot.uk')
    await page.keyboard.press('Tab')
    await expect(sendButton).toBeDisabled()
  })

  test('create post asks confirmation on close after file was selected', async ({ page }) => {
    await stubAuthRestore(page)
    await page.goto('/create')

    await expect(page.getByText('Add Photo')).toBeVisible()

    await page.locator('input[type="file"]').first().setInputFiles({
      name: 'photo.png',
      mimeType: 'image/png',
      buffer: ONE_PIXEL_PNG,
    })

    await expect(page.getByText('Cropping')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(
      page.getByText(/Do you really want to close the creation of a publication\?/i)
    ).toBeVisible()
  })

  test('profile settings keeps required field validation on First name', async ({ page }) => {
    await stubAuthRestore(page)
    await page.route(apiPath('/v1/users/profile'), route => json(route, defaultProfile))

    await page.goto('/profile/1/settings/general')
    await expect(page.getByLabel('First name')).toBeVisible()

    await page.getByLabel('First name').fill('')
    await page.keyboard.press('Tab')

    await expect(page.getByText('Required')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Save Changes' })).toBeDisabled()
  })
})
