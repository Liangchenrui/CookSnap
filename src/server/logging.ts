export type TokenUsage = {
  prompt?: number;
  completion?: number;
  total?: number;
};

export type TechnicalLogEvent = {
  endpoint: string;
  durationMs: number;
  model?: string;
  tokenUsage?: TokenUsage;
  errorType?: string;
};

export function logTechnicalEvent(event: TechnicalLogEvent) {
  console.info(
    "cookforfree.api",
    JSON.stringify({
      timestamp: new Date().toISOString(),
      endpoint: event.endpoint,
      durationMs: event.durationMs,
      model: event.model,
      tokenUsage: event.tokenUsage,
      errorType: event.errorType
    })
  );
}
