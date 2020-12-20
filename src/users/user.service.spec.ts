import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { ROLE, User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UserService } from './user.service';

const mockRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
};

const verifyRopository = {
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

const mockMailService = {
  sendVerificationEmail: jest.fn(),
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserService', () => {
  let service: UserService;
  let userRepository: MockRepository<User>;

  beforeAll(async () => {
    const modules = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: verifyRopository,
        },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = modules.get<UserService>(UserService);
    userRepository = modules.get(getRepositoryToken(User));
  });

  it('be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    it('should fail if user exist', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'mail@mail.com',
      });

      const res = await service.createAccount({
        role: ROLE.CLIENT,
        password: '12345',
        email: 'mail@mail.com',
      });

      expect(res.ok).toBeFalsy();
      expect(res.error).toBe('account is already exist');
    });
  });

  it.todo('login');
  it.todo('findById');
  it.todo('userProfile');

  it.todo('editProfile');
  it.todo('verifyEmail');
});
