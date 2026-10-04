import type { Page } from '@playwright/test';
export const usuarioDemo = {
  id: 'aa000000-0000-4000-8000-000000000001',
  email: 'cliente@example.test',
};
export async function authFixture(page: Page) {
  let session = false;
  let profile: Record<string, unknown>[] = [];
  const token = () =>
    [
      Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url'),
      Buffer.from(
        JSON.stringify({ sub: usuarioDemo.id, exp: Math.floor(Date.now() / 1000) + 3600 }),
      ).toString('base64url'),
      'fixture',
    ].join('.');
  const datos = () => ({ user: usuarioDemo, accessToken: token(), csrfToken: 'fixture-csrf' });
  await page.route('**/api/auth/**', async (r) => {
    const path = new URL(r.request().url()).pathname;
    if (path.endsWith('/public-config'))
      return r.fulfill({
        json: {
          requireEmailVerification: true,
          verifyEmailMethod: 'code',
          resetPasswordMethod: 'code',
          disableSignup: false,
          passwordMinLength: 8,
        },
      });
    if (path.endsWith('/refresh'))
      return session
        ? r.fulfill({ json: datos() })
        : r.fulfill({ status: 401, json: { message: 'Sin sesión', statusCode: 401 } });
    if (path.endsWith('/users'))
      return r.fulfill({ json: { requireEmailVerification: true, user: usuarioDemo } });
    if (path.endsWith('/email/verify')) {
      if (r.request().postDataJSON().otp !== '123456')
        return r.fulfill({ status: 400, json: { message: 'Código inválido', statusCode: 400 } });
      session = true;
      return r.fulfill({ json: datos() });
    }
    if (path.endsWith('/sessions')) {
      session = true;
      return r.fulfill({ json: datos() });
    }
    if (path.endsWith('/logout')) {
      session = false;
      return r.fulfill({ json: { success: true } });
    }
    return r.fulfill({ json: { success: true } });
  });
  await page.route('**/api/database/records/perfiles_cliente**', (r) => {
    if (r.request().method() === 'POST') {
      const body = r.request().postDataJSON();
      profile = Array.isArray(body) ? body : [body];
      return r.fulfill({ status: 201, json: profile });
    }
    return r.fulfill({ json: profile });
  });
}
