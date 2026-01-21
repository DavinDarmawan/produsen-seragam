(() => {
  const canvas = document.getElementById("heroCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // Warna oranye dan biru profesional
  const colors = [
    "#ff6600",
    "#ff7722",
    "#ff8833",
    "#ff9944",
    "#ffaa55",
    "#ffbb66",
    "#ff5500",
    "#ff4400",
    "#2196F3",
    "#1976D2",
    "#0D47A1",
    "#1E88E5",
    "#42A5F5",
    "#64B5F6",
    "#90CAF9",
    "#ffffff",
    "#f5f5f5",
  ];

  // Sprite yang akan dijatuhkan (pakai aset yang sudah ada)
  const spriteDefs = [
    { src: "assets/images/logo.png", minSize: 70, maxSize: 140 },
    { src: "assets/images/favicon.png", minSize: 60, maxSize: 110 },
    { src: "assets/images/hoodie.png", minSize: 90, maxSize: 160 },
    { src: "assets/images/shirt.png", minSize: 90, maxSize: 160 },
    { src: "assets/images/tee-shirt.png", minSize: 90, maxSize: 160 },
    { src: "assets/images/sneakers.png", minSize: 90, maxSize: 150 },
    { src: "assets/images/school-bag.png", minSize: 90, maxSize: 150 },
  ];

  const sprites = [];
  const items = [];
  const itemCount = 120; // Lebih banyak items untuk tampilan penuh profesional

  const rand = (min, max) => Math.random() * (max - min) + min;

  function loadSprites() {
    return Promise.all(
      spriteDefs.map(
        (def) =>
          new Promise((resolve) => {
            const img = new Image();
            img.decoding = "async";
            img.onload = () => {
              const aspect =
                img.naturalWidth && img.naturalHeight
                  ? img.naturalWidth / img.naturalHeight
                  : 1;
              sprites.push({ ...def, img, aspect });
              resolve();
            };
            img.onerror = () => resolve();
            img.src = def.src;
          }),
      ),
    );
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const { offsetWidth, offsetHeight } = canvas;
    canvas.width = offsetWidth * dpr;
    canvas.height = offsetHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  class ClothingItem {
    constructor() {
      this.type = Math.floor(Math.random() * 5);
      this.sprite = sprites.length
        ? sprites[Math.floor(Math.random() * sprites.length)]
        : null;
      this.reset(true);
    }

    reset(initial = false) {
      if (sprites.length) {
        this.sprite = sprites[Math.floor(Math.random() * sprites.length)];
      }
      if (this.sprite) {
        const base = rand(this.sprite.minSize, this.sprite.maxSize);
        const aspect = this.sprite.aspect || 1;
        this.w = base;
        this.h = base / aspect;
      } else {
        this.w = rand(45, 150);
        this.h = this.w * rand(0.45, 1.4);
      }
      this.x = rand(-this.w * 2, canvas.width + this.w * 2);
      this.y = initial ? rand(-this.h, canvas.height) : -this.h - 50;
      this.vy = rand(0.2, 0.8); // Sangat lambat dan smooth
      this.vx = (Math.random() - 0.5) * 0.4; // Drift horizontal minimal
      this.rot = rand(-Math.PI, Math.PI);
      this.vr = rand(-0.002, 0.002); // Rotasi sangat halus
      this.mainColor = colors[Math.floor(Math.random() * colors.length)];
      this.accentColor = colors[Math.floor(Math.random() * colors.length)];
      this.opacity = rand(0.3, 0.75); // Opacity lebih konsisten
      this.wobblePhase = rand(0, Math.PI * 2);
      this.wobbleSpeed = rand(0.15, 0.5); // Wobble sangat lambat dan smooth
      this.scale = rand(0.8, 1.2);
      this.shadowBlur = rand(20, 40);
    }

    update() {
      this.y += this.vy;
      const wobble = Math.sin(
        Date.now() * 0.001 * this.wobbleSpeed + this.wobblePhase,
      );
      this.x += this.vx + wobble * 0.2;
      this.rot += this.vr;

      if (this.y > canvas.height + 100) this.reset();
      if (this.x > canvas.width + 100) this.x = -100;
      if (this.x < -100) this.x = canvas.width + 100;
    }

    drawShadow(ctx) {
      ctx.save();
      ctx.translate(this.x + this.w / 2 + 5, this.y + this.h / 2 + 10);
      ctx.globalAlpha = this.opacity * 0.15;
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.ellipse(
        0,
        0,
        (this.w / 2) * this.scale,
        (this.h / 3) * this.scale,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.restore();
    }

    draw(ctx) {
      this.drawShadow(ctx);

      ctx.save();
      ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
      ctx.rotate(this.rot);
      ctx.scale(this.scale, this.scale);
      ctx.globalAlpha = this.opacity;

      if (this.sprite && this.sprite.img && this.sprite.img.complete) {
        ctx.drawImage(
          this.sprite.img,
          -this.w / 2,
          -this.h / 2,
          this.w,
          this.h,
        );
      } else {
        // Fallback ke bentuk vektor jika sprite belum termuat
        switch (this.type) {
          case 0:
            this.drawShirt(ctx);
            break;
          case 1:
            this.drawJacket(ctx);
            break;
          case 2:
            this.drawPants(ctx);
            break;
          case 3:
            this.drawHoodie(ctx);
            break;
          case 4:
            this.drawCap(ctx);
            break;
        }
      }

      ctx.restore();
    }

    drawShirt(ctx) {
      const h = this.h / this.scale;
      const w = this.w / this.scale;

      // gradient fill
      const grad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
      grad.addColorStop(0, this.mainColor);
      grad.addColorStop(1, this.accentColor);
      ctx.fillStyle = grad;

      // body dengan style lebih bagus
      ctx.beginPath();
      ctx.moveTo(-w * 0.35, -h / 2 + 8);
      ctx.lineTo(w * 0.35, -h / 2 + 8);
      ctx.quadraticCurveTo(w * 0.42, -h / 2, w * 0.48, -h / 2);
      ctx.lineTo(w * 0.48, h * 0.45);
      ctx.quadraticCurveTo(w * 0.45, h / 2, w * 0.35, h / 2);
      ctx.lineTo(-w * 0.35, h / 2);
      ctx.quadraticCurveTo(-w * 0.45, h / 2, -w * 0.48, h * 0.45);
      ctx.lineTo(-w * 0.48, -h / 2);
      ctx.quadraticCurveTo(-w * 0.42, -h / 2, -w * 0.35, -h / 2 + 8);
      ctx.closePath();
      ctx.fill();

      // collar detail
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.beginPath();
      ctx.arc(0, -h / 2 + 6, w * 0.22, 0, Math.PI * 2);
      ctx.fill();

      // stripe di tengah
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(-w * 0.05, -h / 2 + 20, w * 0.1, h * 0.15);

      // sleeves
      ctx.fillStyle = this.mainColor;
      ctx.fillRect(-w * 0.5, -h / 2 + 8, 12, h * 0.45);
      ctx.fillRect(w * 0.5 - 12, -h / 2 + 8, 12, h * 0.45);
    }

    drawJacket(ctx) {
      const h = this.h / this.scale;
      const w = this.w / this.scale;

      const grad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
      grad.addColorStop(0, this.mainColor);
      grad.addColorStop(0.5, this.accentColor);
      grad.addColorStop(1, this.mainColor);
      ctx.fillStyle = grad;

      // jacket body - lebih lebar dan berisi
      ctx.beginPath();
      ctx.moveTo(-w * 0.45, -h / 2);
      ctx.lineTo(w * 0.45, -h / 2);
      ctx.quadraticCurveTo(w * 0.5, h * 0.1, w * 0.42, h / 2);
      ctx.lineTo(-w * 0.42, h / 2);
      ctx.quadraticCurveTo(-w * 0.5, h * 0.1, -w * 0.45, -h / 2);
      ctx.closePath();
      ctx.fill();

      // center zipper line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, -h / 2);
      ctx.lineTo(0, h / 2);
      ctx.stroke();

      // pockets
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillRect(-w * 0.3, h * 0.05, w * 0.15, h * 0.2);
      ctx.fillRect(w * 0.15, h * 0.05, w * 0.15, h * 0.2);

      // sleeve accent
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.fillRect(-w * 0.52, -h / 2, 10, h * 0.7);
      ctx.fillRect(w * 0.52 - 10, -h / 2, 10, h * 0.7);
    }

    drawPants(ctx) {
      const h = this.h / this.scale;
      const w = this.w / this.scale;

      const grad = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
      grad.addColorStop(0, this.mainColor);
      grad.addColorStop(1, this.accentColor);
      ctx.fillStyle = grad;

      // left leg
      ctx.beginPath();
      ctx.moveTo(-w / 2 + 3, -h / 2);
      ctx.lineTo(-w / 2 + w * 0.38, -h / 2);
      ctx.lineTo(-w / 2 + w * 0.35, h / 2);
      ctx.lineTo(-w / 2 + 3, h / 2);
      ctx.closePath();
      ctx.fill();

      // right leg
      ctx.beginPath();
      ctx.moveTo(w / 2 - w * 0.38, -h / 2);
      ctx.lineTo(w / 2 - 3, -h / 2);
      ctx.lineTo(w / 2 - 3, h / 2);
      ctx.lineTo(w / 2 - w * 0.35, h / 2);
      ctx.closePath();
      ctx.fill();

      // waist detail
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      ctx.fillRect(-w / 2, -h / 2, w, h * 0.1);

      // leg lines
      ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-w * 0.15, -h / 2);
      ctx.lineTo(-w * 0.15, h / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w * 0.15, -h / 2);
      ctx.lineTo(w * 0.15, h / 2);
      ctx.stroke();
    }

    drawHoodie(ctx) {
      const h = this.h / this.scale;
      const w = this.w / this.scale;

      const grad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
      grad.addColorStop(0, this.mainColor);
      grad.addColorStop(1, this.accentColor);
      ctx.fillStyle = grad;

      // body
      ctx.beginPath();
      ctx.moveTo(-w * 0.4, -h / 2 + 20);
      ctx.lineTo(w * 0.4, -h / 2 + 20);
      ctx.lineTo(w * 0.38, h / 2);
      ctx.lineTo(-w * 0.38, h / 2);
      ctx.closePath();
      ctx.fill();

      // hood - 3D look
      ctx.beginPath();
      ctx.arc(0, -h / 2 + 12, w * 0.32, Math.PI * 0.3, Math.PI * 1.7);
      ctx.fill();

      // hood outline
      ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -h / 2 + 12, w * 0.32, Math.PI * 0.3, Math.PI * 1.7);
      ctx.stroke();

      // drawstring
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-w * 0.15, -h / 2 + 20);
      ctx.quadraticCurveTo(0, -h / 2 + 28, w * 0.15, -h / 2 + 20);
      ctx.stroke();

      // front pocket
      ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
      ctx.fillRect(-w * 0.18, h * 0.05, w * 0.36, h * 0.3);
    }

    drawCap(ctx) {
      const h = this.h / this.scale;
      const w = this.w / this.scale;

      const grad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
      grad.addColorStop(0, this.mainColor);
      grad.addColorStop(1, this.accentColor);
      ctx.fillStyle = grad;

      // bill/visor
      ctx.beginPath();
      ctx.ellipse(0, -h / 4, w * 0.45, h * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();

      // crown - 3D effect
      ctx.beginPath();
      ctx.moveTo(-w * 0.28, -h / 4);
      ctx.quadraticCurveTo(-w * 0.3, -h * 0.8, 0, -h * 0.9);
      ctx.quadraticCurveTo(w * 0.3, -h * 0.8, w * 0.28, -h / 4);
      ctx.closePath();
      ctx.fill();

      // highlight pada crown
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.beginPath();
      ctx.arc(-w * 0.1, -h * 0.7, w * 0.1, 0, Math.PI * 2);
      ctx.fill();

      // visor detail
      ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, -h / 4, w * 0.45, h * 0.15, 0, 0, Math.PI);
      ctx.stroke();
    }
  }

  function init() {
    resize();
    items.length = 0;
    for (let i = 0; i < itemCount; i++) items.push(new ClothingItem());
  }

  function drawBackground() {
    // Gradien dinamis oranye-ke-kuning yang bergerak sangat cepat
    const t = Date.now() * 0.0005; // percepat animasi gradasi (~8x lebih cepat)
    const shift1 = Math.sin(t) * 0.1;
    const shift2 = Math.sin(t * 0.8 + 1.2) * 0.1;

    const g1 = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    g1.addColorStop(0, "#1a0f00");
    g1.addColorStop(0.2 + shift1, "rgba(255, 120, 0, 0.20)");
    g1.addColorStop(0.42 + shift2, "#331a00");
    g1.addColorStop(0.6 + shift1 * 0.6, "rgba(255, 184, 0, 0.16)");
    g1.addColorStop(0.78 + shift2 * 0.45, "#2a1200");
    g1.addColorStop(1, "#120800");
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Radial gradient overlay (oranye-kuning) dengan posisi yang bergerak
    const cx1 = canvas.width * (0.3 + 0.05 * Math.sin(t * 0.6 + 0.5));
    const cy1 = canvas.height * (0.2 + 0.05 * Math.sin(t * 0.7 + 1.1));
    const g2 = ctx.createRadialGradient(
      cx1,
      cy1,
      0,
      canvas.width / 2,
      canvas.height / 2,
      Math.max(canvas.width, canvas.height) * 0.8,
    );
    g2.addColorStop(0, "rgba(255, 168, 0, 0.18)");
    g2.addColorStop(0.55, "rgba(255, 120, 0, 0.12)");
    g2.addColorStop(1, "rgba(0, 0, 0, 0.35)");
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Radial gradient kedua dengan aksen kuning terang
    const cx2 = canvas.width * (0.8 + 0.06 * Math.sin(t * 0.9 + 2.3));
    const cy2 = canvas.height * (0.15 + 0.05 * Math.sin(t * 1.1 + 0.7));
    const g3 = ctx.createRadialGradient(
      cx2,
      cy2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      Math.max(canvas.width, canvas.height),
    );
    g3.addColorStop(0, "rgba(255, 213, 79, 0.14)");
    g3.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = g3;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dark vignette overlay
    const g4 = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      Math.min(canvas.width, canvas.height) * 0.4,
      canvas.width / 2,
      canvas.height / 2,
      Math.max(canvas.width, canvas.height),
    );
    g4.addColorStop(0, "rgba(0, 0, 0, 0)");
    g4.addColorStop(1, "rgba(0, 0, 0, 0.4)");
    ctx.fillStyle = g4;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    items.forEach((item) => item.update());
    items.sort((a, b) => a.y - b.y);
    items.forEach((item) => item.draw(ctx));

    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", resize);

  loadSprites().then(() => {
    resize();
    init();
    loop();
  });
})();
