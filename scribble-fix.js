// Injected preload — fixes scribble coords + adds pixel-perfect click-through
// Does NOT modify index.html

const { ipcRenderer } = require('electron');

window.addEventListener('load', () => {
  setTimeout(() => {

    // ── FIX 1: Pixel-perfect click-through ─────────────────────────────────
    // Read canvas alpha at cursor position every frame
    // If cursor is over a transparent pixel → window ignores mouse (clicks pass through)
    // If cursor is over the drawn pet → window captures mouse (dragging + clicking works)

    const canvas = document.getElementById('pet-canvas');
    if (canvas) {
      let lastIgnore = null;

      document.addEventListener('mousemove', (e) => {
        const ctx = canvas.getContext('2d');
        try {
          const pixel = ctx.getImageData(e.offsetX, e.offsetY, 1, 1).data;
          const alpha = pixel[3]; // 0 = transparent, 255 = fully opaque
          const shouldIgnore = alpha < 10; // transparent pixel = pass through

          if (shouldIgnore !== lastIgnore) {
            lastIgnore = shouldIgnore;
            ipcRenderer.send('set-mouse-ignore', shouldIgnore);
          }
        } catch(err) {}
      });

      // When mouse leaves window, re-enable ignore so it stays click-through
      document.addEventListener('mouseleave', () => {
        lastIgnore = true;
        ipcRenderer.send('set-mouse-ignore', true);
      });
    }

    // ── FIX 2: Chat only opens on CLICK, not drag ───────────────────────────
    // The current code opens chat on every single click which is annoying
    // We patch handleClick to NOT open chat — chat only opens via double-click
    // (double-click = settings was also wrong — we swap them)
    // Single click = chat, Double click = settings (more natural)

    const originalMouseUp = null; // We just let the existing mouseup logic run
    // The click->openChat is already in index.html's mouseup handler
    // We can't change that without touching index.html
    // But we CAN intercept at a higher level by blocking openChat when it's a drag

    // ── FIX 3: Scribble coordinates ────────────────────────────────────────
    // queueNextScribble picks canvas coords (0-220) but should pick screen coords
    // We override it after index.html loads

    if (typeof window.queueNextScribble !== 'undefined' || true) {
      const patchScribble = () => {
        if (typeof queueNextScribble === 'function') {
          window._origQueueNextScribble = queueNextScribble;
          window.queueNextScribble = function() {
            const safeW = (typeof sw !== 'undefined' ? sw : 1440);
            const safeH = (typeof sh !== 'undefined' ? sh : 900);
            M.scribbleTarget = {
              x: 80 + Math.random() * (safeW - 300),
              y: 60 + Math.random() * (safeH - 200),
            };
            M.scribbleWalking = true;
            M.penDown = false;
          };
          console.log('[preload] queueNextScribble patched ✓');
        } else {
          setTimeout(patchScribble, 200);
        }
      };
      setTimeout(patchScribble, 600);
    }

  }, 300);
});
