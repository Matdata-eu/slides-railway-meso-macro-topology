<script setup lang="ts">
import { computed } from 'vue'
import { type Pt, pathD } from '../lib/net'
import { melements, mnodes, pls, plById, ops, sols, routedEdges } from '../lib/meso'

/**
 * Several topologies at meso level, all on the same corridor:
 * 0 the micro track topology, 1 OPs connected by SoLs, 2 primary locations connected by PL connections,
 * 3 the macro view: one railway line.
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const s = computed(() => Math.max(0, Math.min(3, props.step)))
const views = [
  { name: 'Micro · tracks', what: 'switches and tracks' },
  { name: 'Meso · OP and SoL', what: 'operational points, sections of line' },
  { name: 'Meso · PL', what: 'primary locations, PL connections' },
  { name: 'Macro · line', what: 'one national railway line' },
]
const opCentre = (id: string): Pt => { const b = ops.find(o => o.id === id)!.box; return [b[0] + b[2] / 2, 170] }
const nodeList = Object.values(mnodes)
</script>

<template>
  <div class="msv">
    <div class="tabs">
      <div v-for="(v, i) in views" :key="v.name" class="tab" :class="{ on: s === i }"><b>{{ v.name }}</b><div class="what">{{ v.what }}</div></div>
    </div>
    <svg viewBox="0 22 1000 250" class="cv">
      <path v-for="e in melements" :key="e.id" :d="pathD(e.pts)" class="trk" :class="{ faint: s > 0 }" />
      <g v-for="n in nodeList" :key="n.id" v-show="s === 0" :transform="`translate(${n.p[0]},${n.p[1]})`">
        <circle v-if="n.kind === 'switch'" r="6" class="swn" />
        <line v-else-if="n.kind === 'buffer'" x1="0" y1="-7" x2="0" y2="7" class="buf" />
      </g>

      <g v-if="s === 1" class="fade">
        <line x1="20" y1="170" :x2="opCentre('Vest')[0]" y2="170" class="sol open" />
        <line v-for="l in sols" :key="l.id" :x1="opCentre(l.a)[0]" y1="170" :x2="opCentre(l.b)[0]" y2="170" class="sol" />
        <line :x1="opCentre('Øst')[0]" y1="170" x2="990" y2="170" class="sol open" />
        <text v-for="l in sols" :key="'t'+l.id" :x="(opCentre(l.a)[0] + opCentre(l.b)[0]) / 2" y="198" class="solt">{{ l.id }}</text>
        <g v-for="o in ops" :key="o.id" :transform="`translate(${opCentre(o.id)[0]},170)`">
          <circle r="22" class="opn" /><text y="45" class="opt">OP {{ o.id }}</text>
        </g>
      </g>

      <g v-if="s === 2" class="fade">
        <line v-for="e in routedEdges" :key="e.join()" :x1="plById[e[0]].label[0]" :y1="plById[e[0]].label[1]"
          :x2="plById[e[1]].label[0]" :y2="plById[e[1]].label[1]" class="pledge" />
        <g v-for="p in pls" :key="p.id" :transform="`translate(${p.label[0]},${p.label[1]})`">
          <circle r="16" class="pln" :style="{ fill: p.colour }" /><text y="5" class="plt">{{ p.id }}</text>
        </g>
      </g>

      <g v-if="s === 3" class="fade">
        <line x1="20" y1="170" x2="990" y2="170" class="line" />
        <text x="300" y="200" class="opt">Railway line 2100 · A – B</text>
      </g>
    </svg>
    <div class="note">Every one of these is a topology: nodes and the relations between them. They are <b>views</b>, and an IM could report any of them.</div>
  </div>
</template>

<style scoped>
.msv { font-size: 13px; }
.tabs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.tab { background: var(--c-surface); border-radius: 8px; padding: 5px 9px; border-top: 4px solid var(--c-stroke); opacity: .5; transition: all .4s; }
.tab.on { opacity: 1; border-top-color: var(--c-sky); background: var(--c-blue-bg); }
.what { font-size: 11.5px; color: var(--c-ink-mod); }
.cv { width: 100%; height: 290px; display: block; }
.trk { fill: none; stroke: var(--c-ink); stroke-width: 3.5; stroke-linecap: round; stroke-linejoin: round; transition: all .5s; }
.trk.faint { stroke: var(--c-ink-subtle); stroke-width: 2; opacity: .45; }
.swn { fill: var(--c-amber); stroke: var(--c-bg); stroke-width: 2; }
.buf { stroke: var(--c-ink); stroke-width: 3; }
.sol { stroke: var(--c-ink); stroke-width: 6; stroke-linecap: round; }
.sol.open { stroke-dasharray: 8 6; opacity: .5; }
.solt { font-size: 12px; font-weight: 700; fill: var(--c-ink-mod); text-anchor: middle; }
.opn { fill: var(--c-amber); stroke: var(--c-bg); stroke-width: 3; }
.opt { font-size: 13.5px; font-weight: 700; fill: var(--c-ink); text-anchor: middle; }
.pledge { stroke: var(--c-green); stroke-width: 3.5; }
.pln { stroke: var(--c-bg); stroke-width: 2.5; }
.plt { font-size: 13px; font-weight: 800; text-anchor: middle; fill: var(--c-bg); }
.line { stroke: var(--c-blue); stroke-width: 9; stroke-linecap: round; }
.note { font-size: 14px; text-align: center; color: var(--c-ink-mod); }
.fade { animation: fadein .6s ease-out; }
@keyframes fadein { from { opacity: 0 } to { opacity: 1 } }
</style>
