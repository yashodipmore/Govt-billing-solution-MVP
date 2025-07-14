export const PRODUCT_SKUS = {
    // PDF packages
    PDF_10: 'com.govtbilling.pdf.10',
    PDF_25: 'com.govtbilling.pdf.25',
    PDF_50: 'com.govtbilling.pdf.50',
    PDF_100: 'com.govtbilling.pdf.100',
    
    // Special packages
    SPECIAL_10: 'com.govtbilling.special.10',
    SPECIAL_500: 'com.govtbilling.special.500',
    SPECIAL_1000: 'com.govtbilling.special.1000'
};

export interface ProductDetails {
    id: string;
    type: 'PDF' | 'SPECIAL' | 'OTHER';
    desc: string;
    price: number;
    units?: number;
}

export const PRODUCTS: { [key: string]: ProductDetails } = {
    [PRODUCT_SKUS.PDF_10]: {
        id: PRODUCT_SKUS.PDF_10,
        type: 'PDF',
        desc: '10 PDF Package',
        price: 99,
        units: 10
    },
    [PRODUCT_SKUS.PDF_25]: {
        id: PRODUCT_SKUS.PDF_25,
        type: 'PDF',
        desc: '25 PDF Package',
        price: 199,
        units: 25
    },
    [PRODUCT_SKUS.SPECIAL_10]: {
        id: PRODUCT_SKUS.SPECIAL_10,
        type: 'SPECIAL',
        desc: '10 Special Units',
        price: 49,
        units: 10
    },
    [PRODUCT_SKUS.SPECIAL_500]: {
        id: PRODUCT_SKUS.SPECIAL_500,
        type: 'SPECIAL',
        desc: '500 Special Units',
        price: 999,
        units: 500
    }
};
