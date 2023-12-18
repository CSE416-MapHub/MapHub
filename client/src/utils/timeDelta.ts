class TimeDelta {
  static getTimeDeltaString(timeString: string) {
    const time = new Date(timeString);
    const timeNow = new Date();
    const timeDelta = timeNow.getTime() - time.getTime();

    if (timeDelta < 60000) {
      return 'now';
    } else if (timeDelta < 3.6e6) {
      return `${Math.floor(timeDelta / 60000)}m`;
    } else if (timeDelta < 8.64e7) {
      return `${Math.floor(timeDelta / 3.6e6)}h`;
    } else if (timeDelta < 6.048e8) {
      return `${Math.floor(timeDelta / 8.64e7)}d`;
    } else if (timeDelta < 3.154e10) {
      return `${Math.floor(timeDelta / 6.048e8)}w`;
    }
    return `${Math.floor(timeDelta / 3.154e10)}w`;
  }
}

export default TimeDelta;
