import { userSignup } from './controllers/auth.controller.js';
import { User } from './models/users.model.js';
import { Store } from './models/stores.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock the models and functions
jest.mock('./models/users.model.js');
jest.mock('./models/stores.model.js');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock request and response objects
    req = {
      body: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role_id: 1
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn()
    };
  });

  describe('userSignup', () => {
    it('should create a store and a user, then return token and user data', async () => {
      // Mock data
      const mockStoreId = '123e4567-e89b-12d3-a456-426614174000';
      const mockUserId = '123e4567-e89b-12d3-a456-426614174001';
      const mockToken = 'mock-token';
      const mockStoreName = 'Test Store';
      const mockDomain = 'test-store.com';
      
      // Mock Store.create
      Store.create.mockResolvedValue({
        id: mockStoreId,
        name: mockStoreName,
        domain: mockDomain
      });

      // Mock bcrypt.genSalt and bcrypt.hash
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashed_password');

      // Mock User.findOne (user doesn't exist)
      User.findOne.mockResolvedValue(null);

      // Mock User.create
      const mockUser = {
        id: mockUserId,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        role_id: req.body.role_id,
        store_id: mockStoreId
      };
      User.create.mockResolvedValue(mockUser);

      // Mock jwt.sign
      jwt.sign.mockImplementation(() => mockToken);

      // Call the function
      await userSignup(req, res);

      // Assertions
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: req.body.email } });
      expect(Store.create).toHaveBeenCalled();
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(req.body.password, 'salt');
      expect(User.create).toHaveBeenCalledWith({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: 'hashed_password',
        role_id: req.body.role_id,
        store_id: mockStoreId
      });
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        token: mockToken,
        data: mockUser,
        store: {
          id: mockStoreId,
          name: mockStoreName,
          domain: mockDomain
        }
      });
    });

    it('should return 409 if user with email already exists', async () => {
      // Mock User.findOne (user exists)
      User.findOne.mockResolvedValue({
        id: '123e4567-e89b-12d3-a456-426614174001',
        email: req.body.email
      });

      // Call the function
      await userSignup(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        type: 'email',
        message: 'Email already in use'
      });
      expect(Store.create).not.toHaveBeenCalled();
      expect(User.create).not.toHaveBeenCalled();
    });
  });
});