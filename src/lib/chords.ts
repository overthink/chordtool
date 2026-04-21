export interface ChordDefinition {
  id: string
  symbol: string
  root: string
  pitchClasses: number[]
  imageUrl: string
}

const ROOTS = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b']

const ROOT_DISPLAY: Record<string, string> = {
  c: 'C', db: 'Db', d: 'D', eb: 'Eb', e: 'E', f: 'F',
  gb: 'Gb', g: 'G', ab: 'Ab', a: 'A', bb: 'Bb', b: 'B',
}

// pianochord.org uses "d_flat", "e_flat", etc. for flat roots,
// with an underscore separator before the chord type suffix.
const ROOT_URL: Record<string, string> = {
  c: 'c', db: 'd_flat', d: 'd', eb: 'e_flat', e: 'e', f: 'f',
  gb: 'g_flat', g: 'g', ab: 'a_flat', a: 'a', bb: 'b_flat', b: 'b',
}

const FLAT_ROOTS = new Set(['db', 'eb', 'gb', 'ab', 'bb'])

function chordImageUrl(root: string, urlSuffix: string): string {
  const rootUrl = ROOT_URL[root]
  if (!urlSuffix) return `/chords/${rootUrl}.png`
  const sep = FLAT_ROOTS.has(root) ? '_' : ''
  return `/chords/${rootUrl}${sep}${urlSuffix}.png`
}

const CHORD_TYPES: Array<{
  key: string
  intervals: number[]
  displaySuffix: string
  urlSuffix: string
}> = [
  { key: 'major',  intervals: [0, 4, 7],     displaySuffix: '',      urlSuffix: ''      },
  { key: 'minor',  intervals: [0, 3, 7],     displaySuffix: 'm',     urlSuffix: 'm'     },
  { key: 'dom7',   intervals: [0, 4, 7, 10], displaySuffix: '7',     urlSuffix: '7'     },
  { key: 'min7',   intervals: [0, 3, 7, 10], displaySuffix: 'm7',    urlSuffix: 'm7'    },
  { key: 'maj7',   intervals: [0, 4, 7, 11], displaySuffix: 'maj7',  urlSuffix: 'maj7'  },
  { key: 'dim',    intervals: [0, 3, 6],     displaySuffix: 'dim',   urlSuffix: 'dim'   },
  { key: 'aug',    intervals: [0, 4, 8],     displaySuffix: 'aug',   urlSuffix: 'aug'   },
  { key: 'dim7',   intervals: [0, 3, 6, 9],  displaySuffix: 'dim7',  urlSuffix: 'dim7'  },
  { key: 'hdim',   intervals: [0, 3, 6, 10], displaySuffix: 'm7b5',  urlSuffix: 'm7b5'  },
  { key: 'sus2',   intervals: [0, 2, 7],     displaySuffix: 'sus2',  urlSuffix: 'sus2'  },
  { key: 'sus4',   intervals: [0, 5, 7],     displaySuffix: 'sus4',  urlSuffix: 'sus4'  },
  { key: 'add9',   intervals: [0, 2, 4, 7],  displaySuffix: 'add9',  urlSuffix: 'add9'  },
]

function buildChords(): ChordDefinition[] {
  const chords: ChordDefinition[] = []
  for (const [rootIdx, root] of ROOTS.entries()) {
    for (const type of CHORD_TYPES) {
      const id = root + type.urlSuffix
      const symbol = ROOT_DISPLAY[root] + type.displaySuffix
      const pitchClasses = type.intervals.map(i => (rootIdx + i) % 12)
      chords.push({
        id,
        symbol,
        root,
        pitchClasses,
        imageUrl: chordImageUrl(root, type.urlSuffix),
      })
    }
  }
  return chords
}

export const ALL_CHORDS: ChordDefinition[] = buildChords()

export const CHORD_BY_ID: Map<string, ChordDefinition> = new Map(
  ALL_CHORDS.map(c => [c.id, c])
)
