# Dots and lines: mesoscopic topology talk, outline

Follow-up to "One network, one truth" (RINF topology talk). Deck: `C:\Users\mathi\Git\slides\rinf-mesoscopic-topology` (Slidev).
Toy corridor for all new visuals: OP Vest (PL V) · OP Stasjon (PL P passenger, Y maintenance yard facing west, F freight terminal facing east) · OP Øst (PL Ø passenger, I industrial siding facing west).

1. **Cover** · Dots and lines
2. **Where we left off** · TopoBuildUp steps 11–12 (meso and macro aggregation; macro keeps line ends, junctions, interchanges)
3. **One network, many topologies** · track, catenary and signal (route) topology on the same station (MicroViews)
4. **And at meso level too** · micro, OP–SoL, PL and macro views of the corridor (MesoViews)
5. *Section* · OP, PL, SoL: mesoscopic, and legacy
6. **Three concepts, three origins** · RINF OP and SoL, TAF/TAP PL and subsidiary location; mesoscopic, not the topology; legacy
7. **One corridor, three IMs** · A: block post = OP, rest subsidiary locations; B: PL list = OP list (1 OP = 1 PL); C: OP = station with several PLs (ImVariants)
8. **So which one is right?** · same thing different object, granularity goes somewhere, who decides; Norway wants a shared best practice, a lighthouse even if not every IM follows it
9. *Section* · How are primary locations connected?
10. **What we do today: split the OP** · OpSplit recap, 1 OP = 1 PL
11. **Option 1 · assume everything connected** · clique inside OP + all PLs of neighbouring OPs: 13 connections, 7 not drivable
12. **Option 1b · main PL** · 5 connections, 2 wrong, 3 missing; needs a property RINF lacks
13. **Option 2 · PLs on the micro topology** · PLs as NetAreaReferences, route out through navigable relations: 6 connections, all drivable (click a PL)
14. **Drivable ≠ requestable** · shunting only, operational rules, capacity; publish all / flag / let the IM define them
15. **Option 3 · PL connection object** · SoL-like meso object for PLs, defined by the IM (could use option 2 to do it); could carry additional properties; positioned on the micro topology
16. **Option 4 · A meso topology level** · IM delivers meso net elements aggregating micro ones, with navigability; OPs, PLs, SoLs (and timing points, borders, …) positioned on it; 1 meso node = 1 PL (MesoLevel)
17. **Option 3 or option 4?** · properties on the connection vs positioning on a level; option 4 most future proof
18. **What option 4 needs from RINF** · micro topology first; levels and aggregation (RTM, railML vs ERA none); hypothetical Turtle
19. **Five options side by side** · table; option 0 done by Norway, Belgium, the Netherlands, …
20. **Three take-aways**
21. **Questions** · contact

Open points for Mathias:
- Repository name and GitHub Pages base path (assumed `slides-railway-meso-topology`).
- Event and length of the talk (not stated; deck is ~25–30 min).
- Definitions on slide 6 are paraphrased; check wording against the regulation and TSI.
