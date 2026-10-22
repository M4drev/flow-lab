/* Janelas internas reutilizáveis: preservam o elemento e seus eventos ao destacar/reencaixar. */
(function (root) {
  "use strict";
  class FloatingPanels {
    constructor(layer) {
      this.layer = layer;
      this.panels = new Map();
      this.order = 40;
      this.drag = null;
      document.addEventListener("pointermove", (event) => this.move(event));
      document.addEventListener("pointerup", () => this.release());
      document.addEventListener("pointercancel", () => this.release());
      window.addEventListener("resize", () => this.fitAll());
    }
    register(panel) {
      const handle = panel.querySelector(".panel-toolbar");
      const detach = panel.querySelector("[data-detach]");
      const dock = panel.querySelector("[data-dock]");
      this.panels.set(panel.id, {
        panel,
        handle,
        detach,
        dock,
        placeholder: null,
        initialStyle: panel.getAttribute("style"),
      });
      detach.addEventListener("click", () => this.detach(panel.id));
      dock.addEventListener("click", () => this.dock(panel.id));
      panel.addEventListener("pointerdown", () => {
        if (this.isDetached(panel.id)) this.bringToFront(panel.id);
      });
      handle.addEventListener("pointerdown", (event) => {
        if (
          !this.isDetached(panel.id) ||
          event.button !== 0 ||
          event.target.closest("button,input,a,summary")
        )
          return;
        const bounds = panel.getBoundingClientRect();
        this.drag = {
          id: panel.id,
          pointerId: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          left: bounds.left,
          top: bounds.top,
        };
        handle.setPointerCapture?.(event.pointerId);
        event.preventDefault();
        panel.classList.add("is-dragging");
      });
      handle.addEventListener("keydown", (event) => {
        if (!this.isDetached(panel.id) || event.target !== handle) return;
        if (!event.altKey || event.shiftKey || event.ctrlKey || event.metaKey)
          return;
        const offsets = {
          ArrowLeft: [-12, 0],
          ArrowRight: [12, 0],
          ArrowUp: [0, -12],
          ArrowDown: [0, 12],
        };
        if (offsets[event.key]) {
          event.preventDefault();
          event.stopPropagation();
          const bounds = panel.getBoundingClientRect(),
            [x, y] = offsets[event.key];
          this.position(panel, bounds.left + x, bounds.top + y);
        }
      });
    }
    area() {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }
    isDetached(id) {
      return !!this.panels.get(id)?.placeholder;
    }
    captureScroll(panel) {
      return [panel, ...panel.querySelectorAll("*")]
        .filter((element) => element.scrollTop || element.scrollLeft)
        .map((element) => ({
          element,
          top: element.scrollTop,
          left: element.scrollLeft,
        }));
    }
    restoreScroll(positions) {
      for (const { element, top, left } of positions) {
        element.scrollTop = top;
        element.scrollLeft = left;
      }
    }
    detach(id) {
      const item = this.panels.get(id);
      if (!item || item.placeholder) return;
      const { panel, handle, detach, dock } = item;
      const scroll = this.captureScroll(panel);
      const area = this.area(),
        offset = [...this.panels.keys()].indexOf(id);
      const width = Math.max(
        260,
        Math.min(Number(panel.dataset.floatWidth) || 580, area.width - 24),
      );
      const height = Math.max(
        200,
        Math.min(Number(panel.dataset.floatHeight) || 550, area.height - 36),
      );
      const placeholder = document.createElement("div");
      placeholder.className = "floating-placeholder";
      placeholder.dataset.panelSlot = panel.dataset.panelSlot;
      const label = document.createElement("span");
      label.textContent = panel.dataset.panelTitle + " · janela destacada";
      const show = document.createElement("button");
      show.type = "button";
      show.className = "mini-button";
      show.textContent = "Trazer para frente ↗";
      show.addEventListener("click", () => {
        this.bringToFront(id);
        handle.focus({ preventScroll: true });
      });
      placeholder.append(label, show);
      panel.before(placeholder);
      item.placeholder = placeholder;
      this.layer.append(panel);
      panel.classList.add("is-detached");
      panel.style.width = width + "px";
      panel.style.height = height + "px";
      panel.setAttribute(
        "aria-label",
        panel.dataset.panelTitle + ", janela destacada",
      );
      handle.tabIndex = 0;
      handle.setAttribute(
        "aria-label",
        "Arraste para mover a janela; Alt mais setas também move. Redimensione pelo canto inferior direito.",
      );
      detach.hidden = true;
      dock.hidden = false;
      this.position(
        panel,
        offset % 2 ? area.width - width - 20 : 20 + offset * 25,
        20 + offset * 36,
      );
      this.bringToFront(id);
      handle.focus({ preventScroll: true });
      this.restoreScroll(scroll);
    }
    dock(id) {
      const item = this.panels.get(id);
      if (!item?.placeholder) return;
      const scroll = this.captureScroll(item.panel);
      this.release();
      item.placeholder.replaceWith(item.panel);
      item.placeholder = null;
      item.panel.classList.remove("is-detached");
      item.panel.removeAttribute("aria-label");
      if (item.initialStyle === null) item.panel.removeAttribute("style");
      else item.panel.setAttribute("style", item.initialStyle);
      item.handle.removeAttribute("tabindex");
      item.handle.removeAttribute("aria-label");
      item.detach.hidden = false;
      item.dock.hidden = true;
      item.detach.focus({ preventScroll: true });
      this.restoreScroll(scroll);
    }
    bringToFront(id) {
      this.panels.get(id).panel.style.zIndex = String(++this.order);
    }
    position(panel, left, top) {
      const area = this.area(),
        bounds = panel.getBoundingClientRect();
      const width = Math.min(
        bounds.width || parseFloat(panel.style.width) || 580,
        area.width - 16,
      );
      const height = Math.min(
        bounds.height || parseFloat(panel.style.height) || 550,
        Math.max(180, area.height - 16),
      );
      panel.style.width = width + "px";
      panel.style.height = height + "px";
      panel.style.left =
        Math.max(8, Math.min(left, area.width - width - 8)) + "px";
      panel.style.top =
        Math.max(8, Math.min(top, area.height - height - 8)) + "px";
    }
    move(event) {
      if (
        !this.drag ||
        (event.pointerId !== undefined &&
          event.pointerId !== this.drag.pointerId)
      )
        return;
      const { id, x, y, left, top } = this.drag;
      this.position(
        this.panels.get(id).panel,
        left + event.clientX - x,
        top + event.clientY - y,
      );
    }
    release() {
      if (!this.drag) return;
      const item = this.panels.get(this.drag.id);
      try {
        item.handle.releasePointerCapture?.(this.drag.pointerId);
      } catch {
        /* Captura já encerrada pelo browser. */
      }
      item.panel.classList.remove("is-dragging");
      this.drag = null;
    }
    fitAll() {
      for (const item of this.panels.values())
        if (item.placeholder)
          this.position(
            item.panel,
            parseFloat(item.panel.style.left),
            parseFloat(item.panel.style.top),
          );
    }
  }
  root.FloatingPanels = FloatingPanels;
  // Barra sempre flutuante: só sua alça captura o arraste, nunca os botões.
  class MovableDock {
    constructor(element) {
      this.element = element;
      this.handle = element.querySelector(".control-grip");
      this.drag = null;
      this.anchored = true;
      this.handle.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) return;
        const bounds = this.element.getBoundingClientRect();
        this.drag = {
          id: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          left: bounds.left,
          top: bounds.top,
        };
        this.handle.setPointerCapture?.(event.pointerId);
        this.element.classList.add("is-dragging");
        event.preventDefault();
      });
      document.addEventListener("pointermove", (event) => {
        if (!this.drag || event.pointerId !== this.drag.id) return;
        this.anchored = false;
        this.position(
          this.drag.left + event.clientX - this.drag.x,
          this.drag.top + event.clientY - this.drag.y,
        );
      });
      const release = () => {
        if (!this.drag) return;
        try {
          this.handle.releasePointerCapture?.(this.drag.id);
        } catch {
          /* Captura encerrada. */
        }
        this.drag = null;
        this.element.classList.remove("is-dragging");
      };
      document.addEventListener("pointerup", release);
      document.addEventListener("pointercancel", release);
      this.handle.addEventListener("keydown", (event) => {
        if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
          return;
        const offsets = {
          ArrowLeft: [-12, 0],
          ArrowRight: [12, 0],
          ArrowUp: [0, -12],
          ArrowDown: [0, 12],
        };
        if (!offsets[event.key]) return;
        event.preventDefault();
        event.stopPropagation();
        this.anchored = false;
        const bounds = this.element.getBoundingClientRect(),
          [x, y] = offsets[event.key];
        this.position(bounds.left + x, bounds.top + y);
      });
      window.addEventListener("resize", () => this.fit());
      if (window.ResizeObserver)
        new ResizeObserver(() => this.fit()).observe(element);
    }
    position(left, top) {
      const bounds = this.element.getBoundingClientRect();
      const width = bounds.width || Math.min(470, window.innerWidth - 24),
        height = bounds.height || 89;
      this.element.style.left =
        Math.max(8, Math.min(left, window.innerWidth - width - 8)) + "px";
      this.element.style.top =
        Math.max(8, Math.min(top, window.innerHeight - height - 8)) + "px";
      this.element.style.bottom = "auto";
      this.element.style.transform = "none";
    }
    fit() {
      if (this.element.hidden) return;
      const bounds = this.element.getBoundingClientRect();
      if (this.anchored)
        this.position(
          (window.innerWidth -
            (bounds.width || Math.min(470, window.innerWidth - 24))) /
            2,
          window.innerHeight - (bounds.height || 89) - 16,
        );
      else
        this.position(
          parseFloat(this.element.style.left) || bounds.left,
          parseFloat(this.element.style.top) || bounds.top,
        );
    }
  }
  root.MovableDock = MovableDock;
})(window);
