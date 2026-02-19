import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserUseCase } from 'src/domain/use-cases/create-user.use-case';
import { CreateUserDTO } from '../dtos/create-user.dto';
import { CreateUserResponse } from '../responses/create-user.response';

interface Input {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface Output {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
}

@ApiTags('Users')
@Controller('users')
export class CreateUserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDTO })
  @ApiCreatedResponse({ type: CreateUserResponse })
  async execute(@Body() body: CreateUserDTO): Promise<Output> {
    const user = await this.createUserUseCase.execute(body);

    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
    };
  }
}
