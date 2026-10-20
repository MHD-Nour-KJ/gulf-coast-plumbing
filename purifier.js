/**
 * Sump: a whole-home filter under its brass head. Two risers bring the water
 * into the head; sediment falls through the clear bowl onto the pleated
 * cartridge and settles into the mound on the floor. The pointer names the
 * part it is over; over the sump it slows the fall so one grain can be read.
 */
const {
  Cam, circ, clamp, facing, fit, hull, lerp, mk, open, place, pointer, poly, proj,
  prism, put, rad, register, ringAt, run, seg, solid, spring, stepS, disposer,
} = HL;

const A = rad(45), CA = Math.cos(A), SA = Math.sin(A);
const R = 15, ZB = 9, ZK = 12, ZT = 44;
const CR = 12.4, CZ0 = 13, CZ1 = 38;
const BR = 15.8, BZ0 = 39.6, BZ1 = 43.8;
const RX = 6.5, RR = 2.8, RZ = 60;
const NG = 6, GZ0 = 42, GZ1 = 12.6, GR = 12.8;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let dur = clamp(value, 3, 14), act = -2;
  const rate = spring(1), lift = spring(0), drop = spring(0);

  const C = Cam(45, 0.5, 5.2);
  fit(C, [[-RX - RR, -RR, RZ], [RX + RR, RR, RZ], [0, 0, RZ], [0, 0, ZB], [R, R, ZB], [-R, -R, ZB]], 200, 156);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  const disc = (x, y, r, n = 32) => circ(r, n).map((q) => ({ u: q.u + x, v: q.v + y, nu: q.nu, nv: q.nv }));
  const radAt = (z) => z >= ZK ? R : R * Math.sqrt(Math.max(0, 1 - ((ZK - z) / (ZK - ZB)) ** 2));
  const floor = (r) => ZK - (ZK - ZB) * Math.sqrt(Math.max(0, 1 - (r / R) ** 2));
  const rimRing = (z, r, n = 32) => open(ringAt(P, disc(0, 0, r, n), z));

  // The clear bowl: whole rings through its profile, so the near side of the
  // base draws as an ellipse and not as a cone. A second, inset shell draws
  // the wall.
  function shell() {
    const q = [];
    for (let k = 0; k <= 18; k++) {
      const z = lerp(ZB, ZT, k / 18);
      q.push(...ringAt(P, disc(0, 0, radAt(z), 24), z));
    }
    return poly(hull(q));
  }

  // Cartridge: silhouette, the rim and bore the eye starts on, and its pleats.
  // It rides in [core] so the whole element lifts out over the sump.
  const core = mk('g', {}, g);
  const cart = solid(core);
  put(cart, prism(P, front, disc(0, 0, CR, 32), disc(0, 0, CR - 1.2, 32), CZ0, CZ1));
  const top = mk("path", { class: "nf lo" }, core);
  top.setAttribute("d", rimRing(CZ1, CR) + rimRing(CZ1, 4.2) + rimRing(CZ1 - 2.8, 3.6));
  const low = mk("path", { class: "nf" }, core);
  low.setAttribute("d", rimRing(CZ0, CR));
  const pleats = mk("path", { class: "nf" }, core);
  const pl = [];
  for (let k = 0; k < 15; k++) {
    const a = rad(-39 + k * 12);
    pl.push(seg(P(CR * Math.cos(a), CR * Math.sin(a), CZ0 + 1.2), P(CR * Math.cos(a), CR * Math.sin(a), CZ1 - 0.8)));
  }
  pleats.setAttribute("d", pl.join(""));

  // The bowl and what settles in it.
  const sump = mk("g", {}, g);

  // Grains ride the cartridge's face, drifting round as they go; the mound
  // below is painted over them, so each one disappears as it lands
  const grain = [];
  for (let k = 0; k < NG; k++) grain.push(mk("circle", { r: 1.9, class: k % 3 ? "dot m" : "dot off" }, sump));
  const ph = grain.map((_, k) => k / NG);
  const at = (k) => {
    const t = ph[k], a = rad(-30 + k * 30 + t * 44), r = GR - t * 0.6;
    return P(r * Math.cos(a), r * Math.sin(a), lerp(GZ0, GZ1, t * t * 0.4 + t * 0.6));
  };

  const mound = mk("g", {}, sump);
  const settled = [];
  for (let k = 0; k < 14; k++) {
    const a = rad(-40 + k * 26), rr = 1.4 + (k % 5) * 2.2;
    const d = mk("circle", { r: 1.3 + (k % 3) * 0.3, class: k % 4 ? "dot off" : "dot m" }, mound);
    settled.push(d);
    place(d, P(rr * Math.cos(a), rr * Math.sin(a), floor(rr) + 0.5 + (k % 3) * 0.3));
  }

  // Bowl over its contents, then the clamp that hides a grain at its spawn
  const bowl = mk("path", { class: "nf sil" }, sump);
  bowl.setAttribute("d", shell());

  const band = solid(sump);
  put(band, prism(P, front, disc(0, 0, BR, 36), disc(0, 0, BR - 1, 36), BZ0, BZ1));
  [32, 58].forEach((d) => {
    const a = rad(d), b = mk("circle", { r: 1.3, class: "dot off" }, sump);
    place(b, P(BR * Math.cos(a), BR * Math.sin(a), 41.7));
  });

  // Head: a cap wider than the bowl, flat-topped, over the bowl's rim
  const head = solid(g);
  head.sil.setAttribute("d", poly(hull(ringAt(P, disc(0, 0, 16.2, 44), ZT).concat(ringAt(P, disc(0, 0, 15.6, 44), 48.6)))));
  head.cr.setAttribute("d", open(ringAt(P, run(disc(0, 0, 15.7, 44), front), 48.6)));

  // Two risers on the diagonal, so both stand at one height on screen. Each
  // seats into a hub on the head, so the pipe reads as fitted, not perched.
  const risers = [];
  [-1, 1].forEach((s) => {
    const ring = (r) => disc(s * RX, -s * RX, r, 24);
    const hub = solid(g), pipe = solid(g), nut = solid(g);
    const face = mk("path", { class: "nf lo" }, g);
    hub.sil.setAttribute("d", poly(hull(ringAt(P, ring(4.8), 45.6).concat(ringAt(P, ring(4.4), 50.6)))));
    pipe.sil.setAttribute("d", poly(hull(ringAt(P, ring(RR), 50).concat(ringAt(P, ring(RR), RZ - 3.2)))));
    nut.sil.setAttribute("d", poly(hull(ringAt(P, ring(4), RZ - 3.2).concat(ringAt(P, ring(4), RZ)))));
    face.setAttribute("d", open(ringAt(P, ring(4), RZ)));
    risers.push(hub.sil, pipe.sil, nut.sil, face);
  });

  const base = settled.map((d) => d.getAttribute("class"));
  const B = register(stage, (dt) => {
    stepS(rate, dt);
    stepS(lift, dt);
    stepS(drop, dt);
    sump.setAttribute("transform", `translate(0 ${drop.x.toFixed(2)})`);
    core.setAttribute("transform", `translate(0 ${(-lift.x).toFixed(2)})`);
    const step = (dt * rate.x) / dur;
    for (let k = 0; k < NG; k++) {
      ph[k] = (ph[k] + step) % 1;
      place(grain[k], at(k));
    }
    return true;
  });
  bag.add(B.unregister);

  const parts = [
    { name: "inlet", p: P(-RX, RX, 54), r: 22, hi: [risers[0], risers[1]] },
    { name: "outlet", p: P(RX, -RX, 54), r: 22, hi: [risers[4], risers[5]] },
    { name: "head", p: P(0, 0, 46), r: 34, hi: [head.sil] },
    { name: "sump", p: P(0, 0, 26), r: 48, hi: [bowl] },
  ];

  function pick([sx, sy]) {
    let best = -1, min = 1e9;
    parts.forEach((q, i) => {
      const d = Math.hypot(sx - q.p[0], sy - q.p[1]);
      if (d < q.r && d < min) { min = d; best = i; }
    });
    return best;
  }

  function setActive(a) {
    if (a === act) return;
    act = a;
    parts.forEach((q, i) => q.hi.forEach((s) => s.classList.toggle("hi", i === a)));
    top.setAttribute("class", a < 0 ? "nf hi" : "nf lo");
    settled.forEach((d, i) => d.setAttribute("class", a === 3 ? "dot" : base[i]));
    rate.t = a === 3 ? 0.16 : 1;
    lift.t = a === 3 ? 6 : 0;
    drop.t = a === 3 ? 14 : 0;
    read.textContent = a < 0 ? "rest" : parts[a].name;
    B.wake();
  }

  setActive(-1);
  bag.add(pointer(stage, { move: (p) => setActive(pick(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { dur = clamp(v, 3, 14); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "purifier",
  means: "A whole-home water filter where sediment runs down the pleated cartridge and settles in the sump.",
  rules: [1, 4, 7, 9],
  range: [3, 7, 14],
  mount,
});
