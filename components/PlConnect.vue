<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { pathD } from '../lib/net'
import {
  type PlId, type Edge, melements, melById, mnodes, pls, plById, ops, mainPl,
  intraOpEdges, viaSolEdges, mainEdges, routedEdges, routedSet, edgeKey, neighbours,
} from '../lib/meso'

/**
 * How are primary locations connected to each other?
 * mode 'assume':  option 1, every PL in an OP connected to every other, and to every PL of the neighbouring OPs.
 * mode 'main':    option 1b, one designated main PL per OP carries the connections.
 * mode 'route':   option 2, PLs are area locations on the micro topology; neighbours are found by routing.
 * mode 'explicit':option 3, the connections are their own mesoscopic objects, curated by the IM.
 * The top drawing is the micro topology, the bottom one the PL graph that results.
 */
const props = withDefaults(defineProps<{ mode: 'assume' | 'main' | 'route' | 'explicit'; step?: number }>(), { step: 99 })
const s = computed(() => props.step)

const selected = ref<PlId | null>(props.mode === 'route' ? 'P' : null)
const showAll = ref(props.mode === 'explicit')
const hoverEdge = ref<string | null>(null)
const published = ref(new Set(routedEdges.map(edgeKey)))
const runId = ref(0)
watch(selected, () => runId.value++)

function select(id: PlId) {
  if (props.mode !== 'route') return
  showAll.value = false
  selected.value = selected.value === id ? null : id
}

// ---------- which PL edges are drawn, and how ----------
type Drawn = { e: Edge; cls: string }
const drawn = computed<Drawn[]>(() => {
  if (props.mode === 'assume') {
    const list: Edge[] = [...(s.value >= 1 ? intraOpEdges : []), ...(s.value >= 2 ? viaSolEdges : [])]
    return list.map(e => ({ e, cls: s.value >= 3 ? (routedSet.has(edgeKey(e)) ? 'ok' : 'bad') : 'plain' }))
  }
  if (props.mode === 'main') {
    if (s.value < 1) return []
    const out: Drawn[] = mainEdges.map(e => ({ e, cls: s.value >= 2 ? (routedSet.has(edgeKey(e)) ? 'ok' : 'bad') : 'plain' }))
    if (s.value >= 2) {
      const have = new Set(mainEdges.map(edgeKey))
      for (const e of routedEdges) if (!have.has(edgeKey(e))) out.push({ e, cls: 'missing' })
    }
    return out
  }
  if (props.mode === 'route') {
    if (showAll.value) return routedEdges.map(e => ({ e, cls: 'ok' }))
    if (!selected.value) return []
    return neighbours(selected.value).filter(f => f.to in plById).map(f => ({ e: [selected.value!, f.to as PlId] as Edge, cls: 'ok sel' }))
  }
  return routedEdges.map(e => ({ e, cls: published.value.has(edgeKey(e)) ? 'ok' : 'unpub' }))
})
const counts = computed(() => ({
  all: drawn.value.filter(d => d.cls !== 'missing').length,
  bad: drawn.value.filter(d => d.cls === 'bad').length,
  missing: drawn.value.filter(d => d.cls === 'missing').length,
}))

// ---------- micro paths to highlight ----------
const paths = computed(() => {
  if (props.mode === 'route' && selected.value && !showAll.value) {
    return neighbours(selected.value).map(f => ({ to: f.to, els: f.path, colour: f.to in plById ? plById[f.to as PlId].colour : 'var(--c-ink-mod)' }))
  }
  if ((props.mode === 'route' || props.mode === 'explicit') && hoverEdge.value) {
    const [a, b] = hoverEdge.value.split('|') as PlId[]
    const f = neighbours(a).find(x => x.to === b)
    return f ? [{ to: b, els: f.path, colour: 'var(--c-red)' }] : []
  }
  return []
})
const reached = computed(() => new Set(paths.value.map(p => p.to)))

const plVisible = computed(() => props.mode !== 'assume' || s.value >= 0)
const gp = (id: PlId) => plById[id].g
const nodeList = Object.values(mnodes)
function edgeLabel(e: Edge) { return `${e[0]}–${e[1]}` }
function togglePub(k: string) {
  const n = new Set(published.value)
  n.has(k) ? n.delete(k) : n.add(k)
  published.value = n
}
const caption = computed(() => {
  if (props.mode === 'assume') return [
    'Three OPs, six primary locations. RINF tells us which OP each PL belongs to, and which SoLs connect the OPs.',
    'Rule 1: inside an OP, assume every PL is connected to every other PL.',
    'Rule 2: through a SoL, assume every PL is connected to every PL of the neighbouring OP.',
    'Check against the micro topology: many of these connections cannot be driven without reversing.',
  ][Math.min(3, s.value)]
  if (props.mode === 'main') return [
    'Designate one main PL per OP (★). RINF has no property for this today.',
    'Every other PL hangs off its main PL, and SoLs connect the main PLs.',
    'Fewer edges, but still not the network: some are wrong, others are missing.',
  ][Math.min(2, s.value)]
  if (props.mode === 'route') return showAll.value
    ? 'All PL connections, generated from the micro topology. Hover an edge to see the route behind it.'
    : 'Click a primary location: walk out through navigable relations until you enter another PL.'
  return 'The same connections as objects of their own, like a SoL for OPs. The IM decides which ones it publishes.'
})
</script>

<template>
  <div class="plc">
    <div class="cap">{{ caption }}</div>
    <svg viewBox="0 22 1000 240" class="micro">
      <!-- OP boxes -->
      <g v-for="o in ops" :key="o.id">
        <rect :x="o.box[0]" :y="o.box[1]" :width="o.box[2]" :height="o.box[3]" rx="14" class="opbox" />
        <text :x="o.box[0] + 10" :y="o.box[1] + 16" class="opt">OP {{ o.id }}</text>
      </g>
      <!-- PL bands -->
      <template v-if="plVisible">
        <path v-for="e in melements.filter(x => x.pl)" :key="'b'+e.id" :d="pathD(e.pts)" class="band"
          :class="{ dim: (mode === 'route' && selected && e.pl !== selected && !reached.has(e.pl!)) }"
          :style="{ stroke: plById[e.pl!].colour }" />
      </template>
      <!-- tracks -->
      <path v-for="e in melements" :key="e.id" :d="pathD(e.pts)" class="trk" />
      <!-- highlighted routes -->
      <g :key="runId">
        <template v-for="(p, i) in paths" :key="i">
          <path v-for="(id, j) in p.els" :key="id" :d="pathD(melById[id].pts)" class="route"
            :style="{ stroke: p.colour, animationDelay: `${(i * 0.15 + j * 0.35).toFixed(2)}s` }" pathLength="1" />
        </template>
      </g>
      <g v-for="n in nodeList" :key="n.id" :transform="`translate(${n.p[0]},${n.p[1]})`">
        <circle v-if="n.kind === 'switch'" r="4" class="swn" />
        <line v-else-if="n.kind === 'buffer'" x1="0" y1="-7" x2="0" y2="7" class="buf" />
      </g>
      <text x="14" y="160" class="end">A</text><text x="986" y="160" class="end">B</text>
      <!-- PL labels -->
      <g v-for="p in pls" :key="'l'+p.id" class="pll" :class="{ clickable: mode === 'route' }" @click="select(p.id)"
        :transform="`translate(${p.label[0]},${p.label[1]})`">
        <rect x="-13" y="-11" width="26" height="20" rx="5" :style="{ fill: p.colour }" :class="{ selr: selected === p.id }" />
        <text y="4">{{ p.id }}</text>
      </g>
    </svg>

    <div class="lower">
      <svg viewBox="40 0 940 185" class="graph">
        <g v-for="o in ops" :key="o.id">
          <rect :x="o.g[0]" :y="o.g[1]" :width="o.g[2]" :height="o.g[3]" rx="22" class="gop" />
          <text :x="o.g[0] + o.g[2] / 2" :y="o.g[1] + o.g[3] + 14" class="gopt">{{ o.id }}</text>
        </g>
        <g v-for="d in drawn" :key="edgeKey(d.e) + d.cls" class="gedge" :class="d.cls"
          @mouseenter="hoverEdge = edgeKey(d.e)" @mouseleave="hoverEdge = null"
          @click="mode === 'explicit' && togglePub(edgeKey(d.e))">
          <line :x1="gp(d.e[0])[0]" :y1="gp(d.e[0])[1]" :x2="gp(d.e[1])[0]" :y2="gp(d.e[1])[1]" />
          <line :x1="gp(d.e[0])[0]" :y1="gp(d.e[0])[1]" :x2="gp(d.e[1])[0]" :y2="gp(d.e[1])[1]" class="hit" />
          <text v-if="d.cls.includes('bad')" :x="(gp(d.e[0])[0] + gp(d.e[1])[0]) / 2" :y="(gp(d.e[0])[1] + gp(d.e[1])[1]) / 2 + 4" class="x">✗</text>
        </g>
        <g v-for="p in pls" :key="'g'+p.id" class="gpl" :class="{ clickable: mode === 'route', sel: selected === p.id && !showAll, hit: reached.has(p.id) }"
          :transform="`translate(${p.g[0]},${p.g[1]})`" @click="select(p.id)">
          <circle r="17" :style="{ stroke: p.colour }" />
          <text y="5">{{ p.id }}</text>
          <text v-if="(mode === 'main') && mainPl[p.op] === p.id" x="14" y="-11" class="star">★</text>
        </g>
      </svg>
      <div class="side">
        <template v-if="mode === 'assume' || mode === 'main'">
          <div class="big">{{ counts.all }}</div><div class="muted">PL connections assumed</div>
          <div v-if="counts.bad" class="bad-t">✗ {{ counts.bad }} cannot be driven without reversing</div>
          <div v-if="counts.missing" class="miss-t">┄ {{ counts.missing }} drivable ones missing</div>
        </template>
        <template v-else-if="mode === 'route'">
          <button class="btn" :class="{ on: showAll }" @click="showAll = !showAll; selected = null">{{ showAll ? 'Show one PL' : 'Generate all' }}</button>
          <div v-if="showAll" class="mt"><div class="big">{{ routedEdges.length }}</div><div class="muted">PL connections, all drivable</div></div>
          <div v-else-if="selected" class="mt small">
            <b>{{ plById[selected].name }}</b> reaches
            <div v-for="f in neighbours(selected)" :key="f.to">→ {{ f.to in plById ? plById[f.to as PlId].name : (f.to === 'nW' ? 'open line to A' : 'open line to B') }}</div>
          </div>
        </template>
        <template v-else>
          <div class="th">PL connections</div>
          <label v-for="e in routedEdges" :key="edgeKey(e)" class="pub" @mouseenter="hoverEdge = edgeKey(e)" @mouseleave="hoverEdge = null">
            <input type="checkbox" :checked="published.has(edgeKey(e))" @change="togglePub(edgeKey(e))" />
            {{ edgeLabel(e) }} <span class="muted">{{ published.has(edgeKey(e)) ? 'published' : 'kept internal' }}</span>
          </label>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.plc { font-size: 13px; }
.cap { min-height: 22px; font-size: 14.5px; color: var(--c-ink); }
.micro { width: 100%; height: 205px; display: block; }
.opbox { fill: var(--c-surface); stroke: var(--c-stroke); stroke-width: 1.5; stroke-dasharray: 6 4; }
.opt { font-size: 12px; font-weight: 700; fill: var(--c-ink-mod); }
.band { fill: none; stroke-width: 15; stroke-linecap: round; stroke-linejoin: round; opacity: .4; transition: opacity .4s; }
.band.dim { opacity: .12; }
.trk { fill: none; stroke: var(--c-ink); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
.route { fill: none; stroke-width: 7; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 1; stroke-dashoffset: 1; opacity: .95;
  animation: draw .5s ease-out forwards; }
@keyframes draw { to { stroke-dashoffset: 0 } }
.swn { fill: var(--c-bg); stroke: var(--c-ink); stroke-width: 1.8; }
.buf { stroke: var(--c-ink); stroke-width: 3; }
.end { font-size: 13px; font-weight: 700; fill: var(--c-ink-mod); text-anchor: middle; }
.pll text { font-size: 12.5px; font-weight: 800; text-anchor: middle; fill: var(--c-bg); }
.pll rect { stroke: var(--c-bg); stroke-width: 1.5; }
.pll rect.selr { stroke: var(--c-ink); stroke-width: 2.5; }
.clickable { cursor: pointer; }
.lower { display: grid; grid-template-columns: 1fr 190px; gap: 10px; align-items: center; }
.graph { width: 100%; height: 165px; display: block; }
.gop { fill: var(--c-surface); stroke: var(--c-stroke); stroke-width: 1.5; }
.gopt { font-size: 12px; font-weight: 700; fill: var(--c-ink-mod); text-anchor: middle; }
.gedge line { stroke: var(--c-ink); stroke-width: 2.5; animation: fadein .5s ease-out; }
.gedge line.hit { stroke: transparent; stroke-width: 14; }
.gedge.ok line:not(.hit) { stroke: var(--c-green); }
.gedge.sel line:not(.hit) { stroke-width: 3.5; }
.gedge.bad line:not(.hit) { stroke: var(--c-red); stroke-dasharray: 6 4; }
.gedge.missing line:not(.hit) { stroke: var(--c-ink-subtle); stroke-dasharray: 2 4; }
.gedge.unpub line:not(.hit) { stroke: var(--c-ink-subtle); stroke-dasharray: 5 5; opacity: .6; }
.gedge .x { font-size: 13px; font-weight: 800; fill: var(--c-red); text-anchor: middle; paint-order: stroke; stroke: var(--c-bg); stroke-width: 4; }
.gpl circle { fill: var(--c-bg); stroke-width: 3.5; transition: fill .3s; }
.gpl text { font-size: 14px; font-weight: 800; text-anchor: middle; fill: var(--c-ink); }
.gpl.sel circle { fill: var(--c-amber-bg); stroke-width: 5; }
.gpl.hit circle { fill: var(--c-green-bg); }
.gpl .star { font-size: 15px; fill: var(--c-amber); text-anchor: start; }
.side { font-size: 12.5px; }
.big { font-size: 34px; font-weight: 800; color: var(--c-heading); line-height: 1; }
.bad-t { color: var(--c-red); font-weight: 700; margin-top: 6px; }
.miss-t { color: var(--c-ink-mod); font-weight: 700; margin-top: 4px; }
.muted { color: var(--c-ink-mod); }
.small { font-size: 12px; line-height: 1.45; }
.mt { margin-top: 8px; }
.btn { border: 1.5px solid var(--c-blue); color: var(--c-blue); border-radius: 6px; padding: 3px 10px; font-weight: 700; background: var(--c-bg); }
.btn.on { background: var(--c-blue); color: var(--c-bg); }
.th { font-weight: 700; color: var(--c-ink-mod); margin-bottom: 3px; }
.pub { display: block; cursor: pointer; line-height: 1.6; }
.pub input { accent-color: var(--c-green); margin-right: 4px; }
.pub .muted { font-size: 11px; }
@keyframes fadein { from { opacity: 0 } to { opacity: 1 } }
</style>
