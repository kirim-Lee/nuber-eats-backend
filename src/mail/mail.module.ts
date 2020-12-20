import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constant';
import { MainModuleOption } from './mail.interface';
import { MailService } from './mail.service';

@Module({})
@Global()
export class MailModule {
  static forRoot(options: MainModuleOption): DynamicModule {
    return {
      module: MailModule,
      providers: [{ provide: CONFIG_OPTIONS, useValue: options }, MailService],
      exports: [MailService],
    };
  }
}
