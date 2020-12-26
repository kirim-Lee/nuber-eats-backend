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
const PASSWORD = '12345';

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let token: string;

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
            password:"${PASSWORD}", 
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
            password:"${PASSWORD}", 
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

  describe('login', () => {
    it('should login with correct credentials', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation{
            login(email: "${EMAIL}", password:"${PASSWORD}")
            {
              ok
              token
              error
            }
          }`,
        })
        .expect(200)
        .expect(res => {
          expect(res.body.data.login.ok).toBeTruthy();
          expect(res.body.data.login.error).toBeNull();
          expect(res.body.data.login.token).toEqual(expect.any(String));
          token = res.body.data.login.token;
        });
    });

    it('should not be able to login with wrong password', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation{
          login(email: "${EMAIL}", password:"wrongpassword")
          {
            ok
            token
            error
          }
        }`,
        })
        .expect(200)
        .expect(res => {
          expect(res.body.data.login.ok).toBeFalsy();
          expect(res.body.data.login.error).toEqual('password not correct');
          expect(res.body.data.login.token).toBeNull();
        });
    });
  });

  it('should not be able to login with wrong email', () => {
    return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .send({
        query: `mutation{
        login(email: "wrong@email.com", password:"${PASSWORD}")
        {
          ok
          token
          error
        }
      }`,
      })
      .expect(200)
      .expect(res => {
        expect(res.body.data.login.ok).toBeFalsy();
        expect(res.body.data.login.error).toEqual('user not found');
        expect(res.body.data.login.token).toBeNull();
      });
  });

  it.todo('me');
  it.todo('userProfile');
  it.todo('editProfile');
  it.todo('verifyEmail');
});
