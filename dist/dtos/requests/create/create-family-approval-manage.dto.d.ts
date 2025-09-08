import { ApprovalStatus } from 'src/common/database/generated/prisma';
export declare class CreateFamilyApprovalManageDto {
    readonly familyMemberId: string;
    readonly headOfHouseholdId: string;
    readonly notes?: string;
    readonly status: ApprovalStatus;
}
