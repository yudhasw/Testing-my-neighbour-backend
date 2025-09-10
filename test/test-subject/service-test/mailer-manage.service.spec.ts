/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { MailerManageService } from '../../../dist/common/helper/mail/mailer-manage.service';

describe('MailerManageService', () => {
  let service: MailerManageService;

  // Mock MailerService
  const mailerMock = {
    sendMail: jest.fn(),
  } as unknown as MailerService;

  beforeEach(() => {
    jest.clearAllMocks();
    // Matikan log agar output test bersih
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    service = new MailerManageService(mailerMock);
  });

  // ===== Dummy data =====
  const registrationData = {
    email: 'user@example.com',
    fullName: 'Budi Santoso',
    verificationCode: '123456',
    unitNumber: 'A-101',
    propertyName: 'My Property',
    isAdminDriven: false,
    loginUrl: 'https://app.example.com/login',
    uniqueCode: 'HH-20250101-123',
  };

  const docData = {
    adminEmail: 'admin@example.com',
    applicantName: 'Andi',
    applicantEmail: 'andi@example.com',
    documentType: 'KTP',
    submissionDate: '2025-01-01',
    reviewUrl: 'https://app.example.com/review/1',
  };

  const notifData = {
    headOfHouseholdEmail: 'hoh@example.com',
    headOfHouseholdName: 'Pak Joko',
    familyMemberName: 'Dina',
    familyMemberEmail: 'dina@example.com',
    uniqueCode: 'HH-20250101-999',
    actionUrl: 'https://app.example.com/approve/abc',
  };

  // =========================================================
  // sendHeadOfHouseholdVerificationEmail()
  // =========================================================
  describe('sendHeadOfHouseholdVerificationEmail()', () => {
    it('Positive Case - kirim email verifikasi kepala keluarga', async () => {
      (mailerMock.sendMail as any) = jest.fn().mockResolvedValue(undefined);

      const ok = await service.sendHeadOfHouseholdVerificationEmail(registrationData as any);

      expect(ok).toBe(true);
      expect(mailerMock.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: registrationData.email,
          subject: expect.stringContaining('Verifikasi Registrasi Kepala Keluarga - My Property'),
          template: 'emailVerification',
          context: expect.objectContaining({
            fullName: registrationData.fullName,
            verificationCode: registrationData.verificationCode,
            unitNumber: registrationData.unitNumber,
            propertyName: registrationData.propertyName,
            year: expect.any(Number),
          }),
        }),
      );
    });

    it('Positive Case - fallback subject saat propertyName kosong', async () => {
      (mailerMock.sendMail as any) = jest.fn().mockResolvedValue(undefined);

      const data = { ...registrationData, propertyName: undefined as any };
      const ok = await service.sendHeadOfHouseholdVerificationEmail(data as any);

      expect(ok).toBe(true);
      expect(mailerMock.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Property Management'),
        }),
      );
    });

    it('Negative Case - gagal mengirim → return false', async () => {
      (mailerMock.sendMail as any) = jest.fn().mockRejectedValue(new Error('smtp down'));

      const ok = await service.sendHeadOfHouseholdVerificationEmail(registrationData as any);
      expect(ok).toBe(false);
    });
  });

  // =========================================================
  // sendDocumentVerificationRequestToAdmin()
  // =========================================================
  describe('sendDocumentVerificationRequestToAdmin()', () => {
    it('Positive Case - kirim permintaan verifikasi ke admin', async () => {
      (mailerMock.sendMail as any) = jest.fn().mockResolvedValue(undefined);

      const ok = await service.sendDocumentVerificationRequestToAdmin(docData as any);
      expect(ok).toBe(true);
      expect(mailerMock.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: docData.adminEmail,
          subject: `Review Dokumen - ${docData.applicantName}`,
          template: 'reviewDocument',
          context: expect.objectContaining({
            applicantName: docData.applicantName,
            applicantEmail: docData.applicantEmail,
            documentType: docData.documentType,
            submissionDate: docData.submissionDate,
            reviewUrl: docData.reviewUrl,
            year: expect.any(Number),
          }),
        }),
      );
    });

    it('Negative Case - error kirim → return false', async () => {
      (mailerMock.sendMail as any) = jest.fn().mockRejectedValue(new Error('smtp fail'));
      const ok = await service.sendDocumentVerificationRequestToAdmin(docData as any);
      expect(ok).toBe(false);
    });
  });

  // =========================================================
  // sendHeadOfHouseholdWelcomeEmail()
  // =========================================================
  describe('sendHeadOfHouseholdWelcomeEmail()', () => {
    it('Positive Case - kirim email welcome kepala keluarga', async () => {
      (mailerMock.sendMail as any) = jest.fn().mockResolvedValue(undefined);

      const ok = await service.sendHeadOfHouseholdWelcomeEmail(registrationData as any);
      expect(ok).toBe(true);
      expect(mailerMock.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: registrationData.email,
          subject: 'Selamat Datang! Registrasi Berhasil',
          template: 'emailWelcome',
          context: expect.objectContaining({
            fullName: registrationData.fullName,
            uniqueCode: registrationData.uniqueCode,
            loginUrl: registrationData.loginUrl,
            propertyName: registrationData.propertyName,
            unitNumber: registrationData.unitNumber,
            year: expect.any(Number),
          }),
        }),
      );
    });

    it('Negative Case - gagal kirim → return false', async () => {
      (mailerMock.sendMail as any) = jest.fn().mockRejectedValue(new Error('smtp fail'));
      const ok = await service.sendHeadOfHouseholdWelcomeEmail(registrationData as any);
      expect(ok).toBe(false);
    });
  });

  // =========================================================
  // sendFamilyMemberVerificationEmail()
  // =========================================================
  describe('sendFamilyMemberVerificationEmail()', () => {
    it('Positive Case - kirim email verifikasi anggota keluarga', async () => {
      (mailerMock.sendMail as any) = jest.fn().mockResolvedValue(undefined);

      const ok = await service.sendFamilyMemberVerificationEmail(registrationData as any);
      expect(ok).toBe(true);
      expect(mailerMock.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: registrationData.email,
          subject: 'Verifikasi Registrasi Anggota Keluarga',
          template: 'emailVerification',
          context: expect.objectContaining({
            fullName: registrationData.fullName,
            verificationCode: registrationData.verificationCode,
            propertyName: registrationData.propertyName,
            isAdminDriven: registrationData.isAdminDriven,
            year: expect.any(Number),
          }),
        }),
      );
    });

    it('Negative Case - error kirim → return false', async () => {
      (mailerMock.sendMail as any) = jest.fn().mockRejectedValue(new Error('smtp fail'));
      const ok = await service.sendFamilyMemberVerificationEmail(registrationData as any);
      expect(ok).toBe(false);
    });
  });

  // =========================================================
  // sendFamilyMemberApprovalNotification()
  // =========================================================
  describe('sendFamilyMemberApprovalNotification()', () => {
    it('Positive Case - kirim notif persetujuan ke kepala keluarga', async () => {
      (mailerMock.sendMail as any) = jest.fn().mockResolvedValue(undefined);

      const ok = await service.sendFamilyMemberApprovalNotification(notifData as any);
      expect(ok).toBe(true);
      expect(mailerMock.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: notifData.headOfHouseholdEmail,
          subject: 'Persetujuan Diperlukan - Anggota Keluarga Baru',
          template: 'family-member-approval-notification',
          context: expect.objectContaining({
            headOfHouseholdName: notifData.headOfHouseholdName,
            familyMemberName: notifData.familyMemberName,
            familyMemberEmail: notifData.familyMemberEmail,
            uniqueCode: notifData.uniqueCode,
            actionUrl: notifData.actionUrl,
            year: expect.any(Number),
          }),
        }),
      );
    });

    it('Negative Case - error kirim → return false', async () => {
      (mailerMock.sendMail as any) = jest.fn().mockRejectedValue(new Error('smtp fail'));
      const ok = await service.sendFamilyMemberApprovalNotification(notifData as any);
      expect(ok).toBe(false);
    });
  });

  // =========================================================
  // sendFamilyMemberWelcomeEmail()
  // =========================================================
  describe('sendFamilyMemberWelcomeEmail()', () => {
    it('Positive Case - kirim email welcome anggota keluarga', async () => {
      (mailerMock.sendMail as any) = jest.fn().mockResolvedValue(undefined);

      const ok = await service.sendFamilyMemberWelcomeEmail(registrationData as any);
      expect(ok).toBe(true);
      expect(mailerMock.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: registrationData.email,
          subject: 'Selamat Datang! Registrasi Anggota Keluarga Berhasil',
          template: 'emailWelcome',
          context: expect.objectContaining({
            fullName: registrationData.fullName,
            uniqueCode: registrationData.uniqueCode,
            loginUrl: registrationData.loginUrl,
            propertyName: registrationData.propertyName,
            unitNumber: registrationData.unitNumber,
            year: expect.any(Number),
          }),
        }),
      );
    });

    it('Negative Case - error kirim → return false', async () => {
      (mailerMock.sendMail as any) = jest.fn().mockRejectedValue(new Error('smtp fail'));
      const ok = await service.sendFamilyMemberWelcomeEmail(registrationData as any);
      expect(ok).toBe(false);
    });
  });

  // =========================================================
  // sendAdminDrivenHeadOfHouseholdEmail()
  // =========================================================
  describe('sendAdminDrivenHeadOfHouseholdEmail()', () => {
    it('Positive Case - kirim email akun dibuat (head of household)', async () => {
      (mailerMock.sendMail as any) = jest.fn().mockResolvedValue(undefined);

      const ok = await service.sendAdminDrivenHeadOfHouseholdEmail(registrationData as any);
      expect(ok).toBe(true);
      expect(mailerMock.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: registrationData.email,
          subject: expect.stringContaining('Akun Anda Telah Dibuat'),
          template: 'admin-driven-head-household',
          context: expect.objectContaining({
            fullName: registrationData.fullName,
            verificationCode: registrationData.verificationCode,
            unitNumber: registrationData.unitNumber,
            propertyName: registrationData.propertyName,
            year: expect.any(Number),
          }),
        }),
      );
    });

    it('Negative Case - error kirim → return false', async () => {
      (mailerMock.sendMail as any) = jest.fn().mockRejectedValue(new Error('smtp fail'));
      const ok = await service.sendAdminDrivenHeadOfHouseholdEmail(registrationData as any);
      expect(ok).toBe(false);
    });
  });

  // =========================================================
  // sendAdminDrivenFamilyMemberEmail()
  // =========================================================
  describe('sendAdminDrivenFamilyMemberEmail()', () => {
    it('Positive Case - kirim email akun dibuat (family member)', async () => {
      (mailerMock.sendMail as any) = jest.fn().mockResolvedValue(undefined);

      const ok = await service.sendAdminDrivenFamilyMemberEmail(registrationData as any);
      expect(ok).toBe(true);
      expect(mailerMock.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: registrationData.email,
          subject: 'Akun Anggota Keluarga Telah Dibuat',
          template: 'admin-driven-family-member',
          context: expect.objectContaining({
            fullName: registrationData.fullName,
            verificationCode: registrationData.verificationCode,
            propertyName: registrationData.propertyName,
            year: expect.any(Number),
          }),
        }),
      );
    });

    it('Negative Case - error kirim → return false', async () => {
      (mailerMock.sendMail as any) = jest.fn().mockRejectedValue(new Error('smtp fail'));
      const ok = await service.sendAdminDrivenFamilyMemberEmail(registrationData as any);
      expect(ok).toBe(false);
    });
  });

  // =========================================================
  // sendFamilyMemberRejectionNotification()
  // =========================================================
  describe('sendFamilyMemberRejectionNotification()', () => {
    it('Positive Case - kirim email penolakan dengan reason custom', async () => {
      (mailerMock.sendMail as any) = jest.fn().mockResolvedValue(undefined);

      const ok = await service.sendFamilyMemberRejectionNotification(
        'dina@example.com',
        'Dina',
        'Pak Joko',
        'Dokumen kabur',
      );
      expect(ok).toBe(true);
      expect(mailerMock.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'dina@example.com',
          subject: 'Registrasi Ditolak',
          template: 'rejectApproval',
          context: expect.objectContaining({
            familyMemberName: 'Dina',
            headOfHouseholdName: 'Pak Joko',
            reason: 'Dokumen kabur',
            year: expect.any(Number),
          }),
        }),
      );
    });

    it('Positive Case - reason default jika tidak diberikan', async () => {
      (mailerMock.sendMail as any) = jest.fn().mockResolvedValue(undefined);

      await service.sendFamilyMemberRejectionNotification(
        'dina@example.com',
        'Dina',
        'Pak Joko',
      );
      expect(mailerMock.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            reason: 'Tidak memenuhi kriteria keluarga',
          }),
        }),
      );
    });

    it('Negative Case - error kirim → return false', async () => {
      (mailerMock.sendMail as any) = jest.fn().mockRejectedValue(new Error('smtp fail'));
      const ok = await service.sendFamilyMemberRejectionNotification(
        'dina@example.com',
        'Dina',
        'Pak Joko',
        'Apapun',
      );
      expect(ok).toBe(false);
    });
  });

  // =========================================================
  // sendDocumentApprovalNotification()
  // =========================================================
  describe('sendDocumentApprovalNotification()', () => {
    it('Positive Case - kirim email approval dokumen', async () => {
      (mailerMock.sendMail as any) = jest.fn().mockResolvedValue(undefined);

      const ok = await service.sendDocumentApprovalNotification(
        'andi@example.com',
        'Andi',
        'KTP',
      );
      expect(ok).toBe(true);
      expect(mailerMock.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'andi@example.com',
          subject: 'Dokumen KTP Telah Diverifikasi',
          template: 'document-approval',
          context: expect.objectContaining({
            applicantName: 'Andi',
            documentType: 'KTP',
            year: expect.any(Number),
          }),
        }),
      );
    });

    it('Negative Case - error kirim → return false', async () => {
      (mailerMock.sendMail as any) = jest.fn().mockRejectedValue(new Error('smtp fail'));
      const ok = await service.sendDocumentApprovalNotification(
        'andi@example.com',
        'Andi',
        'KTP',
      );
      expect(ok).toBe(false);
    });
  });

  // =========================================================
  // generateVerificationCode()
  // =========================================================
  describe('generateVerificationCode()', () => {
    it('Positive Case - menghasilkan string 6 digit', () => {
      const v = service.generateVerificationCode();
      expect(typeof v).toBe('string');
      expect(v).toMatch(/^\d{6}$/);
    });
  });

  // =========================================================
  // generateUniqueCode()
  // =========================================================
  describe('generateUniqueCode()', () => {
    it('Positive Case - format HH-YYYYMMDD-XXX', () => {
      const code = service.generateUniqueCode();
      expect(code).toMatch(/^HH-\d{8}-\d{3}$/);
    });

    it('Positive Case - dua pemanggilan menghasilkan kemungkinan nilai berbeda', () => {
      const a = service.generateUniqueCode();
      const b = service.generateUniqueCode();
      // tidak wajib berbeda, tapi probabilitas besar berbeda
      expect(a).not.toBe(b);
    });
  });
});
