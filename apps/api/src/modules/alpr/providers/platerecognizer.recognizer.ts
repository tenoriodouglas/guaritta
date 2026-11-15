import { BadGatewayException, Logger } from '@nestjs/common';
import type { PlateCandidate, PlateRecognizer } from '../plate-recognizer.js';

const API_URL = 'https://api.platerecognizer.com/v1/plate-reader/';
const TIMEOUT_MS = 10_000;

interface ApiResponse {
  results: { plate: string; score: number; candidates?: { plate: string; score: number }[] }[];
}

/** Adapter for the Plate Recognizer cloud API (Brazil region). */
export class PlateRecognizerCloudRecognizer implements PlateRecognizer {
  private readonly logger = new Logger(PlateRecognizerCloudRecognizer.name);

  constructor(private readonly token: string) {}

  async recognize(image: Buffer): Promise<PlateCandidate[]> {
    const form = new FormData();
    form.append('upload', new Blob([new Uint8Array(image)]), 'snapshot.jpg');
    form.append('regions', 'br');

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { Authorization: `Token ${this.token}` },
      body: form,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    }).catch((error: Error) => {
      throw new BadGatewayException(`Recognition service unavailable: ${error.message}`);
    });
    if (!response.ok) {
      this.logger.warn(`Recognition failed with HTTP ${response.status}`);
      throw new BadGatewayException('Recognition service rejected the request');
    }

    const body = (await response.json()) as ApiResponse;
    // Flatten main results and alternative candidates, best first.
    return body.results
      .flatMap((r) => [{ plate: r.plate, score: r.score }, ...(r.candidates ?? [])])
      .map((c) => ({ plate: c.plate.toUpperCase(), confidence: c.score }))
      .sort((a, b) => b.confidence - a.confidence);
  }
}
