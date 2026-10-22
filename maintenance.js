// Set to true to show the maintenance notice across all pages.
const maintenanceMode = true;

if (maintenanceMode) {
  const banner = document.createElement("div");
  banner.className = "maintenance-banner";
  banner.setAttribute("role", "status");
  banner.textContent = "セキュリティメンテナンスのため、現在サイトは一時的に利用できません。ご不便をおかけして申し訳ありません。";
  document.body.prepend(banner);
}
