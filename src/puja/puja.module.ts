import { Module } from '@nestjs/common';
import { PujaController } from './puja.controller';
import { PujaService } from './puja.service';

@Module({
  controllers: [PujaController],
  providers: [PujaService],
  exports: [PujaService],
})
export class PujaModule {}
