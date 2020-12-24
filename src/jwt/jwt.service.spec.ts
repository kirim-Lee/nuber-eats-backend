import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constant';
import { JwtService } from './jwt.service';
import * as jwt from 'jsonwebtoken';

const TEST_KEY = 'testkey';
const TOKEN = 'token';
const ID = 1;

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => TOKEN),
  verify: jest.fn(() => ({ id: ID })),
}));

describe('jwtService', () => {
  let service: JwtService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: CONFIG_OPTIONS,
          useValue: { privateKey: TEST_KEY },
        },
      ],
    }).compile();
    service = module.get<JwtService>(JwtService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sign', () => {
    it('should return a signed token', () => {
      const token = service.sign({ id: ID });

      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toBeCalledWith({ id: ID }, TEST_KEY);
      expect(typeof token).toBe('string');
    });
  });

  describe('verify', () => {
    it('should return a decoded token', () => {
      const decodeToken = service.verify(TOKEN);

      expect(jwt.verify).toBeCalledTimes(1);
      expect(jwt.verify).toBeCalledWith(TOKEN, TEST_KEY);
      expect(decodeToken).toEqual({ id: ID });
    });
  });
});
