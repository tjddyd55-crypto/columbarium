import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public } from '../common/decorators/public.decorator';
import { AllowPendingPasswordChange } from '../common/decorators/allow-pending-password-change.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  async signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('admin-login')
  async adminLogin(@Body() dto: LoginDto) {
    return this.authService.loginForAdminPanel(dto);
  }

  @AllowPendingPasswordChange()
  @Post('change-password')
  async changePassword(
    @CurrentUser() current: { id: string },
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      BigInt(current.id),
      dto.currentPassword,
      dto.newPassword,
    );
  }
}
