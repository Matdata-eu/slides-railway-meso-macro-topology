// Toy corridor for the mesoscopic topology slides: three operational points on one line.
//
//          Vest                       Stasjon                                    Øst
//        ╭─loop─╮           ╭──── loop ──Y0─────╮   yard (Y)            ╭─loop─╮
//  A ──V1────────V2── SoL ──S1════ Track 1 ═════S3── throat ──SF── SoL ──ØI──Ø1────────Ø2── B
//                    (block post)                         freight (F) ╱      ╲ Industri (I)
//
// - Vest: one primary location (V).
// - Stasjon: passenger area (P), maintenance yard (Y, reached from the loop, facing west)
//   and freight terminal (F, lead off the east throat, facing east). The throat belongs to no PL.
// - Øst: passenger area (Ø) and an industrial siding (I) that branches off west of Øst, facing west.
//
// Navigability decides which primary locations are neighbours, not the operational point they sit in.
import { type Pt } from './net'

export type PlId = 'V' | 'P' | 'Y' | 'F' | 'Ø' | 'I'
export type OpId = 'Vest' | 'Stasjon' | 'Øst'
export interface MNode { id: string; kind: 'end' | 'switch' | 'buffer'; p: Pt }
export interface MEl { id: string; from: string; to: string; pts: Pt[]; pl: PlId | null; op: OpId | null }

export const mnodes: Record<string, MNode> = {
  nW: { id: 'nW', kind: 'end', p: [20, 170] },
  V1: { id: 'V1', kind: 'switch', p: [80, 170] },
  V2: { id: 'V2', kind: 'switch', p: [180, 170] },
  S1: { id: 'S1', kind: 'switch', p: [340, 170] },
  Y0: { id: 'Y0', kind: 'switch', p: [520, 128] },
  YS: { id: 'YS', kind: 'switch', p: [555, 95] },
  yb1: { id: 'yb1', kind: 'buffer', p: [665, 62] },
  yb2: { id: 'yb2', kind: 'buffer', p: [665, 95] },
  S3: { id: 'S3', kind: 'switch', p: [620, 170] },
  SF: { id: 'SF', kind: 'switch', p: [690, 170] },
  FS: { id: 'FS', kind: 'switch', p: [655, 205] },
  fb1: { id: 'fb1', kind: 'buffer', p: [470, 205] },
  fb2: { id: 'fb2', kind: 'buffer', p: [470, 235] },
  ØI: { id: 'ØI', kind: 'switch', p: [800, 170] },
  ib: { id: 'ib', kind: 'buffer', p: [930, 215] },
  Ø1: { id: 'Ø1', kind: 'switch', p: [850, 170] },
  Ø2: { id: 'Ø2', kind: 'switch', p: [950, 170] },
  nE: { id: 'nE', kind: 'end', p: [990, 170] },
}
const P = (id: string) => mnodes[id].p

export const melements: MEl[] = [
  { id: 'w0', from: 'nW', to: 'V1', pts: [P('nW'), P('V1')], pl: null, op: null },
  { id: 'vm', from: 'V1', to: 'V2', pts: [P('V1'), P('V2')], pl: 'V', op: 'Vest' },
  { id: 'vl', from: 'V1', to: 'V2', pts: [P('V1'), [100, 135], [160, 135], P('V2')], pl: 'V', op: 'Vest' },
  { id: 'sol1', from: 'V2', to: 'S1', pts: [P('V2'), P('S1')], pl: null, op: null },
  { id: 't1', from: 'S1', to: 'S3', pts: [P('S1'), P('S3')], pl: 'P', op: 'Stasjon' },
  { id: 't2a', from: 'S1', to: 'Y0', pts: [P('S1'), [380, 128], P('Y0')], pl: 'P', op: 'Stasjon' },
  { id: 't2b', from: 'Y0', to: 'S3', pts: [P('Y0'), [580, 128], P('S3')], pl: 'P', op: 'Stasjon' },
  { id: 'y0', from: 'Y0', to: 'YS', pts: [P('Y0'), P('YS')], pl: 'Y', op: 'Stasjon' },
  { id: 'y1', from: 'YS', to: 'yb1', pts: [P('YS'), [580, 62], P('yb1')], pl: 'Y', op: 'Stasjon' },
  { id: 'y2', from: 'YS', to: 'yb2', pts: [P('YS'), P('yb2')], pl: 'Y', op: 'Stasjon' },
  { id: 'thr', from: 'S3', to: 'SF', pts: [P('S3'), P('SF')], pl: null, op: 'Stasjon' },
  { id: 'f0', from: 'SF', to: 'FS', pts: [P('SF'), P('FS')], pl: 'F', op: 'Stasjon' },
  { id: 'f1', from: 'FS', to: 'fb1', pts: [P('FS'), P('fb1')], pl: 'F', op: 'Stasjon' },
  { id: 'f2', from: 'FS', to: 'fb2', pts: [P('FS'), [625, 235], P('fb2')], pl: 'F', op: 'Stasjon' },
  { id: 'sol2', from: 'SF', to: 'ØI', pts: [P('SF'), P('ØI')], pl: null, op: null },
  { id: 'i0', from: 'ØI', to: 'ib', pts: [P('ØI'), [840, 215], P('ib')], pl: 'I', op: 'Øst' },
  { id: 'm1', from: 'ØI', to: 'Ø1', pts: [P('ØI'), P('Ø1')], pl: 'Ø', op: 'Øst' },
  { id: 'm2', from: 'Ø1', to: 'Ø2', pts: [P('Ø1'), P('Ø2')], pl: 'Ø', op: 'Øst' },
  { id: 'ol', from: 'Ø1', to: 'Ø2', pts: [P('Ø1'), [870, 135], [930, 135], P('Ø2')], pl: 'Ø', op: 'Øst' },
  { id: 'e0', from: 'Ø2', to: 'nE', pts: [P('Ø2'), P('nE')], pl: null, op: null },
]
export const melById = Object.fromEntries(melements.map(e => [e.id, e]))

/** navigable pairs per switch: a train can pass from one element to the other (both ways) */
export const mnavigable: Record<string, [string, string][]> = {
  V1: [['w0', 'vm'], ['w0', 'vl']],
  V2: [['vm', 'sol1'], ['vl', 'sol1']],
  S1: [['sol1', 't1'], ['sol1', 't2a']],
  Y0: [['t2a', 't2b'], ['t2a', 'y0']],
  YS: [['y0', 'y1'], ['y0', 'y2']],
  S3: [['t1', 'thr'], ['t2b', 'thr']],
  SF: [['thr', 'sol2'], ['f0', 'sol2']],
  FS: [['f0', 'f1'], ['f0', 'f2']],
  ØI: [['sol2', 'm1'], ['sol2', 'i0']],
  Ø1: [['m1', 'm2'], ['m1', 'ol']],
  Ø2: [['m2', 'e0'], ['ol', 'e0']],
}

// ---------- the mesoscopic entities ----------
export interface PlDef { id: PlId; name: string; op: OpId; colour: string; bg: string; label: Pt; g: Pt }
export const pls: PlDef[] = [
  { id: 'V', name: 'Vest', op: 'Vest', colour: 'var(--c-green)', bg: 'var(--c-green-bg)', label: [142, 122], g: [120, 92] },
  { id: 'P', name: 'Stasjon passenger', op: 'Stasjon', colour: 'var(--c-amber)', bg: 'var(--c-amber-bg)', label: [450, 160], g: [430, 92] },
  { id: 'Y', name: 'Maintenance yard', op: 'Stasjon', colour: 'var(--c-purple)', bg: 'var(--c-blue-bg)', label: [612, 48], g: [560, 36] },
  { id: 'F', name: 'Freight terminal', op: 'Stasjon', colour: 'var(--c-teal)', bg: 'var(--c-blue-bg)', label: [540, 252], g: [560, 150] },
  { id: 'Ø', name: 'Øst passenger', op: 'Øst', colour: 'var(--c-blue)', bg: 'var(--c-blue-bg)', label: [900, 122], g: [890, 92] },
  { id: 'I', name: 'Industri', op: 'Øst', colour: 'var(--c-pink)', bg: 'var(--c-red-bg)', label: [880, 238], g: [820, 150] },
]
export const plById = Object.fromEntries(pls.map(p => [p.id, p])) as Record<PlId, PlDef>

export interface OpDef { id: OpId; box: [number, number, number, number]; g: [number, number, number, number] }
/** box: x, y, w, h on the micro drawing; g: the same on the PL graph */
export const ops: OpDef[] = [
  { id: 'Vest', box: [55, 108, 150, 82], g: [70, 60, 100, 64] },
  { id: 'Stasjon', box: [320, 30, 390, 222], g: [375, 10, 240, 168] },
  { id: 'Øst', box: [770, 108, 205, 125], g: [775, 60, 165, 120] },
]
export const sols: { id: string; a: OpId; b: OpId }[] = [
  { id: 'SoL Vest–Stasjon', a: 'Vest', b: 'Stasjon' },
  { id: 'SoL Stasjon–Øst', a: 'Stasjon', b: 'Øst' },
]

// ---------- option 1 and 1b: connections assumed from the OP / SoL structure ----------
export type Edge = [PlId, PlId]
const key = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`)
export const edgeKey = (e: Edge) => key(e[0], e[1])

/** every PL inside an OP is connected to every other one */
export const intraOpEdges: Edge[] = ops.flatMap(o => {
  const inside = pls.filter(p => p.op === o.id)
  const out: Edge[] = []
  for (let i = 0; i < inside.length; i++) for (let j = i + 1; j < inside.length; j++) out.push([inside[i].id, inside[j].id])
  return out
})
/** every PL of an OP is connected to every PL of the neighbouring OP (through the SoL) */
export const viaSolEdges: Edge[] = sols.flatMap(s => {
  const out: Edge[] = []
  for (const a of pls.filter(p => p.op === s.a)) for (const b of pls.filter(p => p.op === s.b)) out.push([a.id, b.id])
  return out
})

/** option 1b: one designated "main" PL per OP (data that RINF does not have) */
export const mainPl: Record<OpId, PlId> = { Vest: 'V', Stasjon: 'P', Øst: 'Ø' }
export const mainEdges: Edge[] = [
  ...pls.filter(p => mainPl[p.op] !== p.id).map(p => [mainPl[p.op], p.id] as Edge),
  ...sols.map(s => [mainPl[s.a], mainPl[s.b]] as Edge),
]

// ---------- option 2: PLs as area locations on the micro topology → routing ----------
export interface Found { to: PlId | string; path: string[] } // to: a PL, or an open line end (node id)

/**
 * Walk out of a primary location through navigable relations only (no reversing),
 * and stop at the first other primary location you enter. Elements of no PL are passed through.
 */
export function neighbours(pl: PlId): Found[] {
  type St = { el: string; towards: string; path: string[] }
  const q: St[] = []
  for (const e of melements.filter(e => e.pl === pl)) {
    q.push({ el: e.id, towards: e.to, path: [] }, { el: e.id, towards: e.from, path: [] })
  }
  const seen = new Set<string>()
  const found = new Map<string, string[]>()
  while (q.length) {
    const s = q.shift()!
    const k = s.el + '>' + s.towards
    if (seen.has(k)) continue
    seen.add(k)
    const pairs = mnavigable[s.towards]
    if (!pairs) {
      if (mnodes[s.towards].kind === 'end' && !found.has(s.towards)) found.set(s.towards, s.path)
      continue
    }
    for (const [a, b] of pairs) {
      const nxt = a === s.el ? b : b === s.el ? a : null
      if (!nxt) continue
      const e = melById[nxt]
      if (e.pl && e.pl !== pl) { if (!found.has(e.pl)) found.set(e.pl, [...s.path, nxt]); continue }
      const path = e.pl === pl ? [] : [...s.path, nxt]
      q.push({ el: nxt, towards: e.from === s.towards ? e.to : e.from, path })
    }
  }
  return [...found.entries()].map(([to, path]) => ({ to, path }))
}

export const routedEdges: Edge[] = (() => {
  const seen = new Set<string>()
  const out: Edge[] = []
  for (const p of pls) for (const f of neighbours(p.id)) {
    if (!(f.to in plById)) continue
    const k = key(p.id, f.to)
    if (!seen.has(k)) { seen.add(k); out.push([p.id, f.to as PlId]) }
  }
  return out
})()
export const routedSet = new Set(routedEdges.map(edgeKey))

/** the block post on the SoL Vest–Stasjon (two signals, one per direction) */
export const blockPost = { x: 260, y: 170 }
