import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { ROLE, User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UserService } from './user.service';

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
});

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
  let verificationRepository: MockRepository<Verification>;
  let mailService: MailService;

  beforeAll(async () => {
    const modules = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = modules.get<UserService>(UserService);
    mailService = modules.get<MailService>(MailService);
    userRepository = modules.get(getRepositoryToken(User));
    verificationRepository = modules.get(getRepositoryToken(Verification));
  });

  it('be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    const createAccount = {
      role: ROLE.CLIENT,
      password: '12345',
      email: 'mail@mail.com',
    };

    it('should fail if user exist', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'mail@mail.com',
      });

      const res = await service.createAccount(createAccount);

      expect(res.ok).toBeFalsy();
      expect(res.error).toBe('account is already exist');
    });

    it('should create a new user', async () => {
      // mock
      userRepository.findOne.mockResolvedValue(undefined);
      userRepository.create.mockImplementation(user => user);
      verificationRepository.create.mockImplementation(user => ({
        ...user,
        code: '12345',
      }));

      // action
      const result = await service.createAccount(createAccount);

      // test
      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith(createAccount);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(createAccount);

      expect(verificationRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationRepository.create).toHaveBeenCalledWith({
        user: createAccount,
      });
      expect(verificationRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationRepository.save).toHaveBeenCalledWith({
        user: createAccount,
        code: '12345',
      });

      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );

      expect(result.ok).toBeTruthy();
    });

    it('should fail on exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error('reject'));

      const result = await service.createAccount(createAccount);
      expect(result).toEqual({ ok: false, error: 'reject' });
    });
  });

  it.todo('login');
  it.todo('findById');
  it.todo('userProfile');

  it.todo('editProfile');
  it.todo('verifyEmail');
});
