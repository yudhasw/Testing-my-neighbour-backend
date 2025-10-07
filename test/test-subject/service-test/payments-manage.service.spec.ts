/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsManageService } from '../../../src/modules/financial-module/payments-module/payments-manage.service';
import { DatabaseService } from '../../../src/common/database/database.service';
import { PaymentStatus } from '../../../src/common/database/generated/prisma';

