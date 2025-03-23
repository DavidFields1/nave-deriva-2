import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get('phase-change-diagram')
	getPhaseChange(@Query('pressure') pressure: string) {
		return this.appService.getPhaseChange(pressure);
	}
}
