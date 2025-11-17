import { Controller, Post, Headers, Body, HttpCode, Req, Logger } from '@nestjs/common';
import type { IncomingHttpHeaders } from 'http';
import type { Request } from 'express';

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  @Post()
  @HttpCode(200) // or 204 if prefer no body
  handleWebhook(
    @Headers() headers: IncomingHttpHeaders,
    @Body() body: unknown,
    @Req() req: Request & { rawBody?: Buffer }
  ) {
    // Typed header reads
    const contentType = headers['content-type'];
    const userAgent = headers['user-agent'];
    const githubEvent = headers['x-github-event'];
    const deliveryId = headers['x-github-delivery'];

    // Minimal logging (avoid full body in prod)
    this.logger.log(
      JSON.stringify({
        msg: '[Webhook] received',
        contentType,
        userAgent,
        githubEvent,
        deliveryId,
        hasRawBody: Boolean(req.rawBody),
      })
    );


    /* Insert processing logic here for future use (e.g., PayPal payment, Auth Provider)*/

    return { status: 'received' };
    }
}