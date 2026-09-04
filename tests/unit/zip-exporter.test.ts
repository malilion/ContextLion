import { describe, it, expect } from 'vitest'
import {
  calculateCrc32,
  buildZipArchive,
  exportContextPackToZip,
} from '../../lib/export/zip-exporter'
import { createContextPack } from '../../lib/context/context-pack-builder'

describe('ZIP Exporter module', () => {
  it('calculates accurate CRC32 for known inputs', () => {
    const data1 = new TextEncoder().encode('123456789')
    // Standard test vector: CRC32 of '123456789' is 0xcbf43926
    expect(calculateCrc32(data1)).toBe(0xcbf43926)

    const data2 = new TextEncoder().encode('Hello, ContextLion!')
    expect(calculateCrc32(data2)).toBeGreaterThan(0)
  })

  it('builds a valid PKZIP binary structure for files', () => {
    const zipBytes = buildZipArchive([
      { name: 'hello.txt', content: 'Hello World' },
      { name: 'docs/test.md', content: '# Testing Markdown' },
    ])

    expect(zipBytes).toBeInstanceOf(Uint8Array)
    expect(zipBytes.length).toBeGreaterThan(100)

    // Verify Local File Header signature: PK\x03\x04 (0x04034b50 Little Endian)
    expect(zipBytes[0]).toBe(0x50)
    expect(zipBytes[1]).toBe(0x4b)
    expect(zipBytes[2]).toBe(0x03)
    expect(zipBytes[3]).toBe(0x04)

    // Verify End of Central Directory signature: PK\x05\x06 (0x06054b50) is near end
    const last22 = zipBytes.subarray(zipBytes.length - 22)
    expect(last22[0]).toBe(0x50)
    expect(last22[1]).toBe(0x4b)
    expect(last22[2]).toBe(0x05)
    expect(last22[3]).toBe(0x06)
  })

  it('exports ContextPack into a downloadable Blob with expected files', async () => {
    const pack = createContextPack('Test Multi Tab Pack', [
      {
        id: '1',
        tabId: 10,
        title: 'Source Alpha',
        url: 'https://alpha.com',
        markdown: 'Content of Alpha',
        plainText: 'Content of Alpha',
        wordCount: 3,
        estimatedTokens: 4,
        status: 'success',
      },
    ])

    const blob = exportContextPackToZip(pack)
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('application/zip')
    expect(blob.size).toBeGreaterThan(200)

    const arrayBuffer = await blob.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    const decoder = new TextDecoder()
    const rawString = decoder.decode(bytes)

    expect(rawString).toContain('README.md')
    expect(rawString).toContain('all-sources-combined.md')
    expect(rawString).toContain('sources/01-Source Alpha.md')
  })
})
