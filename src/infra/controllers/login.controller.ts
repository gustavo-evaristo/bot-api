import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginUseCase } from 'src/domain/use-cases/login.use-case';
import { LoginDTO } from '../dtos/login.dto';
import { LoginResponse } from '../responses/login.response';

@ApiTags('Auth')
@Controller('login')
export class LoginController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Post()
  @ApiBody({ type: LoginDTO })
  @ApiOkResponse({ type: LoginResponse })
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() body: LoginDTO) {
    const { user, token } = await this.loginUseCase.execute(body);

    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      token,
    };
  }
}
