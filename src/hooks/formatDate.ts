export function formatDate(timestamp: any, timeSinceDisplay: boolean) {

  let formattedDate;

  const isTimestamp = typeof timestamp === 'object' && timestamp.seconds && timestamp.nanoseconds;

  if (isTimestamp) {
    formattedDate = new Date(
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
    );
  } else if (!isTimestamp) {
    formattedDate = new Date(timestamp);
  } else {
    throw new Error('Invalid type parameter. Expected "timestamp" or "date".');
  }

  if (timeSinceDisplay) {
    const now = new Date();
    const timeDiff = Math.abs(now.getTime() - formattedDate.getTime());
    const minutes = Math.floor(timeDiff / (1000 * 60));
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${Math.max(minutes, 1)}m`;
    } else if (hours < 24) {
      return `${hours}hr`;
    } else if (days < 7) {
      return `${days}d`;
    }
  }

  return formattedDate.toLocaleTimeString('en-us', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });
}