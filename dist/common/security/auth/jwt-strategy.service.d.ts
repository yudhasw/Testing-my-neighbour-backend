import { Strategy } from 'passport-jwt';
import { DatabaseService } from '../../../common/database/database.service';
import { ConfigService } from '@nestjs/config';
export interface JwtPayload {
    sub: string;
    iat?: number;
    exp?: number;
}
declare const JwtStrategyService_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategyService extends JwtStrategyService_base {
    private prisma;
    private readonly configService;
    constructor(prisma: DatabaseService, configService: ConfigService);
    validate(payload: JwtPayload): Promise<{
        sub: string;
        username: string;
        email: string;
        fullName: string;
        role: import("src/common/database/generated/prisma").$Enums.UserRole;
        resident: ({
            unit: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import("src/common/database/generated/prisma").$Enums.UnitStatus;
                unitNumber: string;
                buildingName: string | null;
                unitOwnership: string[];
                floorNumber: number | null;
                numberOfRooms: number | null;
                priceSale: number;
                squareFootage: number | null;
                location: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            emergencyContactName: string | null;
            emergencyContactNumber: string | null;
            movedInDate: Date;
            movedOutDate: Date | null;
            familyCode: string | null;
            residentStatus: import("src/common/database/generated/prisma").$Enums.ResidentStatus | null;
            unitId: string | null;
            kprPaymentAmount: number | null;
            kprDueDate: Date | null;
            isKprPaid: boolean | null;
            registrationStatus: import("src/common/database/generated/prisma").$Enums.RegistrationStatus;
            registrationMethod: import("src/common/database/generated/prisma").$Enums.RegistrationMethod;
            approvedBy: string | null;
            approvalDate: Date | null;
            rejectionReason: string | null;
            pendingApproval: boolean;
            approvedByHeadOfHousehold: string | null;
        }) | null;
    }>;
}
export {};
