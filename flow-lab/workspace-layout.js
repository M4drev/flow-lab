/* Divisórias do layout fixo; janelas destacadas continuam usando FloatingPanels. */
(function (root) {
  "use strict";
  class WorkspaceLayout {
    constructor(workspace) {
      this.workspace = workspace;
      this.slots = ["lesson", "inspector", "runtime"];
      this.minimums = [240, 260, 320];
      this.handles = [...workspace.querySelectorAll(".workspace-resizer")];
      this.drag = null;
      for (const [index, handle] of this.handles.entries()) {
        handle.addEventListener("pointerdown", (event) => {
          if (event.button !== 0 || !this.enabled(index)) return;
          this.drag = {
            index,
            pointerId: event.pointerId,
            x: event.clientX,
            widths: this.widths(),
          };
          handle.setPointerCapture?.(event.pointerId);
          this.workspace.classList.add("is-resizing");
          event.preventDefault();
        });
        handle.addEventListener("keydown", (event) => {
          if (
            !this.enabled(index) ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey
          )
            return;
          const delta = { ArrowLeft: -24, ArrowRight: 24 }[event.key];
          if (delta === undefined && !["Home", "End"].includes(event.key))
            return;
          event.preventDefault();
          event.stopPropagation();
          const widths = this.widths();
          this.resize(
            index,
            delta ?? (event.key === "Home" ? -Infinity : Infinity),
            widths,
          );
        });
      }
      document.addEventListener("pointermove", (event) => {
        if (!this.drag || event.pointerId !== this.drag.pointerId) return;
        if (!this.enabled(this.drag.index)) return this.release();
        this.resize(
          this.drag.index,
          event.clientX - this.drag.x,
          this.drag.widths,
        );
      });
      for (const type of ["pointerup", "pointercancel"])
        document.addEventListener(type, (event) => {
          if (this.drag && event.pointerId === this.drag.pointerId)
            this.release();
        });
      window.addEventListener("resize", () => {
        this.release();
        this.refresh();
      });
      // Destacar/reencaixar substitui só o filho direto por um placeholder.
      new MutationObserver(() => {
        if (this.drag && !this.enabled(this.drag.index)) this.release();
        this.refresh();
      }).observe(workspace, { childList: true });
      if (root.ResizeObserver)
        new ResizeObserver(() => this.refresh()).observe(workspace);
      this.refresh();
    }
    panel(index) {
      return this.workspace.querySelector(
        ':scope > [data-panel-slot="' + this.slots[index] + '"]',
      );
    }
    enabled(index) {
      return (
        window.innerWidth >= 1000 &&
        [index, index + 1].every((i) =>
          this.panel(i)?.classList.contains("game-card"),
        )
      );
    }
    widths() {
      return this.slots.map(
        (_, index) => this.panel(index).getBoundingClientRect().width,
      );
    }
    resize(index, delta, widths) {
      const total = widths[index] + widths[index + 1];
      if (total < this.minimums[index] + this.minimums[index + 1]) return;
      const next = [...widths];
      next[index] = Math.max(
        this.minimums[index],
        Math.min(widths[index] + delta, total - this.minimums[index + 1]),
      );
      next[index + 1] = total - next[index];
      for (let i = 0; i < this.slots.length; i++)
        this.workspace.style.setProperty(
          "--" + this.slots[i] + "-width",
          next[i] + "fr",
        );
      this.refresh();
    }
    refresh() {
      const widths = this.widths();
      for (const [index, handle] of this.handles.entries()) {
        const enabled = this.enabled(index);
        handle.tabIndex = enabled ? 0 : -1;
        handle.setAttribute("aria-disabled", String(!enabled));
        handle.setAttribute("aria-valuemin", String(this.minimums[index]));
        handle.setAttribute(
          "aria-valuemax",
          String(
            Math.max(
              this.minimums[index],
              Math.round(
                widths[index] + widths[index + 1] - this.minimums[index + 1],
              ),
            ),
          ),
        );
        handle.setAttribute("aria-valuenow", String(Math.round(widths[index])));
        handle.setAttribute(
          "aria-valuetext",
          Math.round(widths[index]) + " pixels de largura",
        );
        handle.title = enabled
          ? "Arraste para ajustar; setas ajustam pelo teclado, Home/End vão aos limites"
          : "Reencaixe os dois painéis para ajustar esta divisória";
      }
    }
    release() {
      if (!this.drag) return;
      try {
        this.handles[this.drag.index].releasePointerCapture?.(
          this.drag.pointerId,
        );
      } catch {
        /* A captura pode ter terminado ao mudar a viewport. */
      }
      this.drag = null;
      this.workspace.classList.remove("is-resizing");
    }
  }
  root.WorkspaceLayout = WorkspaceLayout;
})(window);
