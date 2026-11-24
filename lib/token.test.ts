import { describe, expect, it } from 'vitest'
import { SignJWT } from 'jose'
import { authConfigFromEnv, roleForPassword, signSession, verifySession, type AuthConfig } from './token'

const config: AuthConfig = {
  secret: 'x'.repeat(40),
  familyPassword: 'grandma-loves-soccer',
  adminPassword: 'papa-admin-pass',
}

describe('roleForPassword', () => {
  it('recognizes each password', async () => {
    expect(await roleForPassword('grandma-loves-soccer', config)).toBe('family')
    expect(await roleForPassword('papa-admin-pass', config)).toBe('admin')
    expect(await roleForPassword('wrong', config)).toBeNull()
    expect(await roleForPassword('', config)).toBeNull()
  })
})

describe('sessions', () => {
  it('round-trips a session', async () => {
    const token = await signSession('family', config)
    expect(await verifySession(token, config)).toEqual({ role: 'family' })
  })

  it('rejects missing, garbage and wrongly signed tokens', async () => {
    expect(await verifySession(undefined, config)).toBeNull()
    expect(await verifySession('not-a-jwt', config)).toBeNull()
    const other = await signSession('admin', { ...config, secret: 'y'.repeat(40) })
    expect(await verifySession(other, config)).toBeNull()
  })

  it('signs out family sessions when the family password changes', async () => {
    const family = await signSession('family', config)
    const admin = await signSession('admin', config)
    const rotated = { ...config, familyPassword: 'new-family-pass' }
    expect(await verifySession(family, rotated)).toBeNull()
    expect(await verifySession(admin, rotated)).toEqual({ role: 'admin' })
  })

  it('rejects a forged role claim', async () => {
    const forged = await new SignJWT({ role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1h')
      .sign(new TextEncoder().encode(config.secret))
    // Right key but no password-version claim: still rejected.
    expect(await verifySession(forged, config)).toBeNull()
  })
})

describe('authConfigFromEnv', () => {
  const env = { SESSION_SECRET: 'x'.repeat(40), FAMILY_PASSWORD: 'a', ADMIN_PASSWORD: 'b' }

  it('reads valid config', () => {
    expect(authConfigFromEnv(env)).toEqual({ secret: env.SESSION_SECRET, familyPassword: 'a', adminPassword: 'b' })
  })

  it('fails closed on bad config', () => {
    expect(() => authConfigFromEnv({ ...env, FAMILY_PASSWORD: undefined })).toThrow(/FAMILY_PASSWORD/)
    expect(() => authConfigFromEnv({ ...env, SESSION_SECRET: 'short' })).toThrow(/32/)
    expect(() => authConfigFromEnv({ ...env, ADMIN_PASSWORD: 'a' })).toThrow(/differ/)
  })
})
