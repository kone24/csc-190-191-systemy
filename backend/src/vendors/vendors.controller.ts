import { Body, Controller, Get, Query, Post, Patch, Delete, Param, HttpCode } from '@nestjs/common';
import { VendorsSupabaseService } from './vendors.supabase.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

@Controller('vendors')
export class VendorsController {
    constructor(private readonly vendorsService: VendorsSupabaseService) { }

    @Get('search')
    async search(@Query('q') query: string) {
        return this.vendorsService.search(query ?? '');
    }

    @Get()
    async list() {
        const items = await this.vendorsService.findAll();
        return items;
    }

    @Get(':id')
    async get(@Param('id') id: string) {
        const vendor = await this.vendorsService.findOne(id);
        return { ok: true, vendor };
    }

    @Post()
    @HttpCode(201)
    async create(@Body() body: CreateVendorDto) {
        const saved = await this.vendorsService.create(body);
        return { ok: true, message: 'Vendor created successfully', vendor: saved };
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: UpdateVendorDto) {
        const updated = await this.vendorsService.update(id, body);
        return { ok: true, vendor: updated };
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.vendorsService.remove(id);
        return { ok: true, message: 'Vendor deleted' };
    }
}
