import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { getConnection } from 'typeorm';
import * as request from 'supertest';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});

const GRAPHQL_ENDPOINT = '/graphql';
const EMAIL = 'uthi1004@gmail.com';

describe('UserModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    await app.close();
  });

  describe('createAccount', () => {
    it('should create account', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation {
          createAccount(
            email: "${EMAIL}", 
            password:"12345", 
            role:DELIVERY) {
            ok
            error
          }
        }`,
        })
        .expect(200)
        .expect(res => {
          expect(res.body.data.createAccount.ok).toBeTruthy();
          expect(res.body.data.createAccount.error).toBeNull();
        });
    });

    it('should fail create same account', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation {
          createAccount(
            email: "${EMAIL}", 
            password:"12345", 
            role:DELIVERY) {
            ok
            error
          }
        }`,
        })
        .expect(200)
        .expect(res => {
          expect(res.body.data.createAccount.ok).toBeFalsy();
          expect(res.body.data.createAccount.error).toBe(
            'account is already exist',
          );
        });
    });
  });
  it.todo('me');
  it.todo('userProfile');
  it.todo('login');
  it.todo('editProfile');
  it.todo('verifyEmail');
});
