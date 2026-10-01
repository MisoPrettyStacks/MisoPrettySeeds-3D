/* MisoPretty Seeds — 3D & motion layer.
   Petal + glitter WebGL hero, scroll reveals, 3D tilt cards,
   magnetic buttons, hero parallax. Content untouched. */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---------- 1. Scroll reveals ---------- */
  try {
    var revealEls = document.querySelectorAll(
      '.seed-section__heading, .seed-steps li, .seed-about > div, ' +
      '.seed-faq details, .seed-final h2, .seed-final p, .seed-final a, ' +
      '.seed-feature-card, .seed-scarcity'
    );
    if ('IntersectionObserver' in window && !reduceMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('seed-reveal--visible');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      revealEls.forEach(function (el, i) {
        el.classList.add('seed-reveal');
        el.style.transitionDelay = Math.min(i % 4, 3) * 70 + 'ms';
        io.observe(el);
      });
    }
  } catch (err) { /* reveals are decorative */ }

  /* ---------- 2. Hero parallax on scroll (uses `translate` so it composes
     with the existing rise-in keyframe animation) ---------- */
  try {
    var hero = document.querySelector('.seed-hero');
    var hl = document.querySelector('.seed-hero__headline');
    var hc = document.querySelector('.seed-hero__copy');
    var ticking = false;
    function parallax() {
      ticking = false;
      if (!hero) return;
      var y = window.scrollY || window.pageYOffset;
      var h = hero.offsetHeight || 1;
      if (y < h * 1.2 && !reduceMotion) {
        if (hl) hl.style.translate = '0 ' + (y * 0.22).toFixed(1) + 'px';
        if (hc) hc.style.translate = '0 ' + (y * 0.1).toFixed(1) + 'px';
      }
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(parallax); }
    }, { passive: true });
  } catch (err) { /* parallax is decorative */ }

  /* ---------- 3. 3D tilt on product cards ---------- */
  try {
    if (finePointer && !reduceMotion) {
      document.querySelectorAll('.seed-product').forEach(function (card) {
        // Free `transform` for tilt once the entrance animation is done.
        card.addEventListener('animationend', function () {
          card.style.animation = 'none';
        }, { once: true });
        // Safety: also clear after 2.5s in case animationend is missed.
        setTimeout(function () { card.style.animation = 'none'; }, 2500);
        card.addEventListener('mousemove', function (e) {
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform =
            'perspective(900px) rotateY(' + (px * 10).toFixed(2) + 'deg)' +
            ' rotateX(' + (-py * 10).toFixed(2) + 'deg) translateZ(6px)';
        });
        card.addEventListener('mouseleave', function () {
          card.style.transform = '';
        });
      });
    }
  } catch (err) { /* tilt is decorative */ }

  /* ---------- 4. Magnetic buttons ---------- */
  try {
    if (finePointer && !reduceMotion) {
      document.querySelectorAll('.seed-button').forEach(function (btn) {
        btn.addEventListener('mousemove', function (e) {
          var r = btn.getBoundingClientRect();
          var dx = e.clientX - (r.left + r.width / 2);
          var dy = e.clientY - (r.top + r.height / 2);
          btn.style.transform =
            'translate(' + (dx * 0.14).toFixed(1) + 'px,' + (dy * 0.22).toFixed(1) + 'px)';
        });
        btn.addEventListener('mouseleave', function () {
          btn.style.transform = '';
        });
      });
    }
  } catch (err) { /* magnetic is decorative */ }

  /* ---------- 5. WebGL hero: floating petals + glitter ---------- */
  function petalTexture() {
    var c = document.createElement('canvas');
    c.width = 128; c.height = 160;
    var x = c.getContext('2d');
    var g = x.createRadialGradient(64, 92, 8, 64, 84, 95);
    g.addColorStop(0, '#fffafc');
    g.addColorStop(0.55, '#ffc7dc');
    g.addColorStop(1, '#f98fb8');
    x.fillStyle = g;
    x.beginPath();
    x.moveTo(64, 6);
    x.bezierCurveTo(118, 42, 124, 112, 64, 154);
    x.bezierCurveTo(4, 112, 10, 42, 64, 6);
    x.fill();
    x.strokeStyle = 'rgba(186, 92, 122, 0.35)';
    x.lineWidth = 3;
    x.beginPath();
    x.moveTo(64, 16);
    x.quadraticCurveTo(60, 82, 64, 146);
    x.stroke();
    return new THREE.CanvasTexture(c);
  }

  function sparkleTexture() {
    var c = document.createElement('canvas');
    c.width = 64; c.height = 64;
    var x = c.getContext('2d');
    var g = x.createRadialGradient(32, 32, 1, 32, 32, 30);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(255,244,214,0.9)');
    g.addColorStop(1, 'rgba(255,244,214,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 64);
    // cross flare
    x.strokeStyle = 'rgba(255,255,255,0.85)';
    x.lineWidth = 3;
    x.beginPath(); x.moveTo(32, 4); x.lineTo(32, 60); x.stroke();
    x.beginPath(); x.moveTo(4, 32); x.lineTo(60, 32); x.stroke();
    return new THREE.CanvasTexture(c);
  }

  function initWebGL() {
    var canvas = document.getElementById('seedWebgl');
    var heroEl = document.querySelector('.seed-hero');
    if (!canvas || !heroEl || !window.THREE) return;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    } catch (err) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 60);
    camera.position.set(0, 0, 10);

    scene.add(new THREE.AmbientLight(0xfff2e8, 1.25));
    var sun = new THREE.DirectionalLight(0xfff6e0, 1.0);
    sun.position.set(4, 6, 6);
    scene.add(sun);
    var rim = new THREE.DirectionalLight(0xffc4da, 1.0);
    rim.position.set(-5, -2, 4);
    scene.add(rim);

    var isMobile = heroEl.clientWidth < 620;
    var PETALS = isMobile ? 30 : 88;
    var SPARKS = isMobile ? 90 : 200;

    // Bent petal geometry (cupped, tapered) so instances read as 3D.
    // Light, bright pinks drifting like confetti — never dark, never covering the headline.
    var PW = 0.6, PH = 0.86;
    var geo = new THREE.PlaneGeometry(PW, PH, 6, 6);
    var pos = geo.attributes.position;
    for (var i = 0; i < pos.count; i++) {
      var px = pos.getX(i), py = pos.getY(i);
      var bend = Math.sin((py / PH + 0.5) * Math.PI) * 0.2;
      var cup = Math.pow(Math.abs(px) / (PW / 2), 2) * 0.11;
      pos.setZ(i, bend + cup);
      pos.setX(i, px * (1 - Math.abs(py) / PH * 0.25));
    }
    geo.computeVertexNormals();

    var mat = new THREE.MeshStandardMaterial({
      map: petalTexture(),
      transparent: true,
      side: THREE.DoubleSide,
      roughness: 0.55,
      metalness: 0.05,
      depthWrite: false
    });
    var petals = new THREE.InstancedMesh(geo, mat, PETALS);
    petals.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(petals);

    var dummy = new THREE.Object3D();
    var col = new THREE.Color();
    var data = [];
    function pickColor() {
      // Light, bright pinks for a white page — luminous, never dark.
      var r = Math.random();
      if (r < 0.3) return col.setHSL(0.94 + Math.random() * 0.02, 0.9, 0.82 + Math.random() * 0.05);   // light pink
      if (r < 0.58) return col.setHSL(0.93, 0.88, 0.72 + Math.random() * 0.05);                       // bright pink
      if (r < 0.8) return col.setHSL(0.96, 0.8, 0.88 + Math.random() * 0.04);                        // pale blush
      return col.setHSL(0.945, 0.85, 0.77 + Math.random() * 0.05);                                   // candy rose
    }
    for (var p = 0; p < PETALS; p++) {
      data.push({
        bx: (Math.random() - 0.5) * 16,
        by: (Math.random() - 0.5) * 9,
        bz: -3.5 + Math.random() * 5,
        ph: Math.random() * Math.PI * 2,
        ph2: Math.random() * Math.PI * 2,
        sp: 0.25 + Math.random() * 0.5,
        rx: (Math.random() - 0.5) * 1.4,
        ry: (Math.random() - 0.5) * 1.4,
        s: 0.6 + Math.random() * 0.75
      });
      petals.setColorAt(p, pickColor());
    }
    if (petals.instanceColor) petals.instanceColor.needsUpdate = true;

    // Glitter: two twinkling point layers.
    var sparkTex = sparkleTexture();
    var sparkLayers = [];
    for (var L = 0; L < 2; L++) {
      var n = Math.floor(SPARKS / 2);
      var sp = new Float32Array(n * 3);
      var sc = new Float32Array(n * 3);
      for (var s = 0; s < n; s++) {
        sp[s * 3] = (Math.random() - 0.5) * 15;
        sp[s * 3 + 1] = (Math.random() - 0.5) * 9;
        sp[s * 3 + 2] = -3 + Math.random() * 5;
        var gold = Math.random() < 0.6;
        sc[s * 3] = 1;
        sc[s * 3 + 1] = gold ? 0.8 : 0.72;
        sc[s * 3 + 2] = gold ? 0.52 : 0.8;
      }
      var sg = new THREE.BufferGeometry();
      sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
      sg.setAttribute('color', new THREE.BufferAttribute(sc, 3));
      var sm = new THREE.PointsMaterial({
        size: 0.14, map: sparkTex, transparent: true, depthWrite: false,
        blending: THREE.NormalBlending, vertexColors: true, opacity: 0.85,
        sizeAttenuation: true
      });
      var pts = new THREE.Points(sg, sm);
      pts.userData.phase = L * Math.PI;
      scene.add(pts);
      sparkLayers.push(pts);
    }

    // Mouse parallax.
    var mx = 0, my = 0, cx = 0, cy = 0;
    heroEl.addEventListener('mousemove', function (e) {
      var r = heroEl.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      my = ((e.clientY - r.top) / r.height - 0.5) * 2;
    });
    heroEl.addEventListener('mouseleave', function () { mx = 0; my = 0; });

    function resize() {
      var w = heroEl.clientWidth, h = heroEl.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    var running = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        running = es[0].isIntersecting && !document.hidden;
      }).observe(heroEl);
    }
    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
    });

    var clock = new THREE.Clock();
    (function tick() {
      requestAnimationFrame(tick);
      if (!running) return;
      var t = clock.getElapsedTime();

      for (var k = 0; k < PETALS; k++) {
        var d = data[k];
        dummy.position.set(
          d.bx + Math.sin(t * d.sp * 0.7 + d.ph2) * 0.7,
          d.by + Math.sin(t * d.sp + d.ph) * 0.55 + Math.sin(t * 0.12 + d.ph) * 0.3,
          d.bz
        );
        dummy.rotation.set(t * d.rx + d.ph, t * d.ry + d.ph2, Math.sin(t * 0.4 + d.ph) * 0.5);
        dummy.scale.setScalar(d.s);
        dummy.updateMatrix();
        petals.setMatrixAt(k, dummy.matrix);
      }
      petals.instanceMatrix.needsUpdate = true;

      sparkLayers.forEach(function (pts) {
        pts.material.opacity = 0.45 + 0.4 * Math.abs(Math.sin(t * 1.6 + pts.userData.phase));
        pts.rotation.z = Math.sin(t * 0.05) * 0.05;
      });

      cx += (mx * 1.1 - cx) * 0.04;
      cy += (my * 0.7 - cy) * 0.04;
      camera.position.x = cx;
      camera.position.y = -cy;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    })();
  }

  /* ---------- 5. Vector 3D artwork (crisp SVG, zero raster) ---------- */
  try {
    var cssVar = function (name, fb) {
      var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v || fb;
    };
    var INK = cssVar('--ink', '#23301f');
    var ROSE = cssVar('--rose-deep', '#b83a68');
    var uidc = 0;

    var esc = function (s) {
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };

    var hexLerp = function (a, b, t) {
      var p = function (h) {
        h = h.replace('#', '');
        if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
        return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
      };
      var A = p(a), B = p(b);
      var m = A.map(function (v, k) { return Math.round(v + (B[k] - v) * t); });
      return '#' + m.map(function (v) { var s = v.toString(16); return s.length < 2 ? '0' + s : s; }).join('');
    };

    /* Layered extruded text. lines: [{x, y, anchor, segs:[{t,font,weight,style,size,ls,face,deep}]}] */
    var extrudedTextSVG = function (lines, o) {
      var parts = [];
      lines.forEach(function (L) {
        for (var i = o.layers; i >= 1; i--) {
          var tspans = L.segs.map(function (s) {
            return '<tspan font-family="' + s.font + '" font-weight="' + s.weight + '"' +
              (s.style ? ' font-style="' + s.style + '"' : '') +
              ' font-size="' + s.size + '"' +
              (s.ls ? ' letter-spacing="' + s.ls + '"' : '') +
              ' fill="' + hexLerp(s.face, s.deep, i / o.layers) + '">' + esc(s.t) + '</tspan>';
          }).join('');
          parts.push('<text x="' + (L.x + i * o.dx).toFixed(1) + '" y="' + (L.y + i * o.dy).toFixed(1) +
            '" text-anchor="' + (L.anchor || 'middle') + '">' + tspans + '</text>');
        }
        var faceSpans = L.segs.map(function (s) {
          return '<tspan font-family="' + s.font + '" font-weight="' + s.weight + '"' +
            (s.style ? ' font-style="' + s.style + '"' : '') +
            ' font-size="' + s.size + '"' +
            (s.ls ? ' letter-spacing="' + s.ls + '"' : '') +
            ' fill="' + s.face + '">' + esc(s.t) + '</tspan>';
        }).join('');
        parts.push('<text x="' + L.x + '" y="' + L.y + '" text-anchor="' + (L.anchor || 'middle') + '">' + faceSpans + '</text>');
      });
      return '<svg class="' + o.cls + '" viewBox="0 0 ' + o.w + ' ' + o.h + '" aria-hidden="true" focusable="false">' +
        parts.join('') + '</svg>';
    };

    /* Hero: Flower Seeds in chunky extruded vector 3D */
    var heroH1 = document.querySelector('.seed-hero__headline');
    if (heroH1) {
      heroH1.setAttribute('aria-label', 'Flower Seeds');
      heroH1.innerHTML = extrudedTextSVG([
        { x: 460, y: 178, segs: [{ t: 'Flower', font: "'Playfair Display',serif", weight: 650, size: 170, face: INK, deep: '#161f15' }] },
        { x: 460, y: 348, segs: [{ t: 'Seeds', font: "'Instrument Serif',serif", weight: 400, style: 'italic', size: 162, face: ROSE, deep: '#7e2c4c' }] }
      ], { w: 920, h: 430, layers: 8, dx: 1.6, dy: 2.0, cls: 'vector3d vector3d--hero' });
    }

    /* Section headings in vector 3D */
    var vectorizeHeading = function (sel, segs) {
      var h = document.querySelector(sel);
      if (!h) return;
      h.setAttribute('aria-label', h.textContent.trim());
      h.innerHTML = extrudedTextSVG(
        [{ x: 390, y: 98, segs: segs }],
        { w: 780, h: 152, layers: 5, dx: 1.3, dy: 1.6, cls: 'vector3d vector3d--title' }
      );
    };
    var greenSeg = function (t) {
      return { t: t, font: "'Playfair Display',serif", weight: 700, size: 64, face: INK, deep: '#161f15' };
    };
    var roseSeg = function (t) {
      return { t: t, font: "'Instrument Serif',serif", weight: 400, style: 'italic', size: 66, face: ROSE, deep: '#7e2c4c' };
    };
    vectorizeHeading('#shop .seed-section__heading h2', [greenSeg('Shop the '), roseSeg('seeds')]);
    vectorizeHeading('#how .seed-section__heading h2', [greenSeg('How ordering '), roseSeg('works')]);

    /* 3D vector seed packet, drawn fresh per variety */
    var PACKET_ART = {
      'Common Sunflower':  { petal: '#f2b41c', deep: '#cf920e', heart: '#7a4d16' },
      'Cosmos':            { petal: '#ef7fae', deep: '#d15c8e', heart: '#f6c945' },
      'Mammoth Sunflower': { petal: '#eda21a', deep: '#c07f0e', heart: '#5f3f14' },
      'Nasturtium':        { petal: '#f0702e', deep: '#c95115', heart: '#8f2f0d' },
      'Poppy':             { petal: '#e4574a', deep: '#bd382c', heart: '#40271d' },
      'Lavender':          { petal: '#a184d6', deep: '#7f63b4', heart: '#55428a' }
    };
    var PACKET_DEFAULT = { petal: '#e08aa8', deep: '#bd6385', heart: '#f2c14e' };

    var packetSVG = function (name, art) {
      var id = 'pk' + (++uidc);
      var petals = '';
      for (var k = 0; k < 8; k++) {
        petals += '<ellipse cx="152" cy="190" rx="14" ry="27" fill="' + (k % 2 ? art.deep : art.petal) +
          '" transform="rotate(' + (k * 45) + ' 152 217)"/>';
      }
      var nameSize = name.length > 14 ? 19 : 23;
      return '<svg class="packet3d" viewBox="0 0 320 400" role="img" aria-label="' + esc(name) + ' seed packet">' +
        '<defs>' +
          '<linearGradient id="' + id + 'p" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#fdf3e1"/>' +
          '</linearGradient>' +
          '<linearGradient id="' + id + 's" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0" stop-color="#ecd9ae"/><stop offset="1" stop-color="#d8ba86"/>' +
          '</linearGradient>' +
          '<filter id="' + id + 'b" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="7"/></filter>' +
          '<clipPath id="' + id + 'c"><rect x="48" y="92" width="208" height="248" rx="10"/></clipPath>' +
        '</defs>' +
        '<ellipse cx="170" cy="370" rx="102" ry="13" fill="#4a3a26" opacity="0.22" filter="url(#' + id + 'b)"/>' +
        '<polygon points="48,92 80,70 288,70 256,92" fill="#f8efdc"/>' +
        '<polygon points="256,92 288,70 288,318 256,340" fill="url(#' + id + 's)"/>' +
        '<g clip-path="url(#' + id + 'c)">' +
          '<rect x="48" y="92" width="208" height="248" fill="url(#' + id + 'p)"/>' +
          '<path d="M48 92 h208 v10 l-8 -5 -8 5 -8 -5 -8 5 -8 -5 -8 5 -8 -5 -8 5 -8 -5 -8 5 -8 -5 -8 5 -8 -5 -8 5 -8 -5 -8 5 -8 -5 -8 5 -8 -5 -8 5 -8 -5 -8 5 -8 -5 -8 5 -8 -5 -8 5 -8 -5 -8 5 v-10 z" fill="#f3e5c6"/>' +
          '<polygon points="48,92 118,92 66,340 48,340" fill="#ffffff" opacity="0.13"/>' +
          '<text x="152" y="140" text-anchor="middle" font-family="\'Instrument Serif\',serif" font-style="italic" font-size="27" fill="#97784c">MisoPretty</text>' +
          '<text x="152" y="161" text-anchor="middle" font-family="\'Inter Tight\',sans-serif" font-weight="600" font-size="10" letter-spacing="4" fill="#b08d55">FLOWER SEEDS</text>' +
          '<g>' + petals +
            '<path d="M152 244 q -3 14 -16 24" stroke="#7d9b6a" stroke-width="4" fill="none" stroke-linecap="round"/>' +
            '<ellipse cx="130" cy="264" rx="13" ry="6.5" fill="#8aa873" transform="rotate(-28 130 264)"/>' +
            '<circle cx="152" cy="217" r="13" fill="' + art.heart + '"/>' +
            '<circle cx="147" cy="213" r="2.4" fill="#ffffff" opacity="0.75"/><circle cx="157" cy="220" r="1.8" fill="#ffffff" opacity="0.6"/>' +
          '</g>' +
          '<text x="152" y="302" text-anchor="middle" font-family="\'Playfair Display\',serif" font-weight="700" font-size="' + nameSize + '" fill="#2e3b28">' + esc(name) + '</text>' +
          '<line x1="98" y1="314" x2="206" y2="314" stroke="#e0cba0" stroke-width="1.5"/>' +
          '<text x="152" y="330" text-anchor="middle" font-family="\'Inter Tight\',sans-serif" font-weight="600" font-size="10" letter-spacing="3" fill="#a98a5f">~ 50 SEEDS</text>' +
          '<rect x="58" y="100" width="188" height="230" rx="6" fill="none" stroke="#e7d3ab" stroke-width="1.5" opacity="0.8"/>' +
        '</g>' +
        '<rect x="48" y="92" width="208" height="248" rx="10" fill="none" stroke="#e2cfa8" stroke-width="1.5"/>' +
      '</svg>';
    };

    document.querySelectorAll('img[src*="seed-packet-white"]').forEach(function (img) {
      var name = 'MisoPretty';
      var card = img.closest('.seed-product');
      if (card) {
        var n = card.querySelector('.seed-product__name');
        if (n) name = n.textContent.trim();
      }
      var tmp = document.createElement('div');
      tmp.innerHTML = packetSVG(name, PACKET_ART[name] || PACKET_DEFAULT);
      var svg = tmp.firstChild;
      if (img.classList.contains('seed-feature-card__image')) svg.classList.add('seed-feature-card__image');
      /* About packet becomes a museum piece inside the arched frame */
      if (img.closest('.seed-about') && img.parentElement) {
        img.parentElement.classList.add('seed-about__frame');
        svg.classList.add('packet3d--museum');
      }
      img.replaceWith(svg);
    });
  } catch (e) { /* vector art is enhancement-only; page works without it */ }

  if (!reduceMotion) {
    if (window.THREE) {
      initWebGL();
    } else {
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.158.0/three.min.js';
      s.onload = initWebGL;
      s.onerror = function () { /* hero still looks great without WebGL */ };
      document.head.appendChild(s);
    }
  }
})();
