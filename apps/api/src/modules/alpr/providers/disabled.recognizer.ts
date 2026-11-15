import { BadRequestException } from '@nestjs/common';
import type { PlateCandidate, PlateRecognizer } from '../plate-recognizer.js';

/** Used when cameras run on-board LPR and send the plate text directly. */
export class DisabledRecognizer implements PlateRecognizer {
  recognize(): Promise<PlateCandidate[]> {
    throw new BadRequestException('Image recognition is disabled; send the plate text instead');
  }
}
