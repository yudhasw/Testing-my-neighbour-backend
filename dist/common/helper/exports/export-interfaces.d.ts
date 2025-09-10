import * as puppeteer from 'puppeteer';
export interface ComplaintStatistic {
    category: string;
    _count: {
        id: number;
    };
}
export interface StatusStatistic {
    status: string;
    _count: {
        id: number;
    };
}
export interface UnitStatistic {
    totalResidents: number;
    totalUnits: number;
    unitsByStatus: StatusStatistic[];
}
export interface PaymentHistoryItem {
    paymentMethod: string;
    status: any;
    paymentDate: Date;
    amount: number;
    resident?: {
        user?: {
            fullName: string;
        };
    };
    bill?: {
        type: string;
        dueDate: Date;
    };
}
export interface ReportData {
    title: string;
    generatedDate: string;
    period: string;
    [key: string]: unknown;
}
export interface PdfOptions {
    format?: puppeteer.PaperFormat;
    printBackground?: boolean;
    margin?: {
        top?: string;
        bottom?: string;
        left?: string;
        right?: string;
    };
    [key: string]: unknown;
}
