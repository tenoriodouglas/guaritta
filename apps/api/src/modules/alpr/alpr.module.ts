import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AlprProvider, type Env } from '../../config/env.js';
import { AlprService } from './alpr.service.js';
import { PLATE_RECOGNIZER, type PlateRecognizer } from './plate-recognizer.js';
import { DisabledRecognizer } from './providers/disabled.recognizer.js';
import { PlateRecognizerCloudRecognizer } from './providers/platerecognizer.recognizer.js';

@Module({
  providers: [
    AlprService,
    {
      provide: PLATE_RECOGNIZER,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>): PlateRecognizer => {
        if (config.get('ALPR_PROVIDER', { infer: true }) !== AlprProvider.PlateRecognizer) {
          return new DisabledRecognizer();
        }
        const token = config.get('ALPR_API_TOKEN', { infer: true });
        if (!token) throw new Error('ALPR_API_TOKEN is required for the platerecognizer provider');
        return new PlateRecognizerCloudRecognizer(token);
      },
    },
  ],
  exports: [AlprService],
})
export class AlprModule {}
