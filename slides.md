---
theme: default
title: "Dots and lines"
info: |
  Follow-up to "One network, one truth". Railway topology at the mesoscopic level:
  operational points, primary locations and sections of line, and how to connect primary locations.
highlighter: shiki
lineNumbers: false
drawings:
  persist: false
transition: slide-left
mdc: true
routerMode: hash
layout: cover
class: bn-cover
background: /assets/tracks-photo.jpeg
---

<div class="bn-cover-panel">

<img src="/assets/banenor-logo-inverted.svg" class="h-12 mb-8" alt="Bane NOR" />

# Dots and lines

## Operational points, primary locations and sections of line on a mesoscopic topology

<div class="mt-6 opacity-90">
Mathias Vanden Auweele · on behalf of Bane NOR
</div>

</div>

<!--
Follow-up to "One network, one truth". That talk was about the micro topology. This one zooms out to the mesoscopic entities RINF and telematics are built on, and asks how they relate to the topology.
-->

---
clicks: 1
---

# Where we left off

<TopoBuildUp :step="10 + $clicks" :height="330" />

<!--
Last time we built a micro topology step by step, and ended by aggregating it.
Station tracks collapse into an operational point, with a section of line on each side. One more step to macro: the line remains with its start and end stations, junctions and interchange stations. A station that is just on the line, like this one, disappears.
Today: what exactly are those dots and lines, and are they a topology?
-->

---
clicks: 2
---

# One network, many topologies

<MicroViews :step="$clicks" />

<!--
The railway micro topology we know: switches, buffer stops and the tracks between them.
1 Take the catenary sectioning on the same network: sections connected by overlaps and section insulators. Another micro topology, for the power supply.
2 Put the signals on it and connect each signal to the next one a train can reach: those are the routes. This is what interlocking and TMS work with.
Three topologies, all micro, all derived from or placed on the same tracks.
-->

---
clicks: 3
---

# And at meso level too

<MesoViews :step="$clicks" />

<!--
The same holds when you zoom out.
1 Operational points connected by sections of line.
2 Primary locations connected to the primary locations next to them.
3 One railway line.
Several meso and macro views can exist next to each other. All of them are topologies; the question is which ones an IM reports, and how.
-->

---
layout: section
---

# Operational points, primary locations, sections of line

## Mesoscopic, and legacy

---

# Three concepts, three origins

<div class="grid grid-cols-3 gap-4 mt-2">
<div class="concept">
<div class="tag">RINF</div>

### Operational point

A location for train service operations: where services may begin, end or change route, and where passenger or freight services may be provided. Also every border between member states or IMs.

</div>
<div class="concept">
<div class="tag">RINF</div>

### Section of line

The part of a line between two adjacent operational points. It may consist of several tracks.

</div>
<div class="concept">
<div class="tag tsi">TAF / TAP TSI</div>

### Primary location

A location in the telematics reference data, used in path requests and train running messages. A **subsidiary location** refines it: a track, a platform, a siding.

</div>
</div>

<div class="grid grid-cols-2 gap-4 mt-5">
<div v-click class="card"><b>Mesoscopic.</b> Each one stands for a piece of network bigger than a track and smaller than a line. None of them <i>is</i> the topology; they are entities placed on it.</div>
<div v-click class="card warn-card"><b>Legacy.</b> All three were defined long before anyone linked them to a micro topology, and each IM filled them in with its own history.</div>
</div>

<div class="text-xs muted mt-3">Definitions paraphrased from the RINF regulation (EU) 2019/777 and the TAF / TAP TSI location reference data.</div>

<!--
Paraphrased, not quoted. The key point: these are business entities with their own definitions, not a mesoscopic topology. People do derive a meso topology from them (OPs as nodes, SoLs as edges), but that is an interpretation.
-->

---
clicks: 2
---

# One corridor, three IMs

<ImVariants :step="$clicks" />

<!--
The same infrastructure, three ways to fill in RINF and the telematics reference data. All three exist in Europe today.
A: a block post is an OP, so the SoL is cut in two. Telematics granularity comes from subsidiary locations.
B: the PL list becomes the OP list. Bane NOR's latest RINF release does this: 1 OP = 1 PL. Ask such an IM how they handle the cases where telematics needs more detail than the OPs offer: there is no clear answer, beyond subsidiary locations.
C: the OP is the station, and it holds several PLs.
What is a primary location in one IM is a subsidiary location in another.
-->

---

# So which one is right?

<div class="grid grid-cols-3 gap-4 mt-4">
<div v-click class="prob">

### 🧩 Same thing, different object
A yard is a **subsidiary location** here, a **primary location** there, and an **OP** somewhere else. Cross-border applications have to guess.

</div>
<div v-click class="prob">

### 🔍 Granularity has to go somewhere
When telematics needs more detail than the OPs give, it ends up in **subsidiary locations**, or in more OPs, or nowhere.

</div>
<div v-click class="prob">

### ⚖️ Who decides?
"How it is supposed to be" has no owner. The definitions leave room, and every IM filled it in its own way.

</div>
</div>

<div v-click class="card mt-6 text-lg">🇳🇴 What Norway would like: <b>a shared best practice</b>. One we can implement, refer to and discuss. Even if not every IM follows it, it is a <b>lighthouse</b> to steer towards.</div>

---
layout: section
---

# How are primary locations connected?

## From splitting OPs to a meso topology level

---
clicks: 4
---

# What we do today: split the OP

<OpSplit :step="$clicks" />

<div class="card text-sm -mt-10">🇳🇴 🇧🇪 🇳🇱 Norway, Belgium, the Netherlands and others: <b>1 OP = 1 PL</b>. PL connectivity comes free as SoLs; an OP no longer means what it used to.</div>

<!--
Recap from the previous talk. Splitting gives every PL its own OP, so SoLs (some with solNature "link") connect them.
The rest of this section asks: if you do NOT split, what then?
-->

---
clicks: 3
---

# Option 1 · Assume everything is connected

<PlConnect mode="assume" :step="$clicks" />

<!--
The data: which OP each PL belongs to, and which SoLs connect the OPs. Nothing more.
1 Inside an OP: assume all PLs connect to each other. The OP becomes a group of PLs.
2 Through a SoL: every PL of an OP connects to every PL of the neighbouring OP.
3 Compare with the micro topology: the freight terminal faces east, so a train from the passenger area cannot get there without reversing. The industrial siding faces west, so Øst passenger cannot reach it directly.
It is the best you can do with today's data, without splitting OPs. It is not a fine meso solution.
-->

---
clicks: 2
---

# Option 1b · Designate a main primary location

<PlConnect mode="main" :step="$clicks" />

<div class="text-xs muted -mt-1">Needs a "main PL" property per OP. It does not exist in RINF or the ERA ontology today.</div>

<!--
Pick one PL per OP as the main one (the primary primary location). Others hang off it, SoLs connect the main ones.
Fewer edges than option 1, but it needs extra data that is not in the model, and it is still a guess: P to F is not drivable, while F to Øst is drivable and missing.
-->

---

# Option 2 · PLs on the micro topology

<PlConnect mode="route" />

<!--
Precondition: a micro topology, and every PL located on it as an area (an era:NetAreaReference). Stations, yards and terminals become areas on the tracks.
Then connecting PLs is a routing problem. Start from one PL, walk out through navigable relations only, and stop at the first other PL you enter. Tracks that belong to no PL (the throat, the SoL tracks) are passed through.
Click F: it reaches Øst and Industri, not the passenger area it shares an OP with.
Generate all: six connections, every one of them drivable.
-->

---

# Drivable is not the same as requestable

<div class="grid grid-cols-5 gap-6 mt-2">
<div class="col-span-3">

Option 2 assumes that **infrastructure navigability gives routing possibilities for telematics**. That is not always true:

- a connection may only be used for **shunting**, not by a train
- an operational rule may forbid it, or it is **not signalled** for it
- capacity planning may simply **not offer** it

RINF is an **infrastructure view**, not yet a complete telematics view.

</div>
<div class="col-span-2">

<div v-click class="card">✅ <b>Publish them all.</b> The RIS shows a drivable connection. If an RU requests a path that is not possible, the IM answers then.</div>
<div v-click class="card mt-3">🏷️ <b>Publish with a flag.</b> Mark which connections can be requested.</div>
<div v-click class="card mt-3">✂️ <b>Let the IM define them.</b> The IM decides which connections exist. That is where options 3 and 4 go.</div>

</div>
</div>

<!--
There are several valid ways to look at this. Showing a connection that turns out not to be requestable can be acceptable, as long as the path request process catches it.
-->

---

# Option 3 · A PL connection object

<PlConnect mode="explicit" />

<div class="text-sm -mt-1">What the <b>SoL</b> is to the OP, a <b>PL connection</b> is to the PL. The IM defines them and publishes what it can offer.</div>

<!--
No primary locations on the micro topology needed for the consumer, and no mess of option 1.
A new mesoscopic element, a telematic segment or primary location connection, similar to the section of line.
In essence a second meso topology. Tick a box to keep a connection internal.
-->

---
clicks: 3
---

# Option 4 · A meso topology level

<MesoLevel :step="$clicks" />

<!--
The IM delivers the meso level itself, next to the micro level, as a topology: meso net elements and net relations.
0 Every meso net element aggregates micro net elements. Ideally one meso node per primary location, plus links for the tracks in between.
1 Net relations keep the navigability, so routing on the meso level gives the same six connections as option 2 found on the micro level.
2 OPs, PLs and SoLs are positioned on the meso level separately, the way they are positioned on the micro level. One meso node, one PL: that is what telematics needs. The OP is an area over several nodes.
3 And anything else can be positioned on it: a timing point, a planning speed, an IM border.
This follows the practice of IMs that already keep a meso network, and it is the most future proof option.
-->

---

# Option 3 or option 4?

<div class="grid grid-cols-2 gap-5 mt-2">
<div class="concept">
<div class="tag">Option 3</div>

### PL connection object

- an **object** next to the topology, like a SoL
- could carry **additional properties** on the connection: requestable, running time, …
- no aggregation of micro elements, but **positioned on the micro topology**
- simple to add to RINF

</div>
<div class="concept opt4">
<div class="tag tsi">Option 4</div>

### Meso topology level

- a **topology**: net elements and net relations, with navigability
- **aggregates the micro level**, so the two stay consistent
- you can **position anything** on it: OPs, PLs, SoLs, timing points, borders
- the most advanced, and the most **future proof**

</div>
</div>

<div v-click class="card mt-5">Option 2 <b>infers</b> the connections from micro topology routing. In options 3 and 4 the <b>IM defines</b> them: nothing is built automatically, although an IM could use option 2 to do it.</div>

<!--
Option 3 puts properties on the connection. Option 4 lets you place other things on the meso view. They are not exclusive: a PL connection could later become a relation of the meso level.
-->

---

# What option 4 needs from RINF

<div class="grid grid-cols-2 gap-6 mt-2">
<div>

<div class="prob mb-4">

### 1 · A micro topology first
For many IMs, delivering a micro topology at all is the biggest hurdle. Options 2, 3 and 4 all build on it.

</div>
<div class="prob">

### 2 · A way to tell levels apart
There is no concept to group net elements and say **"this group is micro"**, **"this group is the meso level"**, or to say which micro elements a meso element **aggregates**.

</div>
</div>
<div>

<div class="rosetta">

| | Levels and aggregation |
|---|---|
| RailTopoModel | levels of detail: micro · meso · macro, one network per level |
| railML 3 | `level` per network with a `descriptionLevel`, listing the network resources on that level |
| ERA ontology | — no level concept, no aggregation |

</div>

<div v-click class="smallcode mt-3">

```turtle
# hypothetical: not in the ERA ontology
:meso a era:TopologyLevel ; era:descriptionLevel :meso .
:mP a era:NetElement ;
  era:inLevel :meso ;
  era:aggregates :t1 , :t2a , :t2b .   # micro elements
:plP era:netReference [ a era:NetAreaReference ;
  era:onNetElement :mP ] .            # PL on the meso level
```

</div>

</div>
</div>

<!--
Option 4 is where the gap shows: the ERA ontology has net elements in one flat bag. It needs a level, and an aggregation link from meso to micro. The Turtle is a sketch for discussion, not a proposal for class names.
-->

---

# Five options side by side

<div class="rosetta mt-2">

| | Data needed | Correct? | New concept? | Today in RINF? |
|---|---|---|---|---|
| **0 · Split the OP** (1 OP = 1 PL) | OPs and SoLs per PL | ✅ as far as the SoLs go | — | ✅ Norway, Belgium, the Netherlands, … |
| **1 · Assume everything connected** | PL → OP, OP + SoL | ❌ too many connections | — | ✅ |
| **1b · Main PL** | + a main PL per OP | ⚠️ some wrong, some missing | main PL property | ❌ |
| **2 · Route on the micro topology** | micro topology + PL areas | ✅ drivable; not always requestable | — | ⚠️ needs micro topology |
| **3 · PL connection object** | PL connections, defined by the IM | ✅ as defined by the IM | PL connection element | ❌ |
| **4 · Meso topology level** | meso level aggregating micro, OPs and PLs on it | ✅ drivable, 1 node = 1 PL | topology levels, aggregation | ❌ |

</div>

<div v-click class="mt-5 text-lg text-center">Without a micro topology, PL connectivity is a <b>guess</b>. With one, it is <b>routing</b>. With a meso level, it is a <b>view everyone can build on</b>.</div>

---
layout: center
class: text-center
---

# Three take-aways

<div class="grid grid-cols-3 gap-6 mt-8 text-left">
<div class="tk">🔵<br><b>OPs, PLs and SoLs are mesoscopic entities.</b><br>They are placed on a topology; they are not the topology.</div>
<div class="tk">🧭<br><b>PL connectivity needs the micro topology.</b><br>Without it you guess; with it you route.</div>
<div class="tk">🤝<br><b>We need a shared best practice.</b><br>And topology levels in RINF, so a meso level can be delivered.</div>
</div>

---
layout: center
class: text-center
---

# Questions?

<div class="text-left text-lg leading-relaxed mt-8 inline-block">

Mathias Vanden Auweele · Bane NOR<br>
<a href="mailto:mathias.vanden.auweele@banenor.no">mathias.vanden.auweele@banenor.no</a>

<div class="mt-6 text-base">Previous talk, "One network, one truth":<br>
<a href="https://github.com/Matdata-eu/slides-railway-topology" class="font-bold">github.com/Matdata-eu/slides-railway-topology</a></div>

</div>
