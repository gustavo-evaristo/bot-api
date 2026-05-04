import { Body, Controller, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateProfileUseCase } from 'src/domain/use-cases';
import { JwtGuard } from '../../authentication/jwt.guard';
import { UpdateProfileDTO } from '../../dtos/user/update-profile.dto';

@ApiTags('Users')
@Controller('users')
export class UpdateProfileController {
  constructor(private readonly updateProfileUseCase: UpdateProfileUseCase) {}

  @Patch('me')
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Update logged user profile' })
  async update(@Req() { user }, @Body() body: UpdateProfileDTO) {
    const { user: data, company } = await this.updateProfileUseCase.execute({
      userId: user.id,
      ...body,
    });

    return {
      id: data.id.toString(),
      isActive: data.isActive,
      name: data.name,
      email: data.email,
      phone: data.phone,
      avatarUrl: data.avatarUrl,
      role: data.role,
      createdAt: data.createdAt,
      company: company
        ? {
            id: company.id.toString(),
            name: company.name,
          }
        : null,
    };
  }
}
