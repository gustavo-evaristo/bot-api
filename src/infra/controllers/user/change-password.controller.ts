import { Body, Controller, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChangePasswordUseCase } from 'src/domain/use-cases';
import { JwtGuard } from '../../authentication/jwt.guard';
import { ChangePasswordDTO } from '../../dtos/user/change-password.dto';

@ApiTags('Users')
@Controller('users')
export class ChangePasswordController {
  constructor(private readonly changePasswordUseCase: ChangePasswordUseCase) {}

  @Patch('me/password')
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Change logged user password' })
  async changePassword(@Req() { user }, @Body() body: ChangePasswordDTO) {
    await this.changePasswordUseCase.execute({
      userId: user.id,
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
      confirmPassword: body.confirmPassword,
    });

    return { message: 'Senha alterada com sucesso' };
  }
}
