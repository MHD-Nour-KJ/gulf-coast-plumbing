/**
 * Plumbing: a residential water manifold and heater station on a foundation plinth.
 * The pointer selects supply, heater, distribution manifold, or the drain stack.
 * The active subsystem takes the bright accent stroke, its valve opens, and the
 * pressure gauge needle tracks system dynamics. The slider sets operating psi.
 */
const {
  Cam, clamp, facing, fit, open, poly, proj, rings, seg,
  solid, put, prism, unproj, spring, stepS, tween, tset, tval, tdone,
  disposer, mk, pointer, register, ringAt,
} = HL;

const TARGETS = [
  { x: 12, y: 60, z: 24, sr: 30, name: "supply · 60 psi", psi: 60 },
  { x: 40, y: 40, z: 24, sr: 32, name: "tank · 120°", psi: 65 },
  { x: 64, y: 16, z: 24, sr: 30, name: "manifold · hot", psi: 55 },
  { x: 60, y: 64, z: 16, sr: 30, name: "drain · clear", psi: 15 },
];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let basePsi = value, act = -1;

  const C = Cam(45, 0.5, 2.08);
  fit(C, [
    [-4, -4, -8], [84, 84, -8], [84, -4, 0], [-4, 84, 0],
    [40, 40, 56], [12, 60, 38], [64, 16, 46], [60, 64, 42],
  ], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  // 1. Plinth (ground slab) and guides
  const [pr, pi] = rings(-4, -4, 84, 84, 8, 2.0);
  const plinth = solid(g);
  put(plinth, prism(P, front, pr, pi, -8, 0));
  const guides = mk("path", { class: "nf dash lo" }, g);
  guides.setAttribute("d", seg(P(12, -2, 0), P(12, 82, 0)) + seg(P(40, -2, 0), P(40, 82, 0)) + seg(P(64, -2, 0), P(64, 82, 0)));

  // 2. Supply Intake Riser & Valve (Left: Subsystem 0)
  const gSupply = mk("g", {}, g);
  const [rsR, rsI] = rings(9, 57, 15, 63, 2.6, 0.6);
  const pipeSupply = solid(gSupply);
  put(pipeSupply, prism(P, front, rsR, rsI, 0, 24));
  const [rvR, rvI] = rings(8, 56, 16, 64, 3.4, 0.8);
  const valveSupply = solid(gSupply);
  put(valveSupply, prism(P, front, rvR, rvI, 24, 28));
  const handleSupply = mk("path", { class: "nf sil" }, gSupply);
  const supplyRun = mk("path", { class: "nf lo" }, gSupply);
  supplyRun.setAttribute("d", seg(P(12, 60, 24), P(12, 60, 34)) + seg(P(12, 60, 34), P(28, 60, 34)) + seg(P(28, 60, 34), P(28, 48, 28)));

  // 3. Hot Distribution Manifold (Right: Subsystem 2)
  const gHot = mk("g", {}, g);
  const hotFeed = mk("path", { class: "nf sil" }, gHot);
  const [rhR, rhI] = rings(62, 14, 66, 32, 1.8, 0.5);
  const hotHeader = solid(gHot);
  put(hotHeader, prism(P, front, rhR, rhI, 20, 24));
  const hotBranches = mk("path", { class: "nf lo" }, gHot);
  hotBranches.setAttribute("d", seg(P(64, 18, 22), P(74, 18, 22)) + seg(P(64, 28, 22), P(74, 28, 22)));
  const handleHot = mk("path", { class: "nf sil" }, gHot);

  // 4. Water Heater Tank & Expansion Vessel (Center: Subsystem 1)
  const gTank = mk("g", {}, g);
  const [rtR, rtI] = rings(28, 28, 52, 52, 11, 1.8);
  const tankBody = solid(gTank);
  const [rcR, rcI] = rings(30, 30, 50, 50, 9, 1.4);
  const tankCap = solid(gTank);
  const [reR, reI] = rings(35, 35, 45, 45, 4.5, 0.9);
  const tankExp = solid(gTank);

  // Analog pressure gauge on tank front face
  const gDial = mk("g", {}, gTank);
  const dialNeedle = mk("path", { class: "nf sil" }, gDial);
  const dialFace = mk("circle", { r: 5.5, class: "lo" }, gDial);
  const dialRim = mk("circle", { r: 4.2, class: "nf sil" }, gDial);
  const gaugeSp = spring(basePsi, { k: 90, c: 16 });

  // 5. Sanitary Drain Stack & Cleanout (Front: Subsystem 3)
  const gDrain = mk("g", {}, g);
  const [rdR, rdI] = rings(56, 60, 64, 68, 3.6, 0.9);
  const drainStack = solid(gDrain);
  put(drainStack, prism(P, front, rdR, rdI, 0, 40));
  const [roR, roI] = rings(58, 70, 62, 74, 1.8, 0.5);
  const drainPlug = solid(gDrain);
  const drainWye = mk("path", { class: "nf sil" }, gDrain);
  drainWye.setAttribute("d", seg(P(48, 54, 22), P(58, 62, 16)));

  // Animation tweens: 700ms on EASE_LIFT
  const twSupply = tween(0, 700), twLift = tween(0, 700), twHot = tween(0, 700), twPlug = tween(0, 700);

  function drawDynamic(now) {
    const lift = tval(twLift, now);
    put(tankBody, prism(P, front, rtR, rtI, 0, 36 + lift * 0.4));
    put(tankCap, prism(P, front, rcR, rcI, 36 + lift * 0.4, 39 + lift * 0.8));
    put(tankExp, prism(P, front, reR, reI, 39 + lift * 0.8, 50 + lift));

    const [dcx, dcy] = P(48, 48, 20 + lift * 0.4);
    dialFace.setAttribute("cx", dcx); dialFace.setAttribute("cy", dcy);
    dialRim.setAttribute("cx", dcx); dialRim.setAttribute("cy", dcy);

    const psi = gaugeSp.x;
    const ang = -0.8 + ((psi - 20) / 70) * 2.8;
    dialNeedle.setAttribute("d", seg([dcx, dcy], [dcx + 3.4 * Math.cos(ang), dcy + 3.4 * Math.sin(ang)]));

    hotFeed.setAttribute("d", seg(P(46, 34, 39 + lift * 0.8), P(46, 34, 45 + lift)) + seg(P(46, 34, 45 + lift), P(64, 34, 45 + lift * 0.4)) + seg(P(64, 34, 45 + lift * 0.4), P(64, 24, 24)));

    const aS = tval(twSupply, now);
    handleSupply.setAttribute("d", seg(P(12, 60, 28), P(12 + 7 * Math.cos(aS), 60 + 7 * Math.sin(aS), 28)));

    const aH = tval(twHot, now);
    handleHot.setAttribute("d", seg(P(64, 18, 24), P(64 + 6 * Math.cos(aH), 18 + 6 * Math.sin(aH), 24)));

    const pY = tval(twPlug, now);
    const [rpR, rpI] = rings(58, 70 + pY, 62, 74 + pY, 1.8, 0.5);
    put(drainPlug, prism(P, front, rpR, rpI, 6, 10));
  }

  const B = register(stage, (dt, now) => {
    let moving = false;
    if (stepS(gaugeSp, dt)) moving = true;
    drawDynamic(now);
    if (!tdone(twSupply, now) || !tdone(twLift, now) || !tdone(twHot, now) || !tdone(twPlug, now)) moving = true;
    return moving;
  });
  bag.add(B.unregister);

  function hit([sx, sy]) {
    let best = -1, minD = 36;
    for (let i = 0; i < TARGETS.length; i++) {
      const [tx, ty] = P(TARGETS[i].x, TARGETS[i].y, TARGETS[i].z);
      const d = Math.hypot(sx - tx, sy - ty);
      if (d < TARGETS[i].sr && d < minD) { minD = d; best = i; }
    }
    return best;
  }

  function setActive(a) {
    if (a === act) return;
    const now = performance.now();
    act = a;

    // Rule 04: One highlight stroke. Rest mark on supply; pointer choice takes it.
    pipeSupply.sil.classList.toggle("hi", a === 0 || a < 0);
    valveSupply.sil.classList.toggle("hi", a === 0);
    tankBody.sil.classList.toggle("hi", a === 1);
    tankCap.sil.classList.toggle("hi", a === 1);
    tankExp.sil.classList.toggle("hi", a === 1);
    hotFeed.classList.toggle("hi", a === 2);
    hotHeader.sil.classList.toggle("hi", a === 2);
    drainStack.sil.classList.toggle("hi", a === 3);

    // Rule 08: Tweens for discrete actions
    tset(twSupply, a === 0 ? 1.2 : 0, now, 0);
    tset(twLift, a === 1 ? 16 : 0, now, 0);
    tset(twHot, a === 2 ? 1.2 : 0, now, 0);
    tset(twPlug, a === 3 ? 5 : 0, now, 0);

    const targetPsi = a >= 0 ? TARGETS[a].psi : basePsi;
    gaugeSp.t = targetPsi;

    read.textContent = a >= 0 ? TARGETS[a].name : "rest";
    B.wake();
  }

  setActive(-1);

  bag.add(pointer(stage, {
    move: (p) => setActive(hit(p)),
    leave: () => setActive(-1),
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => {
      basePsi = v;
      if (act < 0) { gaugeSp.t = basePsi; B.wake(); }
    },
    destroy: bag.dispose,
  };
}

hairline({
  name: "plumbing",
  means: "A home water manifold: hover supply, heater, delivery or drainage to inspect flow dynamics and pressure.",
  rules: [1, 4, 8, 9],
  range: [20, 60, 90],
  mount,
});
