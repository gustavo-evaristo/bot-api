import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserUseCase } from 'src/domain/use-cases/user/create-user.use-case';
import { CreateUserDTO } from '../../dtos/user/create-user.dto';
import { CreateUserResponse } from '../../responses/user/create-user.response';

@ApiTags('Users')
@Controller('users')
export class CreateUserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDTO })
  @ApiCreatedResponse({ type: CreateUserResponse })
  async execute(@Body() body: CreateUserDTO) {
    const { user, company, token } = await this.createUserUseCase.execute(body);

    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      role: user.role,
      createdAt: user.createdAt,
      token,
      company: { id: company.id.toString(), name: company.name },
    };
  }
}
