import { request as httpRequest } from "http";
import { request as httpsRequest } from "https";

export const DEFAULT_OVERHEAT_API_HOST = "https://api.overheat.app";

/** POST `/question_interpretation` body (same fields as the HTTP API). */
export interface QuestionInterpretationRequest {
  question: string;
  outcomes: string[];
  resolve_rules: string;
  expected_expiration_time: number;
  latest_expiration_time: number;
}

/** One element of the JSON array returned by `/question_interpretation`. */
export interface QuestionInterpretationItem {
  ambiguity: string;
  interpretations: string[];
}

/** Options for calling the Overheat HTTP gateway (see gateway CombinedAuthMiddleware). */
export interface QuestionInterpretationOptions {
  host?: string;
  timeoutMs?: number;
  /**
   * API credentials: sent as `Authorization: Bearer <secretId>:<secretKey>`.
   * Alternative to a Privy access token for server-side / SDK callers.
   */
  apiSecret?: { secretId: string; secretKey: string };
}

function normalizeHost(host?: string): string {
  const normalized = (host || DEFAULT_OVERHEAT_API_HOST).trim();
  if (!normalized) return DEFAULT_OVERHEAT_API_HOST;
  return normalized.replace(/\/+$/, "");
}

function parseErrorBody(body: string): string {
  const trimmed = body.trim();
  return trimmed.length > 0 ? trimmed : "UNKNOWN_API_ERROR";
}

export async function question_interpretation(
  payload: QuestionInterpretationRequest,
  opts?: QuestionInterpretationOptions
): Promise<QuestionInterpretationItem[]> {
  const host = normalizeHost(opts?.host);
  const timeoutMs = opts?.timeoutMs ?? 15000;
  const url = new URL("/question_interpretation", host);
  const body = JSON.stringify(payload);
  const transport = url.protocol === "https:" ? httpsRequest : httpRequest;

  const headers: Record<string, string | number> = {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
  };
  if (opts?.apiSecret) {
    const { secretId, secretKey } = opts.apiSecret;
    headers.Authorization = `Bearer ${secretId}:${secretKey}`;
  }

  return new Promise<QuestionInterpretationItem[]>((resolve, reject) => {
    const req = transport(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        path: `${url.pathname}${url.search}`,
        method: "POST",
        headers,
        timeout: timeoutMs,
      },
      (res) => {
        let raw = "";
        res.setEncoding("utf8");
        res.on("data", (chunk: string) => {
          raw += chunk;
        });
        res.on("end", () => {
          const statusCode = res.statusCode ?? 500;
          if (statusCode < 200 || statusCode >= 300) {
            return reject(
              new Error(
                `Overheat API request failed (${statusCode}): ${parseErrorBody(raw)}`
              )
            );
          }
          try {
            const parsed: unknown = JSON.parse(raw);
            if (!Array.isArray(parsed)) {
              return reject(
                new Error("Failed to parse Overheat API response: expected a JSON array")
              );
            }
            const items: QuestionInterpretationItem[] = [];
            for (const entry of parsed) {
              if (!entry || typeof entry !== "object") continue;
              const rec = entry as Record<string, unknown>;
              const ambiguity =
                typeof rec.ambiguity === "string" ? rec.ambiguity.trim() : "";
              if (!ambiguity) continue;
              const rawList = rec.interpretations;
              const interpretations = Array.isArray(rawList)
                ? rawList.filter(
                    (item): item is string =>
                      typeof item === "string" && item.trim().length > 0
                  )
                : [];
              items.push({ ambiguity, interpretations });
            }
            return resolve(items);
          } catch (error) {
            const message =
              error instanceof Error ? error.message : String(error);
            return reject(new Error(`Failed to parse Overheat API response: ${message}`));
          }
        });
      }
    );

    req.on("timeout", () => {
      req.destroy(new Error(`Overheat API request timed out after ${timeoutMs}ms`));
    });
    req.on("error", (error) => {
      reject(error);
    });
    req.write(body);
    req.end();
  });
}
