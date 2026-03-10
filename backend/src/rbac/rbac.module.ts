import { Module } from '@nestjs/common';
import { RbacController } from './rbac.controller';
import { RbacService } from './rbac.service';
import { RbacSupabaseService } from './rbac.supabase.service';

@Module({
  controllers: [RbacController],
  providers: [RbacService, RbacSupabaseService],
  exports: [RbacService],
})
export class RbacModule {}