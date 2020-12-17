import { Request, Response, NextFunction } from 'express';

export function jwtMiddelware(req: Request, res: Response, next: NextFunction) {
  console.log(`Request...`, req.headers);
  next();
}
