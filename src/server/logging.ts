export type TokenUsage = {
  prompt?: number;
  completion?: number;
  total?: number;
};

export type TechnicalSchemaIssue = {
  path: string;
  code: string;
  message: string;
};

export type TechnicalLogEvent = {
  endpoint: string;
  durationMs: number;
  model?: string;
  tokenUsage?: TokenUsage;
  errorType?: string;
  schemaIssues?: TechnicalSchemaIssue[];
};

function sanitizeSchemaIssues(issues: TechnicalSchemaIssue[] | undefined) {
  return issues?.slice(0, 10).map((issue) => ({
    path: issue.path,
    code: issue.code,
    message: issue.message
  }));
}

export function logTechnicalEvent(event: TechnicalLogEvent) {
  console.info(
    "cookforfree.api",
    JSON.stringify({
      timestamp: new Date().toISOString(),
      endpoint: event.endpoint,
      durationMs: event.durationMs,
      model: event.model,
      tokenUsage: event.tokenUsage,
      errorType: event.errorType,
      schemaIssues: sanitizeSchemaIssues(event.schemaIssues)
    })
  );
}
