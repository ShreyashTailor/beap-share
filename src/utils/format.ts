export function formatFileSize(bytes: number): string {
  const units = ['B', 'KiB', 'MiB', 'GiB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

export function formatDate(date: string, showTime: boolean = false): string {
  const d = new Date(date);
  const formatted = d.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
  
  if (showTime) {
    return `${formatted} ${d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })}`;
  }
  
  return formatted;
}