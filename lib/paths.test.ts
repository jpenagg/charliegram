import { describe, expect, it } from 'vitest'
import {
  BLOB_PATH_RE,
  buildPhotoName,
  formatDay,
  formatMonth,
  parsePhotoPath,
  slugify,
  thumbPathFor,
  wallClockMs,
} from './paths'

describe('photo names', () => {
  const taken = Date.UTC(2026, 9, 12, 9, 30) // Oct 12 2026, 09:30 wall clock
  const name = buildPhotoName(taken, 2560, 1707, 'a1b2c3d4')

  it('round-trips through parsePhotoPath', () => {
    const photo = parsePhotoPath(`photos/spring-soccer/${name}`)
    expect(photo).toEqual({
      id: `photos/spring-soccer/${name}`,
      name,
      album: 'spring-soccer',
      src: `/api/photo/photos/spring-soccer/${name}`,
      thumb: `/api/photo/thumbs/spring-soccer/${name}`,
      width: 2560,
      height: 1707,
      takenAt: '2026-10-12T09:30:00.000Z',
    })
  })

  it('maps a photo to its thumbnail', () => {
    expect(thumbPathFor(`photos/family/${name}`)).toBe(`thumbs/family/${name}`)
  })

  it('accepts thumbs as blob paths but not as photos', () => {
    expect(BLOB_PATH_RE.test(`thumbs/family/${name}`)).toBe(true)
    expect(parsePhotoPath(`thumbs/family/${name}`)).toBeNull()
  })

  it.each([
    'photos/../etc/passwd',
    `photos/Family/${name}`,
    `photos/family/sub/${name}`,
    `photos/family/${name.replace('.jpg', '.png')}`,
    `other/family/${name}`,
    `photos/family/123-a1b2c3d4-10x10.jpg`,
    `photos/-family/${name}`,
  ])('rejects %s', path => {
    expect(BLOB_PATH_RE.test(path)).toBe(false)
  })
})

describe('slugify', () => {
  it.each([
    ['Spring Soccer', 'spring-soccer'],
    ['  Café trips!! ', 'cafe-trips'],
    ['2026 / Birthday', '2026-birthday'],
    ['---', ''],
  ])('%s -> %s', (input, slug) => {
    expect(slugify(input)).toBe(slug)
  })
})

describe('dates', () => {
  it('keeps the camera wall-clock time regardless of time zone', () => {
    // 11:30pm on Oct 31, local time: must stay in October.
    const local = new Date(2026, 9, 31, 23, 30)
    const iso = new Date(wallClockMs(local)).toISOString()
    expect(formatMonth(iso)).toBe('October 2026')
    expect(formatDay(iso)).toBe('Saturday, October 31, 2026')
  })
})
