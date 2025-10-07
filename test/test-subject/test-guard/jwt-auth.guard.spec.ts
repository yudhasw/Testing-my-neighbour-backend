// jwt-strategy.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategyService } from '../../../src/common/security/auth/jwt-strategy.service'; 
import { DatabaseService } from '../../../src/common/database/database.service';
import { ConfigService } from '@nestjs/config';

describe('JwtStrategyService', () => {
  let service: JwtStrategyService;

  const prismaMock = {
    users: {
      findUnique: jest.fn(),
    },
  } as unknown as DatabaseService;

  const configMock = {
    get: jest.fn().mockReturnValue('secret-from-config'),
  } as unknown as ConfigService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategyService,
        { provide: DatabaseService, useValue: prismaMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get<JwtStrategyService>(JwtStrategyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    // dipanggil saat constructor (super) minta JWT_SECRET
    expect((configMock.get as jest.Mock)).toHaveBeenCalledWith('JWT_SECRET');
  });

  it('Positive Case – mengembalikan payload user valid', async () => {
    (prismaMock.users.findUnique as jest.Mock).mockResolvedValue({
      id: 'u-123',
      username: 'yudha',
      primaryEmail: 'yudha@example.com',
      fullName: 'Yudha Setiawan',
      role: 'RESIDENT',
      emailVerificationToken: null,
      sessionToken: 'sess-xyz',
      Resident: { id: 'r-1', unit: { id: 'unit-1', name: 'A-101' } },
      Employee: null,
    });

    const payload = await service.validate({ sub: 'u-123', iat: 1, exp: 2 });

    // verifikasi hasil
    expect(payload).toEqual({
      sub: 'u-123',
      username: 'yudha',
      email: 'yudha@example.com',
      fullName: 'Yudha Setiawan',
      role: 'RESIDENT',
      resident: { id: 'r-1', unit: { id: 'unit-1', name: 'A-101' } },
    });

    // verifikasi query prisma (where & include)
    expect(prismaMock.users.findUnique).toHaveBeenCalledWith({
      where: { id: 'u-123' },
      include: {
        Resident: { include: { unit: true } },
        Employee: true,
      },
    });
  });

  it('Negative Case – user tidak ada → "Invalid token"', async () => {
    (prismaMock.users.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(service.validate({ sub: 'missing' })).rejects.toThrow(
      new UnauthorizedException('Invalid token'),
    );
  });

  it('Negative Case – email belum terverifikasi', async () => {
    (prismaMock.users.findUnique as jest.Mock).mockResolvedValue({
      id: 'u-1',
      username: 'user1',
      primaryEmail: 'u1@example.com',
      fullName: 'User One',
      role: 'RESIDENT',
      emailVerificationToken: 'still-pending',
      sessionToken: 'sess-abc',
      Resident: null,
      Employee: null,
    });

    await expect(service.validate({ sub: 'u-1' })).rejects.toThrow(
      new UnauthorizedException('Email not verified'),
    );
  });

  it('Negative Case – session kedaluwarsa / tidak ada', async () => {
    (prismaMock.users.findUnique as jest.Mock).mockResolvedValue({
      id: 'u-2',
      username: 'user2',
      primaryEmail: 'u2@example.com',
      fullName: 'User Two',
      role: 'RESIDENT',
      emailVerificationToken: null,
      sessionToken: null, // atau undefined
      Resident: null,
      Employee: null,
    });

    await expect(service.validate({ sub: 'u-2' })).rejects.toThrow(
      new UnauthorizedException('Session expired. Please login again.'),
    );
  });

  it('Defensive – validasi tetap memakai id dari payload.sub', async () => {
    (prismaMock.users.findUnique as jest.Mock).mockResolvedValue({
      id: 'u-xyz',
      username: 'safe',
      primaryEmail: 'safe@example.com',
      fullName: 'Safe User',
      role: 'ADMIN',
      emailVerificationToken: null,
      sessionToken: 'sess-ok',
      Resident: null,
      Employee: { id: 'emp-1' },
    });

    await service.validate({ sub: 'u-xyz' });

    const callArgs = (prismaMock.users.findUnique as jest.Mock).mock.calls[0][0];
    expect(callArgs.where).toEqual({ id: 'u-xyz' });
  });
});
