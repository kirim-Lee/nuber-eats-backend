import { Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { UserService } from 'src/users/user.service';
import { JwtService } from '../jwt/jwt.service';

@Injectable()
export class AuthUserService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async getUser(token: string): Promise<User | null> {
    try {
      const decode = this.jwtService.verify(token.toString());
      if (typeof decode === 'object' && 'id' in decode) {
        const user = await this.userService.findById(decode['id']);
        return user;
      }
      return null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
