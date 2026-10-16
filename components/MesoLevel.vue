<script setup lang="ts">
import { computed } from 'vue'
import { type Pt, pathD } from '../lib/net'
import { melements, mnodes, pls, plById, ops, type PlId } from '../lib/meso'

/**
 * Option 4: the IM delivers a meso topology level.
 * 0 meso net elements, each aggregating micro net elements (one meso node per PL, links for the tracks in between)
 * 1 meso net relations keep the navigability: F reaches Øst and Industri, not the passenger area
 * 2 OPs, PLs and SoLs are positioned separately on the meso level (1 meso node = 1 PL)
 * 3 anything else can be positioned on the meso level too
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const s = computed(() => Math.max(0, Math.min(3, props.step)))

const Y = 345 // meso line
type MNode = { id: PlId; p: Pt }
const nodes: MNode[] = [
  { id: 'V', p: [130, Y] }, { id: 'P', p: [450, Y] }, { id: 'Y', p: [575, Y - 42] },
  { id: 'F', p: [610, Y + 42] }, { id: 'Ø', p: [905, Y] }, { id: 'I', p: [860, Y + 42] },
]
const np = (id: string) => nodes.find(n => n.id === id)!.p
const J1: Pt = [690, Y], J2: Pt = [800, Y]
type Link = { id: string; a: Pt; b: Pt; micro: string[] }
const links: Link[] = [
  { id: 'm0', a: [20, Y], b: [108, Y], micro: ['w0'] },
  { id: 'm1', a: [152, Y], b: [428, Y], micro: ['sol1'] },
  { id: 'm2', a: [472, Y], b: J1, micro: ['thr'] },
  { id: 'm3', a: J1, b: J2, micro: ['sol2'] },
  { id: 'm4', a: [927, Y], b: [990, Y], micro: ['e0'] },
]
// relations drawn from a node box to a junction or another node
const rels: [Pt, Pt][] = [
  [[468, Y - 10], [557, Y - 38]], // P – Y
  [J1, [628, Y + 36]], // F – J1
  [J2, [842, Y + 36]], // I – J2
  [J2, [883, Y]], // Ø – J2
]
const mid = (l: Link): Pt => [(l.a[0] + l.b[0]) / 2, Y]
const microMid = (id: string): Pt => { const e = melements.find(x => x.id === id)!; const a = e.pts[0], b = e.pts[e.pts.length - 1]; return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] }

// OP areas on the meso level
const opArea: Record<string, [number, number, number, number]> = {
  Vest: [100, Y - 26, 60, 52], Stasjon: [420, Y - 72, 285, 140], Øst: [818, Y - 26, 112, 96],
}
const caption = computed(() => [
  'The IM delivers a second topology level: meso net elements, each one aggregating micro net elements.',
  'Meso net relations keep the navigability: F connects to Øst and Industri, not to the passenger area.',
  'OPs, PLs and SoLs are positioned separately on the meso level. One meso node, one primary location.',
  'Anything else can be positioned on the meso level too, without touching the micro data.',
][s.value])
const nodeList = Object.values(mnodes)
</script>

<template>
  <div class="ml">
    <div class="cap">{{ caption }}</div>
    <svg viewBox="0 30 1000 400" class="cv">
      <!-- micro level -->
      <text x="6" y="48" class="lvl">MICRO</text>
      <path v-for="e in melements" :key="e.id" :d="pathD(e.pts)" class="band" v-show="e.pl" :style="{ stroke: e.pl ? plById[e.pl].colour : 'none' }" />
      <path v-for="e in melements" :key="'t'+e.id" :d="pathD(e.pts)" class="trk" />
      <g v-for="n in nodeList" :key="n.id" :transform="`translate(${n.p[0]},${n.p[1]})`">
        <circle v-if="n.kind === 'switch'" r="3.5" class="swn" />
        <line v-else-if="n.kind === 'buffer'" x1="0" y1="-6" x2="0" y2="6" class="buf" />
      </g>
      <line x1="0" y1="268" x2="1000" y2="268" class="sep" />
      <text x="6" y="288" class="lvl">MESO</text>

      <!-- aggregation -->
      <g class="agg">
        <line v-for="n in nodes" :key="'a'+n.id" :x1="plById[n.id].label[0]" :y1="plById[n.id].label[1] + 10" :x2="n.p[0]" :y2="n.p[1] - 14" />
        <template v-for="l in links" :key="'al'+l.id">
          <line v-for="m in l.micro" :key="m" :x1="microMid(m)[0]" :y1="microMid(m)[1] + 4" :x2="mid(l)[0]" :y2="Y - 4" />
        </template>
      </g>

      <!-- OP areas and SoLs -->
      <g v-if="s >= 2" class="fade">
        <g v-for="o in ops" :key="o.id">
          <rect :x="opArea[o.id][0]" :y="opArea[o.id][1]" :width="opArea[o.id][2]" :height="opArea[o.id][3]" rx="12" class="oparea" />
          <text :x="opArea[o.id][0] + 6" :y="opArea[o.id][1] + opArea[o.id][3] + 13" class="opt">OP {{ o.id }}</text>
        </g>
        <path :d="`M 165 ${Y + 12} L 415 ${Y + 12}`" class="solloc" /><text x="290" :y="Y + 27" class="solt">SoL Vest–Stasjon</text>
        <path :d="`M 708 ${Y - 12} L 812 ${Y - 12}`" class="solloc" /><text x="760" :y="Y - 19" class="solt">SoL Stasjon–Øst</text>
      </g>

      <!-- meso topology -->
      <line v-for="l in links" :key="l.id" :x1="l.a[0]" :y1="l.a[1]" :x2="l.b[0]" :y2="l.b[1]" class="mlink" />
      <line v-for="(r, i) in rels" :key="'r'+i" :x1="r[0][0]" :y1="r[0][1]" :x2="r[1][0]" :y2="r[1][1]" class="mlink" />
      <circle :cx="J1[0]" :cy="J1[1]" r="4" class="jn" /><circle :cx="J2[0]" :cy="J2[1]" r="4" class="jn" />
      <g v-for="n in nodes" :key="n.id" :transform="`translate(${n.p[0]},${n.p[1]})`">
        <rect x="-22" y="-13" width="44" height="26" rx="7" class="mnode" :style="{ stroke: plById[n.id].colour }" />
        <text y="5" class="mnt">{{ s >= 2 ? 'PL ' + n.id : 'm' + n.id }}</text>
      </g>

      <!-- navigability at the junctions -->
      <g v-if="s === 1" class="fade">
        <path :d="`M 640 ${Y + 30} Q ${J1[0]} ${Y} 740 ${Y}`" class="nav ok" />
        <path :d="`M 640 ${Y + 30} Q ${J1[0]} ${Y} 640 ${Y}`" class="nav no" />
        <text x="655" :y="Y - 14" class="navt no">F ↛ P</text>
        <text x="745" :y="Y + 26" class="navt ok">F → Ø, I</text>
      </g>

      <!-- other things on the meso level -->
      <g v-if="s >= 3" class="fade">
        <g :transform="`translate(330,${Y})`"><circle r="7" class="tp" /><text y="-12" class="tpt">timing point</text></g>
        <path :d="`M 520 ${Y + 8} L 680 ${Y + 8}`" class="spd" />        <text x="585" :y="Y + 22" class="spdt">planning speed 40</text>
        <g :transform="`translate(955,${Y})`"><rect x="-5" y="-16" width="10" height="32" class="brd" /><text y="30" class="brdt">IM border</text></g>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.ml { font-size: 13px; }
.cap { min-height: 22px; font-size: 14.5px; color: var(--c-ink); }
.cv { width: 100%; height: 375px; display: block; }
.lvl { font-size: 11px; font-weight: 800; letter-spacing: .08em; fill: var(--c-ink-mod); }
.sep { stroke: var(--c-stroke); stroke-dasharray: 5 5; }
.band { fill: none; stroke-width: 12; stroke-linecap: round; stroke-linejoin: round; opacity: .35; }
.trk { fill: none; stroke: var(--c-ink); stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
.swn { fill: var(--c-bg); stroke: var(--c-ink); stroke-width: 1.5; }
.buf { stroke: var(--c-ink); stroke-width: 2.5; }
.agg line { stroke: var(--c-ink-subtle); stroke-width: 1.2; stroke-dasharray: 3 4; }
.mlink { stroke: var(--c-ink); stroke-width: 4; stroke-linecap: round; }
.jn { fill: var(--c-bg); stroke: var(--c-ink); stroke-width: 2; }
.mnode { fill: var(--c-bg); stroke-width: 3.5; }
.mnt { font-size: 12px; font-weight: 800; text-anchor: middle; fill: var(--c-ink); }
.oparea { fill: var(--c-amber-bg); stroke: var(--c-amber); stroke-width: 1.8; stroke-dasharray: 7 4; }
.opt { font-size: 11.5px; font-weight: 700; fill: var(--c-amber-ink); }
.solloc { stroke: var(--c-blue); stroke-width: 5; stroke-linecap: round; opacity: .7; }
.solt { font-size: 11px; font-weight: 700; fill: var(--c-blue); text-anchor: middle; }
.nav { fill: none; stroke-width: 3; }
.nav.ok { stroke: var(--c-green); } .nav.no { stroke: var(--c-red); stroke-dasharray: 4 3; }
.navt { font-size: 12px; font-weight: 800; }
.navt.ok { fill: var(--c-green); } .navt.no { fill: var(--c-red); }
.tp { fill: var(--c-purple); stroke: var(--c-bg); stroke-width: 2; }
.tpt { font-size: 11px; font-weight: 700; fill: var(--c-purple); text-anchor: middle; }
.spd { stroke: var(--c-orange); stroke-width: 4; stroke-dasharray: 2 3; }
.spdt { font-size: 11px; font-weight: 700; fill: var(--c-orange); text-anchor: middle; }
.brd { fill: var(--c-red); }
.brdt { font-size: 11px; font-weight: 700; fill: var(--c-red); text-anchor: middle; }
.fade { animation: fadein .6s ease-out; }
@keyframes fadein { from { opacity: 0 } to { opacity: 1 } }
</style>
