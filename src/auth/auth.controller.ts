import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Authorize } from 'src/common/guards/authorize';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() body: { email: string; password: string; name: string },
  ) {
    const response = await this.authService.register(body);
    return response;
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    const response = this.authService.login(body);
    return response;
  }

  @UseGuards(Authorize)
  @Get('protected')
  protectedRoute(@Req() req: Request) {
    const userId = (req['user'] as { id: string }).id;
    const response = this.authService.protectedRoute(userId);
    return response;
  }
}
