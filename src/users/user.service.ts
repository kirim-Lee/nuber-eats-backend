import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly user: Repository<User>,
    @InjectRepository(Verification)
    private readonly verification: Repository<Verification>,
    private readonly jwtService: JwtService,
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

      const verification = this.verification.create({ user });
      await this.verification.save(verification);

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

      const token = this.jwtService.sign({ id: user.id });

      // JWT
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async findById(id: number): Promise<User> {
    return await this.user.findOne({ id });
  }

  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.findById(userId);
      if (!user) {
        throw Error('user info not exist');
      }

      if (email) {
        user.email = email;
        user.verified = false;
        await this.verification.delete({ user });
        await this.verification.save(this.verification.create({ user }));
      }

      if (password) {
        user.password = password;
      }

      await this.user.save(user);

      return {
        ok: true,
      };
    } catch (e) {
      console.log(e);
      return { ok: false, error: e.message };
    }
  }
}
