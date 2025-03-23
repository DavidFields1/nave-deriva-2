import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
	private logger = new Logger('HTTP');

	use(req: Request, res: Response, next: NextFunction) {
		const { method, originalUrl } = req;
		const userAgent = req.get('user-agent') || '';
		const startTime = Date.now();

		res.on('finish', () => {
			const { statusCode } = res;
			const elapsedTime = Date.now() - startTime;
			this.logger.log(
				`${method} ${originalUrl} ${statusCode} - ${elapsedTime}ms - ${userAgent}`
			);
		});

		next();
	}
}
