import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetProfileUseCase } from 'src/domain/use-cases/get-profile.use-case';
import { JwtGuard } from '../authentication/jwt.guard';

@ApiTags('Users')
@Controller('users')
export class GetProfileController {
  constructor(private readonly getProfileUseCase: GetProfileUseCase) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get user profile' })
  async getProfile(@Req() { user }) {
    const data = await this.getProfileUseCase.execute(user.id);

    return {
      id: data.id.toString(),
      isActive: data.isActive,
      name: data.name,
      email: data.email,
      phone: data.phone,
      createdAt: data.createdAt,
    };
  }
}
