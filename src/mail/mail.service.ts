import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constant';
import { MainModuleOption } from './mail.interface';
import got from 'got';
import * as FormData from 'form-data';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MainModuleOption,
  ) {}

  private async sendEmail(subject: string, to: string) {
    const form = new FormData();
    form.append('from', `nuber@${this.options.domain}`);
    form.append('to', to);
    form.append('subject', subject);
    form.append('template', 'verify-email');
    form.append('v:username', 'aaa');
    form.append('v:code', 'code name');

    const res = await got(
      `https://api.mailgun.net/v3/${this.options.domain}/messages`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `api:${this.options.apiKey}`,
          ).toString('base64')}`,
        },
        method: 'POST',
        body: form,
      },
    );

    console.log(res.body);
  }
}
