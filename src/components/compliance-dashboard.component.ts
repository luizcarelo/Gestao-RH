import { Component, inject, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HrService } from '../services/hr.service';

@Component({
  selector: 'app-compliance-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      
      <!-- CARD 1: Security Risk Score -->
      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
        <h3 class="text-slate-500 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
          🛡️ Score de Segurança
        </h3>
        
        <div class="flex items-center gap-6">
          <!-- Circular Score using CSS Conic Gradient -->
          <div class="relative w-24 h-24 rounded-full flex items-center justify-center bg-slate-100 shadow-inner"
               [style.background]="'conic-gradient(' + getScoreColor() + ' ' + securityScore() + '%, #f1f5f9 0)'">
            <div class="absolute inset-2 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
              <span class="text-2xl font-bold" [style.color]="getScoreColor()">{{ securityScore() }}</span>
              <span class="text-[10px] text-slate-400 uppercase">Pontos</span>
            </div>
          </div>

          <div class="flex-1 space-y-2">
            <p class="text-sm font-medium text-slate-700">Status: 
              <span [style.color]="getScoreColor()" class="font-bold">{{ getScoreLabel() }}</span>
            </p>
            <div class="text-xs text-slate-500">
              {{ pendingCriticalLogs() }} incidentes críticos pendentes.
              @if (pendingCriticalLogs() > 0) { <span class="text-red-500 font-bold">Ação Necessária.</span> }
            </div>
            @if (securityScore() < 100) {
              <div class="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div class="h-full rounded-full transition-all duration-1000 ease-out" 
                     [style.width.%]="securityScore()" 
                     [style.background-color]="getScoreColor()"></div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- CARD 2: eSocial Transmission Health -->
      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <h3 class="text-slate-500 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
          🏛️ Saúde eSocial (S-1.2)
        </h3>
        
        <div class="space-y-4">
          <!-- Sent -->
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-green-700 font-medium">Aceitos / Processados</span>
              <span class="font-bold text-slate-700">{{ esocialStats().sent }}</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div class="bg-green-500 h-2 rounded-full transition-all duration-500" [style.width.%]="esocialStats().sentPercent"></div>
            </div>
          </div>

          <!-- Pending -->
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-blue-700 font-medium">Fila de Transmissão</span>
              <span class="font-bold text-slate-700">{{ esocialStats().pending }}</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div class="bg-blue-500 h-2 rounded-full transition-all duration-500" [style.width.%]="esocialStats().pendingPercent"></div>
            </div>
          </div>

          <!-- Errors -->
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-red-700 font-medium">Erros / Rejeições</span>
              <span class="font-bold text-slate-700">{{ esocialStats().errors }}</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div class="bg-red-500 h-2 rounded-full transition-all duration-500" [style.width.%]="esocialStats().errorPercent"></div>
            </div>
          </div>
        </div>
        
        <div class="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center">
           <span class="text-[10px] text-slate-400 font-mono">Ambiente: Produção</span>
           <span class="text-[10px] px-2 py-0.5 bg-green-50 text-green-700 rounded font-bold border border-green-100 flex items-center gap-1">
             <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Conectado
           </span>
        </div>
      </div>

      <!-- CARD 3: LGPD & Privacy -->
      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <h3 class="text-slate-500 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
          ⚖️ Privacidade (LGPD)
        </h3>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div class="text-2xl font-bold text-slate-800">{{ hrService.lgpdStats().consentCoverage }}%</div>
            <div class="text-[10px] text-slate-500 uppercase mt-1">Cobertura Termos</div>
          </div>
          <div class="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div class="text-2xl font-bold text-blue-600">{{ hrService.lgpdStats().activeDsr }}</div>
            <div class="text-[10px] text-slate-500 uppercase mt-1">Solicitações (DSR)</div>
          </div>
        </div>

        <div class="mt-4 space-y-2">
          <div class="flex items-center gap-2 text-xs text-slate-600">
             <span class="w-2 h-2 rounded-full" [class.bg-green-500]="hrService.lgpdStats().dataRetentionCompliant" [class.bg-red-500]="!hrService.lgpdStats().dataRetentionCompliant"></span>
             <span>Retenção de Dados: <strong>{{ hrService.lgpdStats().dataRetentionCompliant ? 'Conforme' : 'Irregular' }}</strong></span>
          </div>
          <div class="flex items-center gap-2 text-xs text-slate-600">
             <span class="w-2 h-2 rounded-full bg-slate-400"></span>
             <span>DPIA (Impacto): <strong class="text-slate-700">{{ hrService.lgpdStats().lastDpia | date:'dd/MM/yyyy' }}</strong></span>
          </div>
        </div>
      </div>

    </div>

    <!-- Security Feed Banner (Only if score < 100) -->
    @if (securityScore() < 100) {
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3 animate-pulse shadow-sm">
        <span class="text-2xl">🚨</span>
        <div class="flex-1">
          <h4 class="text-sm font-bold text-red-800">Atenção Necessária: Segurança e Compliance</h4>
          <p class="text-xs text-red-700 mt-1">
            Detectamos {{ pendingCriticalLogs() }} eventos críticos de segurança.
            @if (!hrService.systemConfig().requireBiometrics) {
              <span class="block mt-1">• A biometria facial está desativada (Risco de Fraude no Ponto).</span>
            }
          </p>
        </div>
        <button class="text-xs bg-white border border-red-300 text-red-700 px-3 py-1.5 rounded hover:bg-red-100 font-medium transition shadow-sm">
          Auditar Agora
        </button>
      </div>
    }
  `
})
export class ComplianceDashboardComponent {
  hrService = inject(HrService);

  // --- Computed Logistics ---

  // 1. Security Score Calculation
  pendingCriticalLogs = computed(() => {
    return this.hrService.auditLogs()
      .filter(l => l.status === 'PENDENTE' && (l.severity === 'CRITICO' || l.type === 'FRAUDE'))
      .length;
  });

  pendingHighLogs = computed(() => {
    return this.hrService.auditLogs()
      .filter(l => l.status === 'PENDENTE' && l.severity === 'ALTA')
      .length;
  });

  securityScore = computed(() => {
    let score = 100;
    // Penalize for critical pending issues
    score -= (this.pendingCriticalLogs() * 15);
    // Penalize for high severity issues
    score -= (this.pendingHighLogs() * 5);
    
    // Penalize if biometrics is disabled (Policy check)
    if (!this.hrService.systemConfig().requireBiometrics) {
      score -= 10;
    }

    return Math.max(0, score);
  });

  // 2. eSocial Stats
  esocialStats = computed(() => {
    const events = this.hrService.esocialQueue();
    const total = events.length || 1; // avoid division by zero
    
    const sent = events.filter(e => e.status === 'ENVIADO').length;
    const errors = events.filter(e => e.status === 'ERRO').length;
    const pending = events.filter(e => e.status === 'PENDENTE' || e.status === 'PROCESSANDO').length;

    return {
      sent,
      errors,
      pending,
      sentPercent: (sent / total) * 100,
      errorPercent: (errors / total) * 100,
      pendingPercent: (pending / total) * 100
    };
  });

  // Helpers for View
  getScoreColor() {
    const score = this.securityScore();
    if (score >= 90) return '#22c55e'; // Green-500
    if (score >= 70) return '#eab308'; // Yellow-500
    return '#ef4444'; // Red-500
  }

  getScoreLabel() {
    const score = this.securityScore();
    if (score >= 90) return 'Excelente';
    if (score >= 70) return 'Atenção';
    return 'Crítico';
  }
}