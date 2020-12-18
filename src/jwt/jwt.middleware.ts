import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UserService } from 'src/users/user.service';
import { JwtService } from './jwt.service';

@Injectable()
export class JwtMiddelware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if ('x-jwt' in req.headers) {
      const token = req.headers['x-jwt'];
      try {
        const decode = this.jwtService.verify(token.toString());
        if (typeof decode === 'object' && 'id' in decode) {
          const user = await this.userService.findById(decode['id']);
          req['user'] = user;
        }
      } catch (e) {
        console.log(e);
      }
    }
    next();
  }
}
