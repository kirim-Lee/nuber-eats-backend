import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constant';
import { MailService } from './mail.service';
import * as FormData from 'form-data';
import got from 'got';

jest.mock('got');
jest.mock('form-data');

const TEST_DOMAIN = 'test-domain';

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
            domain: TEST_DOMAIN,
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

  describe('sendEmail', () => {
    it('should send email', async () => {
      const sendEmail = Reflect.get(service, 'sendEmail');
      await sendEmail.call(service, 'test', 'ee', 'eee', [
        { key: '1', value: '1' },
        { key: '2', value: '2' },
      ]);

      const formAppend = jest.spyOn(FormData.prototype, 'append');

      expect(formAppend).toHaveBeenCalledTimes(6);
      expect(got).toHaveBeenCalledTimes(1);
      expect(got).toHaveBeenCalledWith(
        `https://api.mailgun.net/v3/${TEST_DOMAIN}/messages`,
        expect.any(Object),
      );
    });

    it('should return error when send email failed', async () => {
      const sendEmail = Reflect.get(service, 'sendEmail');
      (got as any).mockImplementation(() => {
        throw Error('got implementation error');
      });
      const consoleLog = jest.spyOn(console, 'log');
      await sendEmail.call(service, 'test', 'ee', 'eee', []);
      expect(consoleLog).toHaveBeenCalledTimes(1);
      expect(consoleLog).toHaveBeenCalledWith(
        Error('got implementation error'),
      );
    });
  });

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
