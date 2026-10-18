document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const link = target.closest("a[href]");
  if (!link || (!link.classList.contains("tool-link--external") && !link.hasAttribute("data-confirm-external"))) return;
  if (new URL(link.href).hostname !== "sirotumekuma.github.io") return;

  if (!window.confirm("制作者ホームページへ移行します。よろしいですか？")) {
    event.preventDefault();
  }
});
