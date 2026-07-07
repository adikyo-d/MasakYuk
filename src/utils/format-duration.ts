export function formatDuration(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return "< 1 menit";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0 && minutes > 0) return `${hours} hours ${minutes} minutes`;
  if (hours > 0) return `${hours} hours`;
  if (minutes > 0) return `${minutes} minute`;

  return "< 1 minute";
}
