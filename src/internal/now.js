export default function () {
  if (window.performance) {
    return performance.now();
  }

  return Date.now();
}
