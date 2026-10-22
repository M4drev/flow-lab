/* Tela cheia mantém os mesmos painéis e o mesmo percurso, sem duplicar conteúdo. */
(function (root) {
  "use strict";
  class StudyMode {
    constructor({ onChange }) {
      this.active = false;
      this.native = false;
      this.pending = false;
      this.onChange = onChange;
      this.buttons = [...document.querySelectorAll("[data-study-toggle]")];
      for (const button of this.buttons)
        button.addEventListener("click", () => {
          if (this.active) this.exit();
          else this.enter(button);
        });
      document.addEventListener("fullscreenchange", () => {
        if (
          this.native &&
          document.fullscreenElement !== document.documentElement
        ) {
          this.native = false;
          if (this.active) this.apply(false);
        }
      });
    }
    apply(active) {
      this.active = active;
      document.body.classList.toggle("is-study-mode", active);
      for (const button of this.buttons) {
        button.setAttribute("aria-pressed", String(active));
        if (button.classList.contains("study-mode-exit"))
          button.hidden = !active;
      }
      document.getElementById("settingsMenu").open = false;
      if (active) {
        document
          .querySelector(".study-mode-exit")
          .focus({ preventScroll: true });
      } else {
        this.previousFocus?.focus({ preventScroll: true });
        root.scrollTo({
          left: this.scroll.x,
          top: this.scroll.y,
          behavior: "instant",
        });
      }
      document.getElementById("announcer").textContent = active
        ? "Tela cheia de estudo ativada. Use Sair ou Escape para voltar."
        : "Tela cheia de estudo encerrada.";
      this.onChange();
    }
    async enter(trigger = document.activeElement) {
      if (this.active) return;
      this.previousFocus = trigger;
      this.scroll = { x: root.scrollX, y: root.scrollY };
      this.apply(true);
      if (
        this.pending ||
        document.fullscreenElement ||
        typeof document.documentElement.requestFullscreen !== "function"
      )
        return;
      this.native = true;
      this.pending = true;
      try {
        await document.documentElement.requestFullscreen({
          navigationUI: "hide",
        });
      } catch {
        // Sem suporte/permissão, os três painéis ainda ocupam toda a janela.
        this.native = false;
      } finally {
        this.pending = false;
        // O usuário pode sair antes de a solicitação do navegador terminar.
        if (
          !this.active &&
          document.fullscreenElement === document.documentElement
        )
          await this.exitNative();
      }
    }
    async exitNative() {
      if (typeof document.exitFullscreen !== "function") return;
      this.native = false;
      try {
        await document.exitFullscreen();
      } catch {
        if (document.fullscreenElement === document.documentElement) {
          this.native = true;
          if (!this.active) this.apply(true);
        }
      }
    }
    async exit() {
      if (!this.active) return;
      this.apply(false);
      if (
        this.native &&
        document.fullscreenElement === document.documentElement
      )
        await this.exitNative();
    }
  }
  root.StudyMode = StudyMode;
})(window);
