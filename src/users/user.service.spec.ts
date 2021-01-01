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
  update: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(() => 'token-string'),
  verify: jest.fn(),
});

const mockMailService = () => ({
  sendVerificationEmail: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserService', () => {
  let service: UserService;
  let userRepository: MockRepository<User>;
  let verificationRepository: MockRepository<Verification>;
  let mailService: MailService;
  let jwtService: JwtService;

  beforeEach(async () => {
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
        { provide: JwtService, useValue: mockJwtService() },
        { provide: MailService, useValue: mockMailService() },
      ],
    }).compile();

    service = modules.get<UserService>(UserService);
    mailService = modules.get<MailService>(MailService);
    jwtService = modules.get<JwtService>(JwtService);
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

  describe('login', () => {
    const loginArgs = {
      email: 'mail@mail.com',
      password: '12345',
    };
    it('should fail if user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(undefined);
      const result = await service.login(loginArgs);

      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
      expect(result).toEqual({ ok: false, error: 'user not found' });
    });

    it('should fail if the password is wrong', async () => {
      const mockedUser = {
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };
      userRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);

      expect(result).toEqual({
        ok: false,
        error: 'password not correct',
      });
    });

    it('should return token if password correct', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };
      userRepository.findOne.mockResolvedValue(mockedUser);

      const result = await service.login(loginArgs);

      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual({ ok: true, token: 'token-string' });
    });
  });

  describe('findById', () => {
    it('should find an existing user', async () => {
      userRepository.findOne.mockResolvedValue({ id: 1 });
      const result = await service.findById(1);
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('userProfile', () => {
    const findByIdArg = {
      id: 1,
    };
    it('should find existing user', async () => {
      userRepository.findOne.mockResolvedValue(findByIdArg);
      const result = await service.userProfile(1);

      expect(result).toEqual({ ok: true, profile: findByIdArg });
    });

    it('should fail if no user if not found', async () => {
      userRepository.findOne.mockResolvedValue(undefined);
      const result = await service.userProfile(1);

      expect(result).toEqual({ ok: false, error: 'user not found' });
    });
  });

  describe('editProfile', () => {
    const oldUser = {
      email: 'mail@old.com',
    };

    const editProfileArgs = {
      id: 1,
      email: 'mail@new.com',
      password: 'new-password',
    };

    const newVerification = {
      code: '12345',
    };

    const newUser = {
      email: editProfileArgs.email,
      password: editProfileArgs.password,
      verified: false,
    };

    it('should change email', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(oldUser as any);
      userRepository.findOne.mockResolvedValue(null);
      verificationRepository.create.mockReturnValue(newVerification);
      verificationRepository.save.mockReturnValue(newVerification);

      const result = await service.editProfile(
        editProfileArgs.id,
        editProfileArgs,
      );

      expect(service.findById).toHaveBeenCalledTimes(1);
      expect(service.findById).toHaveBeenCalledWith(editProfileArgs.id);

      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        email: newUser.email,
      });

      expect(verificationRepository.delete).toHaveBeenCalledTimes(1);

      expect(verificationRepository.create).toHaveBeenCalledWith({
        user: newUser,
      });

      expect(verificationRepository.save).toHaveBeenCalledWith(newVerification);

      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        newUser.email,
        newVerification.code,
      );

      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(newUser);

      expect(result).toEqual({ ok: true });
    });

    it('should return error if not exist user', async () => {
      userRepository.findOne.mockResolvedValue(undefined);

      const result = await service.editProfile(
        editProfileArgs.id,
        editProfileArgs,
      );
      expect(result).toEqual({ ok: false, error: 'user info not exist' });
      expect(verificationRepository.create).not.toBeCalled();
      expect(userRepository.save).not.toBeCalled();
      expect(mailService.sendVerificationEmail).not.toBeCalled();
    });
  });

  describe('verifyEmail', () => {
    it('should fail verification not found', async () => {
      verificationRepository.findOne.mockResolvedValue(undefined);
      const result = await service.verifyEmail('12345');

      expect(verificationRepository.findOne).toHaveBeenCalledTimes(1);
      expect(verificationRepository.update).not.toHaveBeenCalled();
      expect(verificationRepository.delete).not.toHaveBeenCalled();

      expect(result).toEqual({
        ok: false,
        error: "verification code isn't exist",
      });
    });

    it('should success verification', async () => {
      const mockedVerification = {
        user: 1,
        code: '12345',
        id: 1,
      };
      verificationRepository.findOne.mockResolvedValue(mockedVerification);
      const result = await service.verifyEmail(mockedVerification.code);

      expect(verificationRepository.findOne).toHaveBeenCalledTimes(1);
      expect(verificationRepository.findOne).toHaveBeenCalledWith(
        { code: mockedVerification.code },
        expect.any(Object),
      );

      expect(userRepository.update).toHaveBeenCalledTimes(1);
      expect(
        userRepository.update,
      ).toHaveBeenCalledWith(mockedVerification.user, { verified: true });

      expect(verificationRepository.delete).toHaveBeenCalledTimes(1);
      expect(verificationRepository.delete).toHaveBeenCalledWith(
        mockedVerification.id,
      );

      expect(result).toEqual({ ok: true });
    });
  });
});
