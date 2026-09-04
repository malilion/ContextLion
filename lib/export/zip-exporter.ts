import type { ContextPack } from '../../types/context-pack'

/**
 * Pre-computed CRC32 lookup table for standard IEEE 802.3 polynomial.
 */
const CRC32_TABLE = new Uint32Array(256)
for (let i = 0; i < 256; i++) {
  let c = i
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  CRC32_TABLE[i] = c >>> 0
}

/**
 * Calculates CRC-32 checksum of a byte array.
 */
export function calculateCrc32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i++) {
    const byte = data[i] ?? 0
    const tableVal = CRC32_TABLE[(crc ^ byte) & 0xff] ?? 0
    crc = (crc >>> 8) ^ tableVal
  }
  return (crc ^ 0xffffffff) >>> 0
}

function toDosDateTime(d: Date = new Date()) {
  const year = Math.max(1980, d.getFullYear())
  const dosDate = ((year - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()
  const dosTime = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)
  return { dosDate, dosTime }
}

export interface ZipFileEntry {
  name: string
  content: string | Uint8Array
}

/**
 * Builds an uncompressed (Store method 0) standard PKZIP archive.
 * Zero external dependencies, 100% standards compliant.
 */
export function buildZipArchive(files: ZipFileEntry[]): Uint8Array {
  const encoder = new TextEncoder()
  const { dosDate, dosTime } = toDosDateTime(new Date())

  interface ProcessedFile {
    nameBytes: Uint8Array
    data: Uint8Array
    crc: number
    offset: number
  }

  const processed: ProcessedFile[] = []
  let totalLocalSize = 0

  for (const file of files) {
    const nameBytes = encoder.encode(file.name.replace(/\\/g, '/'))
    const data = typeof file.content === 'string' ? encoder.encode(file.content) : file.content
    const crc = calculateCrc32(data)
    const offset = totalLocalSize

    processed.push({ nameBytes, data, crc, offset })

    // 30 bytes header + nameBytes length + data length
    totalLocalSize += 30 + nameBytes.length + data.length
  }

  let centralDirSize = 0
  for (const pf of processed) {
    // 46 bytes header + nameBytes length
    centralDirSize += 46 + pf.nameBytes.length
  }

  const totalArchiveSize = totalLocalSize + centralDirSize + 22 // 22 bytes EOCD
  const buffer = new Uint8Array(totalArchiveSize)
  const view = new DataView(buffer.buffer)

  let cursor = 0

  // 1. Write Local File Headers and Data
  for (const pf of processed) {
    // Signature: 0x04034b50
    view.setUint32(cursor, 0x04034b50, true)
    view.setUint16(cursor + 4, 20, true) // Version needed (2.0)
    view.setUint16(cursor + 6, 0x0800, true) // General purpose bit flag (UTF-8 filename)
    view.setUint16(cursor + 8, 0, true) // Compression method: 0 (Store)
    view.setUint16(cursor + 10, dosTime, true)
    view.setUint16(cursor + 12, dosDate, true)
    view.setUint32(cursor + 14, pf.crc, true)
    view.setUint32(cursor + 18, pf.data.length, true) // Compressed size
    view.setUint32(cursor + 22, pf.data.length, true) // Uncompressed size
    view.setUint16(cursor + 26, pf.nameBytes.length, true)
    view.setUint16(cursor + 28, 0, true) // Extra field length

    cursor += 30
    buffer.set(pf.nameBytes, cursor)
    cursor += pf.nameBytes.length
    buffer.set(pf.data, cursor)
    cursor += pf.data.length
  }

  const centralDirStart = cursor

  // 2. Write Central Directory Headers
  for (const pf of processed) {
    // Signature: 0x02014b50
    view.setUint32(cursor, 0x02014b50, true)
    view.setUint16(cursor + 4, 0x0314, true) // Version made by (UNIX / 2.0)
    view.setUint16(cursor + 6, 20, true) // Version needed
    view.setUint16(cursor + 8, 0x0800, true) // UTF-8 flag
    view.setUint16(cursor + 10, 0, true) // Compression: Store
    view.setUint16(cursor + 12, dosTime, true)
    view.setUint16(cursor + 14, dosDate, true)
    view.setUint32(cursor + 16, pf.crc, true)
    view.setUint32(cursor + 20, pf.data.length, true)
    view.setUint32(cursor + 24, pf.data.length, true)
    view.setUint16(cursor + 28, pf.nameBytes.length, true)
    view.setUint16(cursor + 30, 0, true) // Extra field length
    view.setUint16(cursor + 32, 0, true) // Comment length
    view.setUint16(cursor + 34, 0, true) // Disk number start
    view.setUint16(cursor + 36, 0, true) // Internal attributes
    view.setUint32(cursor + 38, 0o100644 << 16, true) // External attributes (regular file rw-r--r--)
    view.setUint32(cursor + 42, pf.offset, true) // Relative offset of local header

    cursor += 46
    buffer.set(pf.nameBytes, cursor)
    cursor += pf.nameBytes.length
  }

  // 3. Write End of Central Directory (EOCD) Record
  // Signature: 0x06054b50
  view.setUint32(cursor, 0x06054b50, true)
  view.setUint16(cursor + 4, 0, true) // Number of disk
  view.setUint16(cursor + 6, 0, true) // Disk where central directory starts
  view.setUint16(cursor + 8, processed.length, true) // Number of records on this disk
  view.setUint16(cursor + 10, processed.length, true) // Total records
  view.setUint32(cursor + 12, centralDirSize, true)
  view.setUint32(cursor + 16, centralDirStart, true)
  view.setUint16(cursor + 20, 0, true) // ZIP comment length

  return buffer
}

function sanitizePath(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '-').trim() || 'source'
}

/**
 * Creates a ZIP archive containing the complete Context Pack structure:
 * - README.md (Summary and metadata)
 * - all-sources-combined.md (The single unified AI context file)
 * - sources/01-Title.md, sources/02-Title.md, etc.
 */
export function exportContextPackToZip(pack: ContextPack): Blob {
  const files: ZipFileEntry[] = []

  // 1. README.md
  const readmeContent = [
    `# ${pack.title}`,
    '',
    `Generated by ContextLion on ${new Date(pack.capturedAt).toISOString()}`,
    '',
    `Total Sources: ${pack.successfulSources} (out of ${pack.totalSources} attempted)`,
    `Total Word Count: ${pack.totalWords}`,
    `Total Estimated Tokens: ~${pack.totalTokens}`,
    '',
    '## Contents',
    '- `all-sources-combined.md`: Consolidated prompt-ready Context Pack',
    '- `sources/`: Individual markdown files for each extracted source',
  ].join('\n')

  files.push({
    name: 'README.md',
    content: readmeContent,
  })

  // 2. all-sources-combined.md
  files.push({
    name: 'all-sources-combined.md',
    content: pack.markdown,
  })

  // 3. Individual source files
  let idx = 1
  for (const src of pack.sources) {
    const padIdx = String(idx).padStart(2, '0')
    const safeTitle = sanitizePath(src.title).slice(0, 40)
    const filename = `sources/${padIdx}-${safeTitle}.md`

    const lines: string[] = [`# ${src.title || 'Untitled'}`, '']
    if (src.url) lines.push(`Source: ${src.url}`)
    if (src.author) lines.push(`Author: ${src.author}`)
    if (src.publishedAt) lines.push(`Published: ${src.publishedAt}`)
    lines.push(`Status: ${src.status}`)
    lines.push('', '---', '')
    lines.push(
      src.status === 'success'
        ? src.markdown
        : `Extraction failed: ${src.errorMessage || 'Unable to read content'}`
    )

    files.push({
      name: filename,
      content: lines.join('\n'),
    })

    idx++
  }

  const zipBytes = buildZipArchive(files)
  return new Blob([zipBytes as unknown as BlobPart], { type: 'application/zip' })
}
