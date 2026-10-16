/**
 * Purifier: a whole-home water purification canister on a foundation plinth.
 * Raw water enters with dark sediment particles, passes through the cylindrical
 * core where impurities are trapped, and purified clean water flows out.
 * Runs as a continuous, ambient physical purification animation.
 */
const {
  Cam, clamp, facing, fit, open, poly, proj, rings, seg,
  solid, put, prism, unproj, spring, stepS, tween, tset, tval, tdone,
  disposer, mk, place, pointer, register, ringAt,
} = HL;

const NP = 14, NC = 8;

function mount({ stage, svg, read }, value) {
  const bag = disposer();

  const C = Cam(45, 0.5, 2.08);
  fit(C, [
    [-4, -4, -8], [84, 84, -8], [84, -4, 0], [-4, 84, 0],
    [40, 40, 54], [14, 66, 38], [66, 14, 38],
  ], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  // 1. Plinth (ground slab) and guides
  const [pr, pi] = rings(-4, -4, 84, 84, 8, 2.0);
  const plinth = solid(g);
  put(plinth, prism(P, front, pr, pi, -8, 0));
  const guides = mk("path", { class: "nf dash lo" }, g);
  guides.setAttribute("d", seg(P(14, -2, 0), P(14, 82, 0)) + seg(P(40, -2, 0), P(40, 82, 0)) + seg(P(66, -2, 0), P(66, 82, 0)));

  // 2. Raw Water Inlet (Left)
  const gIn = mk("g", {}, g);
  const [rInR, rInI] = rings(11, 63, 17, 69, 2.6, 0.6);
  const pipeIn = solid(gIn);
  put(pipeIn, prism(P, front, rInR, rInI, 0, 36));
  const runIn = mk("path", { class: "nf sil" }, gIn);
  runIn.setAttribute("d", seg(P(14, 66, 36), P(32, 48, 36)));

  // 3. Purification Canister (Center)
  const gCore = mk("g", {}, g);
  const [rBmR, rBmI] = rings(32, 32, 48, 48, 7.5, 1.2);
  const baseMount = solid(gCore);
  put(baseMount, prism(P, front, rBmR, rBmI, 0, 4));

  // Transparent / outer canister
  const [rCanR, rCanI] = rings(28, 28, 52, 52, 11.5, 1.8);
  const canister = solid(gCore);
  put(canister, prism(P, front, rCanR, rCanI, 4, 34));

  // Inner porous filtration core (cartridge barrier)
  const [rCoreR, rCoreI] = rings(35, 35, 45, 45, 4.8, 1.0);
  const core = solid(gCore);
  put(core, prism(P, front, rCoreR, rCoreI, 6, 32));
  core.sil.classList.add("lo");

  // Top manifold head / cap
  const [rCapR, rCapI] = rings(27, 27, 53, 53, 12.5, 1.8);
  const cap = solid(gCore);
  put(cap, prism(P, front, rCapR, rCapI, 34, 40));

  // Pressure gauge on top cap
  const [gcx, gcy] = P(44, 44, 42);
  mk("circle", { cx: gcx, cy: gcy, r: 4.8, class: "lo" }, gCore);
  mk("circle", { cx: gcx, cy: gcy, r: 3.6, class: "nf sil" }, gCore);
  const needle = mk("path", { class: "nf hi" }, gCore);
  needle.setAttribute("d", seg([gcx, gcy], [gcx + 2.8 * Math.cos(-0.3), gcy + 2.8 * Math.sin(-0.3)]));

  // 4. Clean Water Outlet (Right)
  const gOut = mk("g", {}, g);
  const runOut = mk("path", { class: "nf hi" }, gOut);
  runOut.setAttribute("d", seg(P(48, 32, 36), P(66, 14, 36)));
  const [rOutR, rOutI] = rings(63, 11, 69, 17, 2.6, 0.6);
  const pipeOut = solid(gOut);
  put(pipeOut, prism(P, front, rOutR, rOutI, 0, 36));
  pipeOut.sil.classList.add("hi");

  // 5. Dark Contaminant Particles (Entering left & getting trapped at core)
  const gParticles = mk("g", {}, g);
  const darkDots = [];
  for (let i = 0; i < NP; i++) {
    darkDots.push(mk("circle", { r: 1.4 + (i % 3) * 0.4, class: i % 2 === 0 ? "dot m" : "dot off" }, gParticles));
  }

  // 6. Clean Purified Water Nodes (Exiting right in bright flame orange)
  const cleanDots = [];
  for (let j = 0; j < NC; j++) {
    cleanDots.push(mk("circle", { r: 1.5, class: "dot" }, gOut));
  }

  // Motion math: dark particles enter, hit filter core barrier, and trap
  function inletPos(u, i) {
    if (u < 0.3) {
      const t = u / 0.3;
      return P(14, 66, t * 36);
    } else if (u < 0.65) {
      const t = (u - 0.3) / 0.35;
      return P(14 + t * 18, 66 - t * 18, 36);
    } else if (u < 0.85) {
      const t = (u - 0.65) / 0.2;
      return P(32 + t * 4, 48 - t * 6, 36 - t * 14);
    } else {
      // Trapped against filter core surface: stays stationary on membrane
      const ang = (i / NP) * Math.PI * 2;
      const r = 5.2;
      const z = 12 + ((i * 7) % 16);
      return P(40 + r * Math.cos(ang), 40 + r * Math.sin(ang), z);
    }
  }

  // Clean water emerges from inner core and flows smoothly out
  function outletPos(u) {
    if (u < 0.25) {
      const t = u / 0.25;
      return P(40 + t * 8, 40 - t * 8, 14 + t * 22);
    } else if (u < 0.7) {
      const t = (u - 0.25) / 0.45;
      return P(48 + t * 18, 32 - t * 18, 36);
    } else {
      const t = (u - 0.7) / 0.3;
      return P(66, 14, 36 - t * 32);
    }
  }

  const speed = 0.00032;

  const B = register(stage, (_dt, now) => {
    for (let i = 0; i < NP; i++) {
      const phase = (now * speed + i / NP) % 1;
      place(darkDots[i], inletPos(phase, i));
    }
    for (let j = 0; j < NC; j++) {
      const phase = (now * speed + j / NC) % 1;
      place(cleanDots[j], outletPos(phase));
    }
    return true; // Ambient continuous loop
  });
  bag.add(B.unregister);

  read.textContent = "rest";

  bag.add(pointer(stage, {
    move: () => { read.textContent = "purifying 99.9%"; },
    leave: () => { read.textContent = "rest"; },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: () => {},
    destroy: bag.dispose,
  };
}

hairline({
  name: "purifier",
  means: "A water purification unit: raw water with sediment enters, gets purified through the core, and clean water flows out.",
  rules: [4, 6, 7, 9],
  range: [0, 50, 100],
  mount,
});
