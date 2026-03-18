import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { UnregisterDeviceDto } from './dto/unregister-device.dto';

@Controller('devices')
@UseGuards(JwtAuthGuard)
export class DevicesController {
  constructor(private readonly devices: DevicesService) {}

  @Post('register')
  async register(
    @CurrentUser() user: { id: string },
    @Body() dto: RegisterDeviceDto,
  ) {
    const device = await this.devices.registerDevice(BigInt(user.id), {
      pushToken: dto.pushToken,
      platform: dto.platform,
      appVersion: dto.appVersion,
      deviceModel: dto.deviceModel,
    });
    return {
      id: String(device.id),
      platform: device.platform,
      isActive: device.isActive,
    };
  }

  @Post('unregister')
  async unregister(
    @CurrentUser() user: { id: string },
    @Body() dto: UnregisterDeviceDto,
  ) {
    return this.devices.unregisterDevice(BigInt(user.id), dto.pushToken);
  }

  @Get('me')
  async getMy(@CurrentUser() user: { id: string }) {
    return this.devices.getMyDevices(BigInt(user.id));
  }
}
