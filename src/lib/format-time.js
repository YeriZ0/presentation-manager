export function formatTime(seconds) {
    const total = Math.max(0, Math.floor(seconds));
    const hours = String(Math.floor(total / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
    const remainder = String(total % 60).padStart(2, '0');
    return `${hours}:${minutes}:${remainder}`;
}
