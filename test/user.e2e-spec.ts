import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { getConnection, Repository } from 'typeorm';
import * as request from 'supertest';
import { User } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

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
  let userRepository: Repository<User>;
  let token: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
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

  describe('userProfile', () => {
    let userId: number;

    beforeAll(async () => {
      const [user] = await userRepository.find();
      userId = user.id;
    });

    it('should find a user', async () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `query{
            userProfile(id:${userId}){
              ok
              error
              profile {
                id
              }
            }
          }`,
        })
        .set('X-JWT', token)
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: { userProfile },
            },
          } = res;

          expect(userProfile.ok).toBeTruthy();
          expect(userProfile.error).toBeNull();
          expect(userProfile.profile.id).toBe(userId);
        });
    });

    it('should not find a profile', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `query{
            userProfile(id:2){
              ok
              error
              profile {
                id
              }
            }
          }`,
        })
        .set('X-JWT', token)
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: { userProfile },
            },
          } = res;

          expect(userProfile.ok).toBeFalsy();
          expect(userProfile.error).toBe('user not found');
          expect(userProfile.profile).toBeNull();
        });
    });

    it('should not return value when sending wrong jwt', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `query{
            userProfile(id:${userId}){
              ok
              error
              profile {
                id
              }
            }
          }`,
        })
        .set('X-JWT', 'wrongToken')
        .expect(200)
        .expect(res => {
          const {
            body: { data },
          } = res;

          expect(data).toBeNull();
        });
    });
  });

  describe('me', () => {
    it('should find my profile', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', token)
        .send({
          query: `query{
            me{
              email
            }
          }`,
        })
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res;
          expect(email).toBe(EMAIL);
        });
    });

    it('should not allow logged user', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', 'wrong token')
        .send({
          query: `query{
            me{
              email
            }
          }`,
        })
        .expect(200)
        .expect(res => {
          const {
            body: { errors, data },
          } = res;
          expect(errors[0].message).toBe('Forbidden resource');
          expect(data).toBeNull();
        });
    });
  });

  describe('editProfile', () => {
    const newEmail = 'change@change.com';
    it('should change email', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', token)
        .send({
          query: `mutation {
            editProfile(email:"${newEmail}"){
            ok
            error
          }
          }`,
        })
        .expect(200)
        .expect(async res => {
          const {
            body: {
              data: {
                editProfile: { ok, error },
              },
            },
          } = res;
          expect(ok).toBeTruthy();
          expect(error).toBeNull();
        });
    });

    it('should return after email change', async () => {
      const user = await userRepository.findOne({ email: newEmail });
      expect(user).not.toBeNull();
    });
  });
  it.todo('verifyEmail');
});
