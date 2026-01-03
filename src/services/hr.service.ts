import { Injectable, signal, computed } from '@angular/core';

export interface Punch {
  id: string;
  type: 'ENTRADA' | 'SAIDA' | 'INTERVALO_SAIDA' | 'INTERVALO_RETORNO';
  timestamp: Date;
  location: string;
  synced: boolean;
  hash: string; // Portaria 671 compliance
  photo?: string; // Base64 selfie
  source: 'REP-P' | 'AJUSTE_MANUAL' | 'SISTEMA'; // Origin of the record
  justification?: string;
}

export interface Payslip {
  id: string;
  competencia: string;
  netValue: number;
  status: 'DISPONIVEL' | 'ASSINADO';
  signedAt?: Date;
  hash: string;
}

export interface EsocialEvent {
  code: string;
  description: string;
  status: 'PENDENTE' | 'ENVIADO' | 'ERRO' | 'PROCESSANDO';
  receipt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  type: 'FRAUDE' | 'SEGURANCA' | 'SISTEMA' | 'ACESSO';
  description: string;
  severity: 'CRITICO' | 'ALTA' | 'MEDIA' | 'BAIXA';
  status: 'PENDENTE' | 'TRATADO'; // Novo campo para gestão de incidentes
  handledAt?: Date;
  metadata?: any;
}

// --- Novas Entidades de Cadastro ---
export interface Company {
  id: string;
  name: string;
  cnpj: string;
}

export interface Department {
  id: string;
  name: string;
  costCenter: string;
}

export interface WorkShift {
  id: string;
  name: string; // ex: "Comercial 08-18"
  description: string; // ex: "Seg-Sex 08:00 as 18:00 - Int 1h12"
  type: '12x36' | 'FIXO' | 'FLEXIVEL';
}

// Rippling/Dayforce feature: Asset Management (IT + EPIs)
export interface Asset {
  id: string;
  type: 'NOTEBOOK' | 'CELULAR' | 'EPI_CALCADO' | 'EPI_CAPACETE' | 'TOKEN';
  name: string;
  serialNumber: string;
  deliveryDate: string; // Data de entrega (CA do EPI deve ser validado)
  status: 'EM_USO' | 'DEVOLVIDO' | 'DANIFICADO';
}

// Leapsome/HiBob feature: Performance & PDI
export interface PerformanceReview {
  lastReviewDate: string;
  rating: number; // 1-5
  goals: string[]; // Metas
  nextReviewDate: string;
}

export interface Employee {
  id: string;
  name: string;
  cpf: string;
  registration: string; // Matrícula eSocial
  email: string;
  phoneNumber?: string; // Telefone contato
  role: string;
  cbo?: string; // Classificação Brasileira de Ocupações
  companyId: string;
  departmentId: string;
  shiftId: string;
  admissionDate: string;
  status: 'ATIVO' | 'FERIAS' | 'AFASTADO' | 'DESLIGADO';
  // New Fields
  onboardingProgress: number; // 0-100% (BambooHR style)
  assets: Asset[];
  performance: PerformanceReview;
  salary: number; // Para cálculos de Analytics
  bankHoursBalance: number; // Saldo individual
  vacationBalance: number; // Dias de férias acumulados
  lastVacationDate?: string; // Fim das últimas férias
}

@Injectable({
  providedIn: 'root'
})
export class HrService {
  // Network State
  readonly isOnline = signal(true);
  
  // Security State
  readonly isLockedOut = signal(false);
  readonly lockoutEndTime = signal<Date | null>(null);
  
  // Sync Progress State
  readonly syncState = signal({
    isSyncing: false,
    total: 0,
    current: 0
  });

  // System Configuration (Admin Settings)
  readonly systemConfig = signal({
    requireBiometrics: false, // Default off, can be toggled
    allowOffline: true
  });

  // --- Cadastros Básicos (Simulação de DB) ---
  readonly companies = signal<Company[]>([
    { id: '1', name: 'Tech Solutions Ltda', cnpj: '12.345.678/0001-90' },
    { id: '2', name: 'Tech Inovação S.A.', cnpj: '98.765.432/0001-10' }
  ]);

  readonly departments = signal<Department[]>([
    { id: '1', name: 'Desenvolvimento', costCenter: 'CC-01' },
    { id: '2', name: 'Recursos Humanos', costCenter: 'CC-02' },
    { id: '3', name: 'Operações', costCenter: 'CC-03' }
  ]);

  readonly shifts = signal<WorkShift[]>([
    { id: '1', name: 'Geral (08:00 - 17:00)', description: 'Seg-Sex 08:00 às 17:00 (1h int)', type: 'FIXO' },
    { id: '2', name: 'Escala 12x36 Dia', description: 'Dia sim/Dia não 07:00 às 19:00', type: '12x36' },
    { id: '3', name: 'Flexível', description: 'Banco de Horas Livre', type: 'FLEXIVEL' }
  ]);

  readonly employees = signal<Employee[]>([
    { 
      id: '1', name: 'Carlos Silva', cpf: '123.456.789-00', registration: '0042', 
      email: 'carlos@tech.com', phoneNumber: '(11) 98888-1234', role: 'Dev Senior', cbo: '2124-05',
      companyId: '1', departmentId: '1', shiftId: '1', admissionDate: '2022-01-10', status: 'ATIVO',
      onboardingProgress: 100,
      salary: 12500,
      bankHoursBalance: 14.5,
      vacationBalance: 15,
      lastVacationDate: '2023-07-20',
      assets: [
        { id: 'a1', type: 'NOTEBOOK', name: 'MacBook Pro M2', serialNumber: 'MBP-2023-X', deliveryDate: '2023-01-10', status: 'EM_USO' },
        { id: 'a2', type: 'TOKEN', name: 'Yubikey Bio', serialNumber: 'YBK-999', deliveryDate: '2023-01-10', status: 'EM_USO' }
      ],
      performance: { lastReviewDate: '2023-12-01', rating: 4.8, goals: ['Liderar Migração Cloud', 'Mentorar Juniors'], nextReviewDate: '2024-06-01' }
    },
    { 
      id: '2', name: 'Ana Souza', cpf: '987.654.321-11', registration: '0055', 
      email: 'ana@tech.com', phoneNumber: '(21) 97777-5678', role: 'Analista RH', cbo: '2524-05',
      companyId: '1', departmentId: '2', shiftId: '1', admissionDate: '2023-05-15', status: 'FERIAS',
      onboardingProgress: 100,
      salary: 6500,
      bankHoursBalance: 2.0,
      vacationBalance: 0,
      lastVacationDate: '2024-05-20',
      assets: [
        { id: 'a3', type: 'NOTEBOOK', name: 'Dell Latitude', serialNumber: 'DLL-550', deliveryDate: '2023-05-15', status: 'EM_USO' }
      ],
      performance: { lastReviewDate: '2023-11-15', rating: 4.2, goals: ['Reduzir Turnover', 'Implementar PDI'], nextReviewDate: '2024-05-15' }
    },
    {
      id: '3', name: 'João Novato', cpf: '111.222.333-44', registration: '0060',
      email: 'joao@tech.com', phoneNumber: '(31) 96666-9999', role: 'Estagiário TI', cbo: '2124-20',
      companyId: '1', departmentId: '1', shiftId: '3', admissionDate: '2024-05-02', status: 'ATIVO',
      onboardingProgress: 40,
      salary: 1800,
      bankHoursBalance: 0,
      vacationBalance: 0,
      assets: [], // Ainda não recebeu equipamentos
      performance: { lastReviewDate: '-', rating: 0, goals: [], nextReviewDate: '2024-08-02' }
    }
  ]);

  // Current User (Session)
  readonly user = signal({
    name: 'Carlos Silva',
    role: 'Desenvolvedor Senior',
    cpf: '123.456.789-00',
    company: 'Tech Solutions Ltda',
    registration: '0042'
  });

  readonly punches = signal<Punch[]>([
    { id: '1', type: 'ENTRADA', timestamp: new Date(new Date().setHours(8, 0, 0)), location: 'Escritório SP (-23.55, -46.63)', synced: true, hash: 'a1b2c3d4', source: 'REP-P' },
    { id: '2', type: 'INTERVALO_SAIDA', timestamp: new Date(new Date().setHours(12, 0, 0)), location: 'Escritório SP (-23.55, -46.63)', synced: true, hash: 'e5f6g7h8', source: 'REP-P' },
    { id: '3', type: 'INTERVALO_RETORNO', timestamp: new Date(new Date().setHours(13, 15, 0)), location: 'Escritório SP (-23.55, -46.63)', synced: true, hash: 'i9j0k1l2', source: 'REP-P' },
  ]);

  readonly payslips = signal<Payslip[]>([
    { id: '101', competencia: '04/2024', netValue: 8450.00, status: 'ASSINADO', signedAt: new Date('2024-05-05'), hash: 'pdf_hash_123' },
    { id: '102', competencia: '05/2024', netValue: 8450.00, status: 'DISPONIVEL', hash: 'pdf_hash_456' },
  ]);

  readonly bankOfHours = signal({
    balance: 14.5, // hours
    limitDaily: 10,
    monthCredits: 4.5,
    monthDebits: 1.0,
    expiryDate: '30/11/2024' // CLT art. 59 (6 months)
  });

  readonly esocialQueue = signal<EsocialEvent[]>([
    { code: 'S-1200', description: 'Remuneração (Folha)', status: 'ENVIADO', receipt: '1.2.0000000000000000000' },
    { code: 'S-1210', description: 'Pagamentos', status: 'ENVIADO', receipt: '1.2.0000000000000000001' },
    { code: 'S-2240', description: 'Condições Ambientais (SST)', status: 'PENDENTE' },
    { code: 'S-2220', description: 'Monitoramento Saúde (ASO)', status: 'PROCESSANDO' },
  ]);

  // LGPD & Privacidade (Novos dados para o Dashboard)
  readonly lgpdStats = signal({
    consentCoverage: 98.5, // % de colaboradores com termos assinados
    activeDsr: 2, // Data Subject Requests (Ex: pedido de correção de dados)
    lastDpia: new Date('2024-01-15'), // Última análise de impacto
    dataRetentionCompliant: true, // Se a política de descarte está sendo seguida
    anonymizedRecords: 45 // Registros anonimizados de ex-funcionários
  });

  readonly auditLogs = signal<AuditLog[]>([]);

  constructor() {
    if (typeof window !== 'undefined') {
      // Initial status
      this.isOnline.set(navigator.onLine);

      // Listeners
      window.addEventListener('online', () => {
        this.isOnline.set(true);
        this.syncPendingPunches();
      });

      window.addEventListener('offline', () => {
        this.isOnline.set(false);
      });

      // Load persisted punches
      this.loadFromStorage();
    }
  }

  // Derived State (Analytics / Workday Style)
  readonly headcount = computed(() => this.employees().length);
  
  readonly monthlyPayrollCost = computed(() => {
    return this.employees().reduce((acc, emp) => acc + emp.salary, 0);
  });

  readonly turnoverRisk = computed(() => {
    // Workday Predictive Mock: Checks for overdue reviews or low ratings
    return this.employees().filter(e => e.performance.rating > 0 && e.performance.rating < 3).length;
  });

  readonly lastPunch = computed(() => {
    const p = this.punches();
    return p.length > 0 ? p[p.length - 1] : null;
  });

  readonly isShiftActive = computed(() => {
    const last = this.lastPunch();
    return last ? (last.type === 'ENTRADA' || last.type === 'INTERVALO_RETORNO') : false;
  });

  // Config Actions
  toggleBiometrics(required: boolean) {
    this.systemConfig.update(cfg => ({ ...cfg, requireBiometrics: required }));
  }

  // --- Employee Management Actions ---
  // Updated to allow flexibility on new fields
  addEmployee(employeeData: any) {
    const { performanceRating, ...baseData } = employeeData;
    
    const newEmp: Employee = {
      ...baseData,
      id: crypto.randomUUID(),
      assets: [],
      onboardingProgress: 10, // Starts at 10% (Registration done)
      // Map flat form data to nested object
      performance: { 
        lastReviewDate: '-', 
        rating: performanceRating || 0, 
        goals: [], 
        nextReviewDate: '-' 
      }
    };
    this.employees.update(list => [...list, newEmp]);
    this.logSystemAction('CADASTRO_FUNC', `Funcionário ${newEmp.name} cadastrado. Matrícula: ${newEmp.registration}`);
  }

  // LOGGING & SECURITY
  triggerSecurityLockout() {
    if (this.isLockedOut()) return;
    
    const durationMinutes = 5;
    const endTime = new Date(new Date().getTime() + durationMinutes * 60000);
    
    this.isLockedOut.set(true);
    this.lockoutEndTime.set(endTime);
    
    this.logFraudAttempt(
      `BLOQUEIO DE SEGURANÇA: Funcionalidade de ponto suspensa por ${durationMinutes} min devido a múltiplas falhas de biometria.`,
      { blockedUntil: endTime }
    );

    console.error('[SECURITY] User locked out until', endTime);

    // Auto unlock
    setTimeout(() => {
      this.isLockedOut.set(false);
      this.lockoutEndTime.set(null);
      this.logSystemAction('SEGURANCA', 'Bloqueio de ponto expirado. Funcionalidade restaurada.');
    }, durationMinutes * 60000);
  }

  logFraudAttempt(description: string, metadata: any = {}) {
    const newLog: AuditLog = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: 'FRAUDE',
      severity: 'CRITICO',
      status: 'PENDENTE',
      description,
      metadata
    };
    this.auditLogs.update(logs => [newLog, ...logs]);
    console.warn('[SECURITY AUDIT]', newLog);
  }

  private logSystemAction(type: string, description: string) {
    const newLog: AuditLog = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: 'SISTEMA',
      severity: 'MEDIA',
      status: 'PENDENTE',
      description,
      metadata: { action: type }
    };
    this.auditLogs.update(logs => [newLog, ...logs]);
  }

  // Action to resolve log (admin only)
  resolveAuditLog(id: string) {
    this.auditLogs.update(logs => logs.map(log => 
      log.id === id ? { ...log, status: 'TRATADO', handledAt: new Date() } : log
    ));
  }

  // Actions
  addPunch(type: Punch['type'], location: string, photo?: string) {
    // Check lockout before adding
    if (this.isLockedOut()) {
      console.warn('Tentativa de ponto bloqueada por segurança.');
      return;
    }

    const newPunch: Punch = {
      id: crypto.randomUUID(),
      type,
      timestamp: new Date(),
      location,
      synced: false,
      hash: crypto.randomUUID().substring(0, 16), // Simulating hash generation
      photo,
      source: 'REP-P'
    };

    // Update state and persist immediately
    this.punches.update(list => [...list, newPunch]);
    this.saveToStorage();

    // Try to sync if online
    if (this.isOnline()) {
      this.syncPendingPunches();
    }
  }

  signPayslip(id: string) {
    this.payslips.update(list => list.map(p => 
      p.id === id ? { ...p, status: 'ASSINADO', signedAt: new Date() } : p
    ));
  }

  // Sync Logic
  private processPunchSync(punch: Punch): Promise<void> {
    // Returns a promise to allow sequential processing
    return new Promise((resolve) => {
      // Simulate API network delay (faster than before for batch effect)
      setTimeout(() => {
        this.punches.update(list => list.map(p => 
          p.id === punch.id 
            ? { 
                ...p, 
                synced: true, 
                // If it was offline, we pretend server resolved location or accepted the offline coordinates
                location: p.location.includes('Offline') || p.location.includes('Pendente') 
                  ? 'Sincronizado (Localização Estimada)' 
                  : p.location 
              } 
            : p
        ));
        this.saveToStorage();
        resolve();
      }, 800);
    });
  }

  private async syncPendingPunches() {
    // 1. Identify pending punches and sort by OLDER first (FIFO)
    const pending = this.punches()
      .filter(p => !p.synced)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (pending.length === 0) return;

    // 2. Initialize Sync State
    console.log(`[Sync] Iniciando sincronização de ${pending.length} registros...`);
    this.syncState.set({
      isSyncing: true,
      total: pending.length,
      current: 0
    });

    // 3. Process Sequentially
    for (const punch of pending) {
      await this.processPunchSync(punch);
      this.syncState.update(state => ({
        ...state,
        current: state.current + 1
      }));
    }

    // 4. Cleanup State
    setTimeout(() => {
      this.syncState.set({ isSyncing: false, total: 0, current: 0 });
      console.log('[Sync] Sincronização concluída.');
    }, 1500); // Give user time to see "100%"
  }

  // Persistence
  private saveToStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rh_pro_punches', JSON.stringify(this.punches()));
    }
  }

  private loadFromStorage() {
    const stored = localStorage.getItem('rh_pro_punches');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Revive dates because JSON.stringify converts them to strings
        const revived = parsed.map((p: any) => ({
          ...p,
          timestamp: new Date(p.timestamp)
        }));
        
        if (revived.length >= this.punches().length) {
            this.punches.set(revived);
        } else {
            // Initial run or cleared storage, save the default mock data
            this.saveToStorage();
        }
      } catch (e) {
        console.error('Erro ao carregar marcações locais', e);
      }
    } else {
        // First run, persist mock data
        this.saveToStorage();
    }
  }
}