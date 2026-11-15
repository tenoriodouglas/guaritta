import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { Visitor } from './domain/visitor.entity';
import { AuthorizeVisitorDto } from './dto/authorize-visitor.dto';
import { VisitorsService } from './visitors.service';

@Controller('visitors')
export class VisitorsController {
  constructor(private readonly service: VisitorsService) {}

  @Post()
  authorize(@Body() dto: AuthorizeVisitorDto): Promise<Visitor> {
    return this.service.authorize(dto);
  }

  @Get()
  findAll(): Promise<Visitor[]> {
    return this.service.findAll();
  }

  @Patch(':id/entry')
  registerEntry(@Param('id', ParseUUIDPipe) id: string): Promise<Visitor> {
    return this.service.registerEntry(id);
  }

  @Patch(':id/exit')
  registerExit(@Param('id', ParseUUIDPipe) id: string): Promise<Visitor> {
    return this.service.registerExit(id);
  }
}
