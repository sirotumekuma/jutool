document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const link = target.closest("a[href]");
  if (!link || new URL(link.href).hostname !== "sirotumekuma.github.io") return;

  if (!window.confirm("制作者ホームページへ移行します。よろしいですか？")) {
    event.preventDefault();
  }
});
