export function rerunStatusKey(jobId: string | number): string {
  return "rerun" + jobId;
}

export function cancelStatusKey(jobId: string | number): string {
  return "cancel" + jobId;
}
