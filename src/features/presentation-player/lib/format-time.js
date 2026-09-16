export function formatTime(seconds) {
    const totalSeconds = Math.floor(seconds);
    const hours = Math.floor(totalSeconds / 3600)
        .toString()
        .padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60)
        .toString()
        .padStart(2, '0');
    const remainder = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${remainder}`;
}
