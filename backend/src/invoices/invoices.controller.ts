import { Body, Controller, Get, Query, Post, Patch, Delete, Param, HttpCode } from '@nestjs/common';
import { InvoicesSupabaseService } from './invoices.supabase.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Controller('invoices')
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesSupabaseService) {}

    @Get('search')
    async search(@Query('q') query: string) {
        return this.invoicesService.search(query ?? '');
    }

    @Get()
    async list() {
        const items = await this.invoicesService.findAll();
        return items;
    }

    @Get(':id')
    async get(@Param('id') id: string) {
        const invoice = await this.invoicesService.findOne(id);
        return { ok: true, invoice };
    }

    @Post()
    @HttpCode(201)
    async create(@Body() body: CreateInvoiceDto) {
        const saved = await this.invoicesService.create(body);
        return { ok: true, message: 'Invoice created successfully', invoice: saved };
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: UpdateInvoiceDto) {
        const updated = await this.invoicesService.update(id, body);
        return { ok: true, invoice: updated };
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.invoicesService.remove(id);
        return { ok: true, message: 'Invoice deleted' };
    }
}
