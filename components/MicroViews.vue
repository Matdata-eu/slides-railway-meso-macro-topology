<script setup lang="ts">
import { computed } from 'vue'
import { type Pt, pathD } from '../lib/net'
import { elements2, elById2, nodes2, navigable2, points2, nodePos2, at2 } from '../lib/net2'
import { sectioning, sections, sides, signals2 } from '../lib/catenary'

/**
 * Three topologies on one micro network (the double-track station of net2.ts):
 * 0 track topology: switches and line ends as nodes, tracks as edges.
 * 1 catenary topology: catenary sections as nodes, sectioning elements as edges.
 * 2 signal topology: signals as nodes, routes from one signal to the next as edges (interlocking, TMS).
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const s = computed(() => Math.max(0, Math.min(2, props.step)))

const views = [
  { name: 'Track topology', what: 'nodes: switches, buffer stops, line ends · edges: tracks', who: 'track register, maintenance, RINF' },
  { name: 'Catenary topology', what: 'nodes: catenary sections · edges: overlaps and section insulators', who: 'power supply, isolations for possessions' },
  { name: 'Signal topology', what: 'nodes: signals · edges: routes from one signal to the next', who: 'interlocking, traffic management (TMS)' },
]

// ---------- catenary graph overlay ----------
const centre: Record<string, Pt> = { C1: [95, 110], C2: [55, 190], C3: [500, 110], C4: [500, 190], C5: [500, 265], C6: [905, 110], C7: [948, 190] }
const catEdges = sectioning.map(se => {
  const [a, b] = sides(se)
  const p = at2(elById2[se.el], 'schematic', se.t).p
  const A = centre[a.id], B = centre[b.id]
  // quadratic curve through the sectioning element: control point = 2p - (A+B)/2
  const c: Pt = [2 * p[0] - (A[0] + B[0]) / 2, 2 * p[1] - (A[1] + B[1]) / 2]
  return { id: se.id, d: `M ${A[0]} ${A[1]} Q ${c[0]} ${c[1]} ${B[0]} ${B[1]}`, p }
})

// ---------- signal routes ----------
// laid out as a graph: eastbound routes on top, westbound below, in columns entry → station → exit
type SigNode = { id: string; p: Pt; dir: 1 | -1; exit?: boolean }
const layout: Record<string, Pt> = {
  A: [200, 75], B: [200, 135], N2: [500, 65], S2: [500, 110], T2: [500, 155], 'exit EN': [800, 80], 'exit ES': [800, 140],
  'exit WN': [200, 205], 'exit WS': [200, 265], N1: [500, 195], S1: [500, 240], T1: [500, 285], C: [800, 205], D: [800, 265],
}
const sigNodes: SigNode[] = [
  ...signals2.map(g => ({ id: g.id, p: layout[g.id], dir: g.facing })),
  ...['exit EN', 'exit ES', 'exit WN', 'exit WS'].map(id => ({ id, p: layout[id], dir: (id.includes('E') && !id.includes('W') ? 1 : -1) as 1 | -1, exit: true })),
]
const sigById = Object.fromEntries(sigNodes.map(n => [n.id, n]))
const exitOf: Record<string, string> = { nWN: 'exit WN', nWS: 'exit WS', nEN: 'exit EN', nES: 'exit ES' }

/** from a signal, travel the way it faces through navigable relations until the next signal for the same direction */
function routesFrom(id: string): string[] {
  const g = signals2.find(x => x.id === id)!
  type St = { el: string; t: number; dir: 1 | -1 }
  const q: St[] = [{ el: g.el, t: g.t, dir: g.facing }]
  const out = new Set<string>()
  const seen = new Set<string>()
  while (q.length) {
    const st = q.shift()!
    const k = `${st.el}${st.t}${st.dir}`
    if (seen.has(k)) continue
    seen.add(k)
    const ahead = signals2
      .filter(x => x.el === st.el && x.facing === st.dir && (st.dir > 0 ? x.t > st.t : x.t < st.t))
      .sort((a, b) => (st.dir > 0 ? a.t - b.t : b.t - a.t))[0]
    if (ahead) { out.add(ahead.id); continue }
    const el = elById2[st.el]
    const node = st.dir > 0 ? el.to : el.from
    const pairs = navigable2[node]
    if (!pairs) { out.add(exitOf[node]); continue }
    for (const [a, b] of pairs) {
      const nxt = a === st.el ? b : b === st.el ? a : null
      if (!nxt) continue
      const n = elById2[nxt]
      q.push(n.from === node ? { el: nxt, t: 0, dir: 1 } : { el: nxt, t: 1, dir: -1 })
    }
  }
  return [...out]
}
const R = 12
const sigEdges = signals2.flatMap(g => routesFrom(g.id).map(to => {
  const A = sigById[g.id].p, B = sigById[to].p
  const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy)
  const ux = dx / L, uy = dy / L
  return { id: `${g.id}→${to}`, d: `M ${A[0] + ux * R} ${A[1] + uy * R} L ${B[0] - ux * (R + 3)} ${B[1] - uy * (R + 3)}`, east: g.facing > 0 }
}))
const nodeList = Object.values(nodes2)
</script>

<template>
  <div class="mv">
    <div class="tabs">
      <div v-for="(v, i) in views" :key="v.name" class="tab" :class="{ on: s === i, done: s > i }">
        <b>{{ v.name }}</b><div class="what">{{ v.what }}</div><div class="who">used by {{ v.who }}</div>
      </div>
    </div>
    <svg viewBox="10 40 980 280" class="cv">
      <defs>
        <marker id="mv-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" style="fill: var(--c-blue)" />
        </marker>
        <marker id="mv-ah2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" style="fill: var(--c-orange)" />
        </marker>
      </defs>

      <!-- catenary bands -->
      <g v-if="s === 1" class="fade">
        <template v-for="c in sections" :key="c.id">
          <path v-for="p in c.pieces" :key="p.id" class="band" :style="{ stroke: c.colour }"
            :d="pathD(points2(elById2[p.el], 'schematic').filter((_, k, arr) => { const f = k / (arr.length - 1); return f >= p.t0 - 0.02 && f <= p.t1 + 0.02 }))" />
        </template>
      </g>

      <!-- tracks: always the common base -->
      <path v-for="el in elements2" :key="el.id" v-show="s < 2" :d="pathD(points2(el, 'schematic'))" class="trk" :class="{ base: s > 0, edge: s === 0 }" />
      <g v-for="n in nodeList" :key="n.id" v-show="s < 2" :transform="`translate(${nodePos2(n.id, 'schematic')[0]},${nodePos2(n.id, 'schematic')[1]})`">
        <circle :r="s === 0 ? 8 : 4" :class="[n.kind === 'switch' ? 'swn' : 'endn', { node: s === 0 }]" />
      </g>
      <template v-if="s === 0">
        <text v-for="el in elements2" :key="'t'+el.id" class="ell"
          :x="at2(el, 'schematic', 0.5).p[0]" :y="at2(el, 'schematic', 0.5).p[1] - 8">{{ el.id }}</text>
      </template>

      <!-- catenary graph -->
      <g v-if="s === 1" class="fade">
        <path v-for="e in catEdges" :key="e.id" :d="e.d" class="cedge" />
        <g v-for="e in catEdges" :key="'s'+e.id" :transform="`translate(${e.p[0]},${e.p[1]})`">
          <rect x="-15" y="-9" width="30" height="18" rx="4" class="sebox" /><text y="4" class="set">{{ e.id }}</text>
        </g>
        <g v-for="c in sections" :key="'n'+c.id" :transform="`translate(${centre[c.id][0]},${centre[c.id][1]})`">
          <circle r="15" class="cnode" :style="{ fill: c.colour }" /><text y="4.5" class="cnt">{{ c.id }}</text>
        </g>
      </g>

      <!-- signal graph -->
      <g v-if="s === 2" class="fade">
        <path v-for="e in sigEdges" :key="e.id" :d="e.d" class="sedge" :class="{ west: !e.east }" :marker-end="e.east ? 'url(#mv-ah)' : 'url(#mv-ah2)'" />
        <g v-for="n in sigNodes" :key="n.id" :transform="`translate(${n.p[0]},${n.p[1]})`">
          <template v-if="!n.exit">
            <circle r="11" class="snode" :class="{ west: n.dir < 0 }" />
            <text y="4" class="snt">{{ n.id }}</text>
          </template>
          <template v-else><rect x="-9" y="-9" width="18" height="18" rx="3" class="exitn" /><text :x="n.dir > 0 ? 16 : -16" y="4" class="ext" :class="{ l: n.dir < 0 }">{{ n.id.replace('exit ', 'line ') }}</text></template>
        </g>
        <text x="60" y="110" class="leg e">→ eastbound</text>
        <text x="60" y="240" class="leg w">← westbound</text>
        <text x="200" y="312" class="col">entry</text><text x="500" y="312" class="col">station</text><text x="800" y="312" class="col">exit</text>
        <line x1="120" y1="172" x2="880" y2="172" class="sep" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.mv { font-size: 13px; }
.tabs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.tab { background: var(--c-surface); border-radius: 8px; padding: 5px 9px; border-top: 4px solid var(--c-stroke); opacity: .5; transition: all .4s; }
.tab.on { opacity: 1; border-top-color: var(--c-sky); background: var(--c-blue-bg); }
.tab.done { opacity: .8; }
.what { font-size: 11.5px; color: var(--c-ink); }
.who { font-size: 11px; color: var(--c-ink-mod); font-style: italic; }
.cv { width: 100%; height: 300px; display: block; }
.trk { fill: none; stroke: var(--c-ink); stroke-width: 3.5; stroke-linecap: round; transition: all .5s; }
.trk.edge { stroke: var(--c-blue); stroke-width: 4.5; }
.trk.base { stroke: var(--c-ink-subtle); stroke-width: 2.5; opacity: .7; }
.swn { fill: var(--c-bg); stroke: var(--c-ink); stroke-width: 2; } .endn { fill: var(--c-ink); }
.swn.node { fill: var(--c-amber); stroke: var(--c-bg); stroke-width: 2.5; }
.endn.node { fill: var(--c-ink); stroke: var(--c-bg); stroke-width: 2.5; }
.ell { font-size: 11px; font-weight: 700; fill: var(--c-blue); text-anchor: middle; paint-order: stroke; stroke: var(--c-bg); stroke-width: 3; }
.band { fill: none; stroke-width: 16; opacity: .35; stroke-linecap: butt; }
.cedge { fill: none; stroke: var(--c-ink); stroke-width: 2.5; }
.sebox { fill: var(--c-bg); stroke: var(--c-red); stroke-width: 1.5; }
.set { font-size: 10px; font-weight: 700; text-anchor: middle; fill: var(--c-red); }
.cnode { stroke: var(--c-bg); stroke-width: 2.5; }
.cnt { font-size: 11px; font-weight: 800; text-anchor: middle; fill: var(--c-bg); }
.sedge { fill: none; stroke: var(--c-blue); stroke-width: 2.2; }
.sedge.west { stroke: var(--c-orange); }
.snode { fill: var(--c-blue-bg); stroke: var(--c-blue); stroke-width: 2.5; }
.snode.west { fill: var(--c-orange-bg); stroke: var(--c-orange); }
.snt { font-size: 10px; font-weight: 800; text-anchor: middle; fill: var(--c-ink); }
.exitn { fill: var(--c-ink-mod); }
.col { font-size: 11px; fill: var(--c-ink-mod); text-anchor: middle; text-transform: uppercase; letter-spacing: .05em; }
.sep { stroke: var(--c-stroke); stroke-dasharray: 4 4; }
.ext { font-size: 11px; fill: var(--c-ink-mod); font-weight: 700; }
.ext.l { text-anchor: end; }
.leg { font-size: 12.5px; font-weight: 700; text-anchor: middle; }
.leg.e { fill: var(--c-blue); } .leg.w { fill: var(--c-orange); }
.fade { animation: fadein .6s ease-out; }
@keyframes fadein { from { opacity: 0 } to { opacity: 1 } }
</style>
