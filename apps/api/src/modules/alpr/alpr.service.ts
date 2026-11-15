import { Inject, Injectable } from '@nestjs/common';
import { correctOcrPlate, isValidPlate } from '../../common/utils/plate.js';
import { PLATE_RECOGNIZER, type PlateCandidate, type PlateRecognizer } from './plate-recognizer.js';

/** Chooses the best valid plate among recognizer candidates, fixing common OCR errors. */
@Injectable()
export class AlprService {
  constructor(@Inject(PLATE_RECOGNIZER) private readonly recognizer: PlateRecognizer) {}

  async readImage(image: Buffer): Promise<PlateCandidate | undefined> {
    return AlprService.pickBest(await this.recognizer.recognize(image));
  }

  static pickBest(candidates: PlateCandidate[]): PlateCandidate | undefined {
    return candidates
      .map((c) => ({ ...c, plate: correctOcrPlate(c.plate) }))
      .filter((c) => isValidPlate(c.plate))
      .sort((a, b) => b.confidence - a.confidence)[0];
  }
}
