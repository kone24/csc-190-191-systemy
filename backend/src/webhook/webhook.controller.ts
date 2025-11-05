import { Controller, Post, Headers, Body, HttpCode } from '@nestjs/common';

@Controller('webhook')
export class WebhookController {
  // Simple webhook endpoint to receive POST requests
  @Post()
  @HttpCode(200)
  handleWebhook(
    @Headers() headers: Record<string, string >,
    @Body() body: unknown
  ){
    // Log headers and body for debugging
    console.log('[Webhook] headers:',{
        'conbtent-type': headers['content-type'],
        'user-agent': headers['user-agent'],
        'x-github-event': headers['x-github-event'],
    });
    console.log('[Webhook] body:', body);

    /* Insert processing logic here for future use (e.g., PayPal payment, Auth Provider)*/

    return { status: 'received' };
    }
}