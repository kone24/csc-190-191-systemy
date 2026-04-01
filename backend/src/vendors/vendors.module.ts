import { Module } from '@nestjs/common';
import { VendorsSupabaseService } from './vendors.supabase.service';
import { VendorsController } from './vendors.controller';

@Module({
    imports: [],
    providers: [VendorsSupabaseService],
    controllers: [VendorsController],
    exports: [VendorsSupabaseService],
})
export class VendorsModule { }
