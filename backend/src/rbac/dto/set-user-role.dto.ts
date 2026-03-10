import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class SetUserRoleDto {
  @IsIn(['admin', 'staff', 'manager'])
  role!: 'admin' | 'staff' | 'manager';

  @IsOptional()
  @IsString()
  @MaxLength(200)
  reason?: string;
}