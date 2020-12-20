import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constant';
import { MailVariables, MainModuleOption } from './mail.interface';
import got from 'got';
import * as FormData from 'form-data';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MainModuleOption,
  ) {}

  private async sendEmail(
    to: string,
    subject: string,
    template: string,
    emailVariables: MailVariables[],
  ) {
    const form = new FormData();

    form.append('from', `nuber eats <nuber@${this.options.domain}>`);
    form.append('to', to);
    form.append('subject', subject);
    form.append('template', template);
    emailVariables.forEach(item => form.append(`v:${item.key}`, item.value));

    try {
      await got(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `api:${this.options.apiKey}`,
          ).toString('base64')}`,
        },
        method: 'POST',
        body: form,
      });
    } catch (e) {
      console.log(e);
    }
  }

  sendVerificationEmail(email: string, code: string) {
    const subject = 'Verify you Email';
    const template = 'verify-email';
    const variables = [
      { key: 'code', value: code },
      { key: 'username', value: email },
    ];

    this.sendEmail(email, subject, template, variables);
  }
}
