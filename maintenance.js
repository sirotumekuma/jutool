// Set to true to show the maintenance notice across all pages.
const maintenanceMode = true;

if (maintenanceMode) {
  const pageElements = Array.from(document.body.children);
  pageElements.forEach((element) => {
    element.inert = true;
  });

  const banner = document.createElement("div");
  banner.className = "maintenance-banner";
  banner.setAttribute("role", "status");
  banner.textContent = "セキュリティメンテナンスのため、現在サイトは一時的に利用できません。ご不便をおかけして申し訳ありません。";

  const screen = document.createElement("div");
  screen.className = "maintenance-screen";
  screen.setAttribute("role", "alert");
  screen.textContent = "メンテナンス中はサービスをご利用いただけません。";

  document.body.prepend(banner);
  document.body.append(screen);
  document.body.classList.add("maintenance-mode");
}
