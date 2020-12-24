import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constant';
import { MailService } from './mail.service';

jest.mock('got', jest.fn());
jest.mock('form-data', () => ({
  append: jest.fn(),
}));

describe('MailService', () => {
  let service: MailService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            apiKey: 'test-apiKey',
            domain: 'test-domain',
            fromEmail: 'test-email',
          },
        },
      ],
    }).compile();
    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.todo('sendEmail');

  describe('sendVerificationEmail', () => {
    it('should call sendEmail', async () => {
      const SEND_EMAIL = 'test@email.com';
      const SEND_CODE = 'code123';

      const sendEmail = jest
        .spyOn(service as any, 'sendEmail')
        .mockImplementation(jest.fn());

      service.sendVerificationEmail(SEND_EMAIL, SEND_CODE);
      expect(sendEmail).toHaveBeenCalledTimes(1);

      expect(sendEmail).toHaveBeenCalledWith(
        SEND_EMAIL,
        expect.any(String),
        expect.any(String),
        [
          { key: 'code', value: SEND_CODE },
          { key: 'username', value: SEND_EMAIL },
        ],
      );
    });
  });
});
