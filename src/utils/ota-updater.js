/**
 * OTA Updater - Module kiểm tra và thông báo cập nhật Online tự động cho ChessMate AI
 */

const DEFAULT_UPDATE_URL = 'https://raw.githubusercontent.com/userlethekhoi/Extension-Chess.Com/main/version.json';

/**
 * So sánh 2 chuỗi version ngữ nghĩa (semver: "0.1.0" vs "0.2.0")
 * Trả về 1 nếu vRemote > vCurrent (có bản mới)
 * Trả về 0 nếu bằng nhau
 * Trả về -1 nếu vRemote < vCurrent
 */
export function compareVersions(vCurrent, vRemote) {
  const pCurrent = String(vCurrent || '0.0.0').split('.').map(n => parseInt(n, 10) || 0);
  const pRemote = String(vRemote || '0.0.0').split('.').map(n => parseInt(n, 10) || 0);

  for (let i = 0; i < Math.max(pCurrent.length, pRemote.length); i++) {
    const c = pCurrent[i] || 0;
    const r = pRemote[i] || 0;
    if (r > c) return 1;
    if (r < c) return -1;
  }
  return 0;
}

/**
 * Kiểm tra xem có phiên bản mới hơn trên GitHub/Server không
 */
export async function checkForUpdates(customUrl = null) {
  const currentVersion = (typeof chrome !== 'undefined' && chrome.runtime?.getManifest?.()?.version) || '0.1.0';
  const url = customUrl || DEFAULT_UPDATE_URL;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${url}?_t=${Date.now()}`, {
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache' }
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return { hasUpdate: false, currentVersion, error: `HTTP ${res.status}` };
    }

    const data = await res.json();
    const remoteVersion = data.version;

    if (!remoteVersion) {
      return { hasUpdate: false, currentVersion };
    }

    const isNewer = compareVersions(currentVersion, remoteVersion) > 0;

    const result = {
      hasUpdate: isNewer,
      currentVersion,
      latestVersion: remoteVersion,
      changelog: data.changelog || [],
      releaseDate: data.releaseDate || '',
      downloadUrl: data.downloadUrl || 'https://github.com/userlethekhoi/Extension-Chess.Com/releases/latest'
    };

    // Lưu vào storage để popup / HUD có thể hiển thị
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ otaUpdateInfo: result }).catch(() => {});
    }

    return result;
  } catch (err) {
    return { hasUpdate: false, currentVersion, error: err.message };
  }
}
