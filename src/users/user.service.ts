import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly user: Repository<User>,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      // check new user
      const exist = await this.user.findOne({ email });
      if (exist) {
        // make error
        throw Error('account is already exist');
      }

      // create user & hash password
      const user = this.user.create({ email, password, role });
      await this.user.save(user);

      // return result
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      // finde the user with the email
      const user = await this.user.findOne({ email });
      if (!user) {
        throw Error('user not found');
      }

      // check password
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        throw Error('password not correct');
      }

      // JWT
      return {
        ok: true,
        token: '',
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
}
