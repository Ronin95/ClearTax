import React from 'react';

export interface User {
    id: string;
    username: string;
    email: string;
    tax_number: string;
    available_amount: string;
    contributed_amount: string;
    role_id: number;
    company_name?: string;
}

export interface ProjectData {
    id: string;
    title: string;
    category: string;
    description: string;
    images: any[]; 
    files: any[];  
    address: string;
    contributionAmount: string | number;
    ownTaxes: boolean;
    status: string;
    created_at?: string;
    approvalCount?: number;
    hasApproved?: boolean;
    amount_raised?: number;
    target_funding?: number;
}

export interface StatusOption {
    name: string;
    color: string;
}

export interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

// Add this interface to the file
export interface CompletionData {
    summary: string;
    finalCost: string;
    completionDate: any;
    maintenanceNotes: string;
    rating: number;
    finalImages: any[];
    finalFiles: any[];
}

export interface ProjectListProps {
    projects: ProjectData[];
    showActions: boolean;
    isCommunityTab?: boolean;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    onApprove?: (id: string, comment: string, fundedAmount: number, files: File[]) => Promise<void>;
    onComplete?: (id: string) => void;
    onViewCompletion?: (id: string) => void; 
    onEditCompletion?: (id: string) => void; 
    onBid?: (id: string) => void;
    onUpdate?: (id: string) => void;
    getStatusColor: (status: string) => any;
    formatDate: (date?: string) => string;
    onViewBids?: (id: string) => void;
    onViewUpdates?: (id: string) => void;
    onVerifyCompletion?: (id: string) => void;
}

export interface SolidarityModalProps {
    open: boolean;
    onClose: () => void;
    debtStats: { number_of_people: number; amount_paid: number };
    availableTax: number;
    solidarityInput: string;
    setSolidarityInput: (val: string) => void;
    isSubmittingDebt: boolean;
    onSubmit: () => void;
}

export interface ProjectFormModalProps {
    open: boolean; onClose: () => void;
    projectData: ProjectData; setProjectData: (data: ProjectData) => void;
    editingProjectId: string | null; statusOptions: StatusOption[];
    availableTax: number; currentContribution: number; remainingTax: number;
    isLoaded: boolean; onSubmit: () => void;
}

export interface TaxSyncModalProps {
    open: boolean;
    onClose: () => void;
    user: User | null;
    isCheckingRis: boolean;
    risMessage: { type: 'success' | 'error', text: string } | null;
    risAvailable: number | null;
    onRisCheck: () => void;
    onSync: () => void;
}

export interface ProjectFilterBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedStatus: string | null;
    onStatusToggle: (status: string) => void;
    statusOptions: StatusOption[];
}

export interface Props {
    open: boolean;
    onClose: () => void;
    completionData: CompletionData;
    setCompletionData: (data: CompletionData) => void;
    onSubmit: () => void;
    readOnly?: boolean;
}
