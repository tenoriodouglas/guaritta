export const PLATE_RECOGNIZER = Symbol('PLATE_RECOGNIZER');

export interface PlateCandidate {
  plate: string;
  /** 0..1 */
  confidence: number;
}

/** Port for license plate recognition engines (cloud or on-premise). */
export interface PlateRecognizer {
  recognize(image: Buffer): Promise<PlateCandidate[]>;
}
