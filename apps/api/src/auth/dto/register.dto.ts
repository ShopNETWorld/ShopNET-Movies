import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  IsOptional,
  IsIn
} from 'class-validator';
import type { UserRole } from '@shopnet/types';

export class RegisterDto {
  @IsEmail({}, { message: 'A valid email address is required' })
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number or special character'
  })
  password!: string;

  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters long' })
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsIn(['USER', 'CREATOR', 'PRODUCER', 'ADMIN'], {
    message: 'Role must be USER, CREATOR, PRODUCER, or ADMIN'
  })
  role?: UserRole = 'CREATOR';
}
