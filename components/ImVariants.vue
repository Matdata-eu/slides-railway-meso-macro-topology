<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { type Pt, pathD } from '../lib/net'
import { type PlId, melements, pls, plById, ops, blockPost } from '../lib/meso'

/**
 * One corridor, three infrastructure managers, three ways to turn it into OPs, SoLs and locations.
 * A: every signalled place is an OP (the block post too); yard, freight and siding become subsidiary locations.
 * B: the list of primary locations is the list of OPs (1 OP = 1 PL).
 * C: an OP is the station; it holds several primary locations.
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const pick = ref<number | null>(null)
watch(() => props.step, () => { pick.value = null })
const v = computed(() => pick.value ?? Math.max(0, Math.min(2, props.step)))

type Box = { id: string; r: [number, number, number, number]; nolabel?: boolean }
function bbox(pl: PlId, pad = 14): [number, number, number, number] {
  const pts = melements.filter(e => e.pl === pl).flatMap(e => e.pts)
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1])
  const x0 = Math.min(...xs) - pad, y0 = Math.min(...ys) - pad - 10
  return [x0, y0, Math.max(...xs) + pad - x0, Math.max(...ys) + pad - y0]
}
type Variant = {
  im: string; rule: string; boxes: Box[]; kind: Record<PlId, 'PL' | 'SL'>
  meso: { n: Record<string, Pt>; sols: [string, string][] }
  counts: [number, number, number, number]
}
const opBox = (id: string) => ops.find(o => o.id === id)!.box
const variants: Variant[] = [
  {
    im: 'IM A', rule: 'Every signalled place is an OP, even a block post. Yard, freight terminal and siding become subsidiary locations.',
    boxes: [{ id: 'Vest', r: opBox('Vest') }, { id: 'Blokk', r: [blockPost.x - 36, 118, 72, 76] }, { id: 'Stasjon', r: opBox('Stasjon') }, { id: 'Øst', r: opBox('Øst') }],
    kind: { V: 'PL', P: 'PL', Y: 'SL', F: 'SL', Ø: 'PL', I: 'SL' },
    meso: { n: { Vest: [130, 30], Blokk: [260, 30], Stasjon: [500, 30], Øst: [880, 30] }, sols: [['Vest', 'Blokk'], ['Blokk', 'Stasjon'], ['Stasjon', 'Øst']] },
    counts: [4, 3, 3, 3],
  },
  {
    im: 'IM B', rule: 'The list of primary locations is the list of OPs: 1 OP = 1 PL. Areas without their own PL get split off.',
    boxes: (['V', 'P', 'Y', 'F', 'Ø', 'I'] as PlId[]).map(id => ({ id, r: bbox(id), nolabel: true })),
    kind: { V: 'PL', P: 'PL', Y: 'PL', F: 'PL', Ø: 'PL', I: 'PL' },
    meso: {
      n: { V: [130, 34], P: [420, 34], Y: [560, 14], F: [600, 58], Ø: [900, 34], I: [800, 58] },
      sols: [['V', 'P'], ['P', 'Y'], ['P', 'Ø'], ['P', 'I'], ['F', 'Ø'], ['F', 'I']],
    },
    counts: [6, 6, 6, 0],
  },
  {
    im: 'IM C', rule: 'An OP is the station. It holds as many primary locations as the planners need. The block post is just two signals.',
    boxes: ops.map(o => ({ id: o.id, r: o.box })),
    kind: { V: 'PL', P: 'PL', Y: 'PL', F: 'PL', Ø: 'PL', I: 'PL' },
    meso: { n: { Vest: [130, 30], Stasjon: [500, 30], Øst: [880, 30] }, sols: [['Vest', 'Stasjon'], ['Stasjon', 'Øst']] },
    counts: [3, 2, 6, 0],
  },
]
const cur = computed(() => variants[v.value])
const yard = ['a subsidiary location of the passenger PL', 'its own OP and PL', 'a PL inside OP Stasjon']
</script>

<template>
  <div class="imv">
    <div class="tabs">
      <button v-for="(x, i) in variants" :key="x.im" class="tab" :class="{ on: v === i }" @click="pick = i">{{ x.im }}</button>
      <div class="rule">{{ cur.rule }}</div>
    </div>
    <svg viewBox="0 22 1000 312" class="cv">
      <g :key="v" class="fade">
        <g v-for="b in cur.boxes" :key="b.id">
          <rect :x="b.r[0]" :y="b.r[1]" :width="b.r[2]" :height="b.r[3]" rx="12" class="opbox" />
          <text v-if="!b.nolabel" :x="b.r[0] + 8" :y="b.r[1] + 14" class="opt">OP {{ b.id }}</text>
        </g>
      </g>
      <path v-for="e in melements" :key="e.id" :d="pathD(e.pts)" class="trk" />
      <!-- block post signals -->
      <g :transform="`translate(${blockPost.x - 10},${blockPost.y})`"><line y2="-18" class="mast" /><polygon points="0,-24 11,-19 0,-14" class="sig" /></g>
      <g :transform="`translate(${blockPost.x + 10},${blockPost.y})`"><line y2="18" class="mast" /><polygon points="0,24 -11,19 0,14" class="sig" /></g>
      <!-- location badges -->
      <g v-for="p in pls" :key="p.id" :transform="`translate(${p.label[0]},${p.label[1]})`" class="badge" :class="cur.kind[p.id]">
        <rect :x="v === 1 ? -29 : -20" y="-11" :width="v === 1 ? 58 : 40" height="20" rx="10" :style="{ stroke: p.colour, fill: cur.kind[p.id] === 'PL' ? p.colour : 'var(--c-bg)' }" />
        <text y="4" :style="{ fill: cur.kind[p.id] === 'PL' ? 'var(--c-bg)' : p.colour }">{{ v === 1 ? 'OP·PL' : cur.kind[p.id] }} {{ p.id }}</text>
      </g>
      <!-- meso strip -->
      <g transform="translate(0,262)" :key="'m' + v" class="fade">
        <text x="14" y="34" class="mlab">meso</text>
        <line v-for="([a, b], i) in cur.meso.sols" :key="i" :x1="cur.meso.n[a][0]" :y1="cur.meso.n[a][1]" :x2="cur.meso.n[b][0]" :y2="cur.meso.n[b][1]" class="sol" />
        <g v-for="(p, id) in cur.meso.n" :key="id" :transform="`translate(${p[0]},${p[1]})`">
          <circle r="8" class="opn" /><text x="14" y="4" class="mt">{{ id }}</text>
        </g>
      </g>
    </svg>
    <div class="foot">
      <div class="counts">
        <span><b>{{ cur.counts[0] }}</b> OPs</span><span><b>{{ cur.counts[1] }}</b> SoLs</span>
        <span><b>{{ cur.counts[2] }}</b> primary locations</span><span><b>{{ cur.counts[3] }}</b> subsidiary locations</span>
      </div>
      <div class="yard">The maintenance yard is <b>{{ yard[v] }}</b>.</div>
    </div>
  </div>
</template>

<style scoped>
.imv { font-size: 13px; }
.tabs { display: flex; gap: 6px; align-items: center; }
.tab { border: 1.5px solid var(--c-stroke); border-radius: 6px; padding: 2px 12px; font-weight: 700; color: var(--c-ink-mod); background: var(--c-bg); }
.tab.on { border-color: var(--c-blue); background: var(--c-blue); color: var(--c-bg); }
.rule { margin-left: 10px; font-size: 14px; color: var(--c-ink); }
.cv { width: 100%; height: 305px; display: block; }
.opbox { fill: var(--c-amber-bg); stroke: var(--c-amber); stroke-width: 1.8; stroke-dasharray: 7 4; opacity: .9; }
.opt { font-size: 11.5px; font-weight: 700; fill: var(--c-amber-ink); }
.trk { fill: none; stroke: var(--c-ink); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
.mast { stroke: var(--c-ink); stroke-width: 1.5; } .sig { fill: var(--c-red); }
.badge rect { stroke-width: 2; }
.badge text { font-size: 11.5px; font-weight: 800; text-anchor: middle; }
.badge.SL rect { stroke-dasharray: 3 2; }
.mlab { font-size: 11px; font-weight: 700; fill: var(--c-ink-mod); }
.sol { stroke: var(--c-ink); stroke-width: 3.5; }
.mt { font-size: 10.5px; font-weight: 700; fill: var(--c-ink-mod); paint-order: stroke; stroke: var(--c-bg); stroke-width: 3; }
.opn { fill: var(--c-amber); stroke: var(--c-bg); stroke-width: 2; }
.foot { display: flex; justify-content: space-between; align-items: center; margin-top: 2px; }
.counts { display: flex; gap: 18px; font-size: 14px; }
.counts b { font-size: 20px; color: var(--c-heading); }
.yard { font-size: 14px; background: var(--c-surface); border-left: 4px solid var(--c-purple); padding: 4px 10px; border-radius: 6px; }
.fade { animation: fadein .6s ease-out; }
@keyframes fadein { from { opacity: 0 } to { opacity: 1 } }
</style>
