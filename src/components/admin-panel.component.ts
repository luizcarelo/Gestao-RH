import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { HrService, Employee } from '../services/hr.service';
import { ComplianceDashboardComponent } from './compliance-dashboard.component'; // Import new component
// Importando biblioteca externa definida no importmap
import { cpf } from 'cpf-cnpj-validator';

// --- Custom CPF Validator usando biblioteca externa ---
export function cpfLibValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null; // Validação 'required' cuida do vazio

    // A biblioteca cpf-cnpj-validator lida automaticamente com formatação (pontos/traços)
    // .isValid retorna boolean verificando dígitos verificadores e formato
    const isValid = cpf.isValid(value);

    return isValid ? null : { invalidCpf: true };
  };
}

@Component({
  selector: 'app-admin-panel',
  imports: [CommonModule, DatePipe, ReactiveFormsModule, ComplianceDashboardComponent], // Add to imports
  template: `
    <div class="space-y-6">
      <!-- Top Navigation Tabs -->
      <div class="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit overflow-x-auto">
        <button 
          (click)="activeTab.set('compliance')"
          class="px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap"
          [class.bg-white]="activeTab() === 'compliance'"
          [class.text-blue-600]="activeTab() === 'compliance'"
          [class.shadow-sm]="activeTab() === 'compliance'"
          [class.text-slate-500]="activeTab() !== 'compliance'">
          🛡️ Compliance
        </button>
        <button 
          (click)="activeTab.set('employees')"
          class="px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap"
          [class.bg-white]="activeTab() === 'employees'"
          [class.text-blue-600]="activeTab() === 'employees'"
          [class.shadow-sm]="activeTab() === 'employees'"
          [class.text-slate-500]="activeTab() !== 'employees'">
          👥 Pessoas & Onboarding
        </button>
        <button 
          (click)="activeTab.set('assets')"
          class="px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap"
          [class.bg-white]="activeTab() === 'assets'"
          [class.text-blue-600]="activeTab() === 'assets'"
          [class.shadow-sm]="activeTab() === 'assets'"
          [class.text-slate-500]="activeTab() !== 'assets'">
          💻 Ativos & IT (Rippling)
        </button>
      </div>

      <!-- TAB: COMPLIANCE (Updated with New Dashboard) -->
      @if (activeTab() === 'compliance') {
        <div class="space-y-8 animate-fade-in">
          <!-- Header -->
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 class="text-2xl font-bold text-slate-800">Painel de Governança</h2>
              <p class="text-slate-500 text-sm">Auditoria, LGPD e Configurações do Sistema</p>
            </div>
            <div class="flex gap-3">
              <button class="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition flex items-center gap-2">
                <span>📥</span> Exportar Logs
              </button>
            </div>
          </div>

          <!-- NEW: Visual Dashboard Component -->
          <app-compliance-dashboard />

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Audit Log Table -->
            <div class="lg:col-span-2 space-y-4">
              <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="p-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-700 flex justify-between items-center">
                  <span>Trilha de Auditoria</span>
                  <span class="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">Últimos eventos</span>
                </div>
                @if (hrService.auditLogs().length === 0) {
                  <div class="p-12 text-center text-slate-400">
                    <p class="text-4xl mb-4">📝</p>
                    <p>Nenhum evento registrado.</p>
                  </div>
                } @else {
                  <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                      <thead class="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th class="px-4 py-3 font-semibold text-slate-500">Data/Hora</th>
                          <th class="px-4 py-3 font-semibold text-slate-500">Tipo</th>
                          <th class="px-4 py-3 font-semibold text-slate-500">Descrição</th>
                          <th class="px-4 py-3 font-semibold text-slate-500 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100">
                        @for (log of hrService.auditLogs(); track log.id) {
                          <tr class="hover:bg-slate-50 transition-colors" [class.bg-red-50]="log.status === 'PENDENTE' && log.type === 'FRAUDE'">
                            <td class="px-4 py-3 font-mono text-slate-600 text-xs whitespace-nowrap">
                              {{ log.timestamp | date:'dd/MM HH:mm' }}
                            </td>
                            <td class="px-4 py-3">
                              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide"
                                [class.bg-red-100]="log.type === 'FRAUDE'"
                                [class.text-red-700]="log.type === 'FRAUDE'"
                                [class.bg-blue-100]="log.type !== 'FRAUDE'"
                                [class.text-blue-700]="log.type !== 'FRAUDE'">
                                {{ log.type }}
                              </span>
                            </td>
                            <td class="px-4 py-3 text-slate-800 text-xs">
                              {{ log.description }}
                            </td>
                            <td class="px-4 py-3 text-right">
                              @if (log.status === 'PENDENTE') {
                                <button (click)="hrService.resolveAuditLog(log.id)"
                                  class="text-xs font-medium px-2 py-1 bg-white border border-slate-300 rounded shadow-sm hover:bg-slate-50 hover:text-blue-600 transition flex items-center gap-1 ml-auto">
                                  <span>⬜</span> Marcar Tratado
                                </button>
                              } @else {
                                <div class="text-xs text-green-600 font-medium flex items-center justify-end gap-1">
                                  <span>✅</span> Tratado
                                </div>
                              }
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                }
              </div>
            </div>

            <!-- Settings -->
            <div class="space-y-6">
              <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 class="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Configurações</h3>
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="text-sm font-medium text-slate-700">Biometria Facial</div>
                      <div class="text-xs text-slate-500">Exigir teste de vida</div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" [checked]="hrService.systemConfig().requireBiometrics" 
                             (change)="toggleBiometrics($event)" class="sr-only peer">
                      <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- TAB: EMPLOYEES (Enhanced with Onboarding/BambooHR) -->
      @if (activeTab() === 'employees') {
        <div class="space-y-6 animate-fade-in">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 class="text-2xl font-bold text-slate-800">Cadastro de Colaboradores</h2>
              <p class="text-slate-500 text-sm">Gerencie vínculos, jornadas e alocações (eSocial S-2200)</p>
            </div>
            
            <div class="flex items-center gap-3 w-full md:w-auto">
              <!-- Search Bar -->
              <div class="relative flex-1 md:w-64">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span class="text-slate-400">🔍</span>
                </div>
                <input 
                  type="text" 
                  [value]="searchQuery()"
                  (input)="updateSearch($event)"
                  class="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:placeholder-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out" 
                  placeholder="Buscar nome, matrícula ou cargo..."
                >
              </div>

              <button (click)="openModal()" 
                class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2 shadow-sm whitespace-nowrap">
                <span>➕</span> Novo
              </button>
            </div>
          </div>

          <!-- Employee List -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm">
                <thead class="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>
                    <th class="px-6 py-4">Nome / Cargo</th>
                    <th class="px-6 py-4">Onboarding</th>
                    <th class="px-6 py-4">Empresa / Setor</th>
                    <th class="px-6 py-4">Jornada</th>
                    <th class="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (emp of filteredEmployees(); track emp.id) {
                    <tr class="hover:bg-slate-50 transition-colors group cursor-pointer">
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                           <div class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                             {{ emp.name.charAt(0) }}
                           </div>
                           <div>
                             <div class="font-medium text-slate-900">{{ emp.name }}</div>
                             <div class="text-xs text-slate-500">{{ emp.role }}</div>
                             @if (emp.cbo) {
                               <div class="text-[10px] text-slate-400 font-mono mt-0.5">CBO: {{ emp.cbo }}</div>
                             }
                           </div>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <!-- BambooHR Style Onboarding Bar -->
                        <div class="w-32">
                          <div class="flex justify-between text-[10px] text-slate-500 mb-1">
                            <span>Progresso</span>
                            <span class="font-bold">{{ emp.onboardingProgress }}%</span>
                          </div>
                          <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div class="h-full rounded-full transition-all duration-500"
                              [class.bg-green-500]="emp.onboardingProgress === 100"
                              [class.bg-blue-500]="emp.onboardingProgress < 100 && emp.onboardingProgress > 20"
                              [class.bg-amber-500]="emp.onboardingProgress <= 20"
                              [style.width.%]="emp.onboardingProgress"></div>
                          </div>
                          @if(emp.onboardingProgress < 100) {
                            <div class="text-[10px] text-blue-600 mt-1">
                              @if(emp.onboardingProgress <= 20) { 📄 Docs Pendentes }
                              @else if(emp.onboardingProgress <= 60) { 🏥 Exame ASO }
                              @else { 🎓 Integração }
                            </div>
                          }
                        </div>
                      </td>
                      <td class="px-6 py-4">
                         <div class="text-slate-900">{{ getCompanyName(emp.companyId) }}</div>
                         <div class="text-xs text-slate-500">{{ getDeptName(emp.departmentId) }}</div>
                      </td>
                      <td class="px-6 py-4">
                         <span class="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-xs font-medium text-slate-600 border border-slate-200">
                           ⏰ {{ getShiftName(emp.shiftId) }}
                         </span>
                      </td>
                      <td class="px-6 py-4">
                        @switch (emp.status) {
                          @case ('ATIVO') { <span class="text-green-700 bg-green-50 px-2 py-1 rounded-full text-xs font-bold border border-green-200">Ativo</span> }
                          @case ('FERIAS') { <span class="text-blue-700 bg-blue-50 px-2 py-1 rounded-full text-xs font-bold border border-blue-200">Férias</span> }
                          @case ('AFASTADO') { <span class="text-amber-700 bg-amber-50 px-2 py-1 rounded-full text-xs font-bold border border-amber-200">Afastado</span> }
                          @default { <span class="text-slate-500 text-xs">{{ emp.status }}</span> }
                        }
                      </td>
                    </tr>
                  }

                  @if (filteredEmployees().length === 0) {
                    <tr>
                      <td colspan="5" class="px-6 py-12 text-center text-slate-400">
                        <p class="text-2xl mb-2">🔍</p>
                        <p>Nenhum colaborador encontrado para "<span class="font-medium text-slate-600">{{ searchQuery() }}</span>"</p>
                        <button (click)="searchQuery.set('')" class="mt-2 text-blue-600 text-xs hover:underline">Limpar busca</button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

      <!-- TAB: ASSETS (Rippling Style) -->
      @if (activeTab() === 'assets') {
        <div class="space-y-6 animate-fade-in">
           <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 class="text-2xl font-bold text-slate-800">Gestão de Ativos & IT</h2>
              <p class="text-slate-500 text-sm">Inventário de Notebooks, Celulares e EPIs (NR-6) entregues.</p>
            </div>
            <div class="flex gap-2">
              <button class="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition flex items-center gap-2">
                <span>📦</span> Atribuir Equipamento
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            @for (emp of hrService.employees(); track emp.id) {
               <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                  <div class="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                    <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                      {{ emp.name.charAt(0) }}
                    </div>
                    <div>
                      <div class="font-bold text-slate-800">{{ emp.name }}</div>
                      <div class="text-xs text-slate-500">{{ emp.role }}</div>
                    </div>
                  </div>

                  <div class="space-y-3">
                    <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Ativos em Posse</div>
                    @if (emp.assets.length === 0) {
                      <div class="text-sm text-slate-400 italic bg-slate-50 p-2 rounded text-center">Nenhum equipamento vinculado</div>
                    } @else {
                      <ul class="space-y-2">
                        @for (asset of emp.assets; track asset.id) {
                          <li class="flex items-center justify-between text-sm bg-slate-50 p-2 rounded border border-slate-100">
                             <div class="flex items-center gap-2">
                               @switch (asset.type) {
                                 @case ('NOTEBOOK') { <span>💻</span> }
                                 @case ('CELULAR') { <span>📱</span> }
                                 @case ('TOKEN') { <span>🔑</span> }
                                 @default { <span>🛡️</span> }
                               }
                               <span class="font-medium text-slate-700">{{ asset.name }}</span>
                             </div>
                             <span class="text-[10px] bg-green-100 text-green-700 px-1.5 rounded font-medium">Em Uso</span>
                          </li>
                        }
                      </ul>
                    }
                    
                    <!-- Termo de responsabilidade alert -->
                    @if (emp.assets.length > 0) {
                       <div class="mt-4 flex items-center gap-2 text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-100 cursor-pointer hover:bg-blue-100 transition">
                         <span>📝</span> Ver Termo de Responsabilidade
                       </div>
                    }
                  </div>
               </div>
            }
          </div>
        </div>
      }
    </div>

    <!-- Modal: Cadastro de Funcionário -->
    @if (isModalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div>
              <h3 class="font-bold text-lg text-slate-800">Novo Colaborador</h3>
              <p class="text-xs text-slate-500">Preencha os dados para admissão eSocial</p>
            </div>
            <button (click)="closeModal()" class="text-slate-400 hover:text-red-500 text-xl font-bold">✕</button>
          </div>

          <!-- Modal Body (Form) -->
          <div class="p-6 overflow-y-auto">
            <form [formGroup]="empForm" (ngSubmit)="submitEmployee()" class="space-y-6">
              
              <!-- Section 1: Pessoal -->
              <div>
                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Dados Pessoais</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label class="text-sm font-medium text-slate-700">Nome Completo</label>
                    <input formControlName="name" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="Ex: Maria Silva">
                  </div>
                  <div class="space-y-1">
                    <label class="text-sm font-medium text-slate-700">CPF</label>
                    <!-- Formatting on blur to fix mask -->
                    <input formControlName="cpf" type="text" maxlength="14" 
                           (blur)="formatCpf()"
                           class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                           placeholder="000.000.000-00">
                    <!-- Real-time CPF Validation Feedback -->
                    @if (empForm.get('cpf')?.hasError('invalidCpf') && empForm.get('cpf')?.touched) {
                      <div class="text-[10px] text-red-500 mt-0.5 flex items-center gap-1">
                        <span>⚠️</span> CPF inválido (Verificado via biblioteca externa)
                      </div>
                    } @else if (empForm.get('cpf')?.valid && empForm.get('cpf')?.value) {
                      <div class="text-[10px] text-green-600 mt-0.5 flex items-center gap-1">
                        <span>✅</span> CPF Válido
                      </div>
                    }
                  </div>
                  <div class="space-y-1">
                    <label class="text-sm font-medium text-slate-700">Email Corporativo</label>
                    <input formControlName="email" type="email" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="nome@empresa.com">
                  </div>
                  <div class="space-y-1">
                    <label class="text-sm font-medium text-slate-700">Telefone / Celular</label>
                    <input formControlName="phoneNumber" type="tel" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="(00) 00000-0000">
                    @if (empForm.get('phoneNumber')?.invalid && empForm.get('phoneNumber')?.touched) {
                      <div class="text-[10px] text-red-500 mt-0.5">Formato inválido. Use (XX) 9XXXX-XXXX</div>
                    }
                  </div>
                </div>
              </div>

              <!-- Section 2: Vínculo -->
              <div>
                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pt-4 border-t border-slate-100">Contrato & Lotação</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div class="space-y-1">
                    <label class="text-sm font-medium text-slate-700">Empresa (Empregador)</label>
                    <select formControlName="companyId" class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
                      @for (c of hrService.companies(); track c.id) {
                        <option [value]="c.id">{{ c.name }}</option>
                      }
                    </select>
                  </div>
                  <div class="space-y-1">
                    <label class="text-sm font-medium text-slate-700">Departamento</label>
                    <select formControlName="departmentId" class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
                      @for (d of hrService.departments(); track d.id) {
                        <option [value]="d.id">{{ d.name }}</option>
                      }
                    </select>
                  </div>
                  <div class="space-y-1">
                    <label class="text-sm font-medium text-slate-700">Cargo</label>
                    <input formControlName="role" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="Ex: Analista Financeiro">
                  </div>
                  <div class="space-y-1">
                    <label class="text-sm font-medium text-slate-700">CBO (Classificação Brasileira)</label>
                    <input formControlName="cbo" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: 2124-05">
                    <!-- Error Feedback -->
                    @if (empForm.get('cbo')?.touched && empForm.get('cbo')?.invalid) {
                      <div class="text-[10px] text-red-500 mt-0.5">
                        @if (empForm.get('cbo')?.hasError('required')) {
                          Obrigatório.
                        } @else if (empForm.get('cbo')?.hasError('pattern')) {
                          Apenas números, ponto ou traço.
                        } @else if (empForm.get('cbo')?.hasError('minlength') || empForm.get('cbo')?.hasError('maxlength')) {
                          Deve ter entre 6 e 10 caracteres.
                        }
                      </div>
                    }
                  </div>
                  <div class="space-y-1">
                    <label class="text-sm font-medium text-slate-700">Matrícula (eSocial)</label>
                    <input formControlName="registration" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="0000">
                  </div>
                   <div class="space-y-1">
                    <label class="text-sm font-medium text-slate-700">Data de Admissão</label>
                    <input formControlName="admissionDate" type="date" class="w-full px-3 py-2 border border-slate-300 rounded-lg">
                  </div>
                   <div class="space-y-1">
                    <label class="text-sm font-medium text-slate-700">Jornada de Trabalho</label>
                    <select formControlName="shiftId" class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
                       @for (s of hrService.shifts(); track s.id) {
                        <option [value]="s.id">{{ s.name }}</option>
                      }
                    </select>
                  </div>
                </div>
              </div>

              <!-- Section 3: Gestão & Remuneração (NEW) -->
              <div>
                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pt-4 border-t border-slate-100">Gestão & Remuneração</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label class="text-sm font-medium text-slate-700">Salário Base (R$)</label>
                    <input formControlName="salary" type="number" class="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="0.00">
                  </div>
                  <div class="space-y-1">
                    <label class="text-sm font-medium text-slate-700">Avaliação Desempenho (Inicial)</label>
                    <select formControlName="performanceRating" class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
                      <option [value]="0">Sem avaliação</option>
                      <option [value]="1">1 - Abaixo</option>
                      <option [value]="3">3 - Esperado</option>
                      <option [value]="5">5 - Acima</option>
                    </select>
                  </div>
                  <div class="space-y-1">
                    <label class="text-sm font-medium text-slate-700">Saldo Inicial Banco de Horas</label>
                    <input formControlName="bankHoursBalance" type="number" step="0.5" class="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="0.0">
                  </div>
                  <div class="space-y-1">
                    <label class="text-sm font-medium text-slate-700">Saldo de Férias (Dias)</label>
                    <input formControlName="vacationBalance" type="number" class="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="0">
                  </div>
                  <div class="space-y-1">
                    <label class="text-sm font-medium text-slate-700">Últimas Férias (Data Fim)</label>
                    <input formControlName="lastVacationDate" type="date" class="w-full px-3 py-2 border border-slate-300 rounded-lg">
                  </div>
                </div>
              </div>

            </form>
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
            <button (click)="closeModal()" class="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition">Cancelar</button>
            <button (click)="submitEmployee()" 
                    [disabled]="empForm.invalid"
                    class="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
              Salvar Cadastro
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AdminPanelComponent {
  hrService = inject(HrService);
  fb: FormBuilder = inject(FormBuilder);
  
  activeTab = signal<'compliance' | 'employees' | 'assets'>('compliance');
  isModalOpen = signal(false);
  
  // Computed para contar logs pendentes
  pendingLogsCount = computed(() => {
    return this.hrService.auditLogs().filter(log => log.status === 'PENDENTE').length;
  });

  // Search State
  searchQuery = signal('');
  
  filteredEmployees = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const employees = this.hrService.employees();
    
    if (!query) return employees;
    
    return employees.filter(emp => 
      emp.name.toLowerCase().includes(query) ||
      emp.role.toLowerCase().includes(query) ||
      emp.registration.toLowerCase().includes(query)
    );
  });

  // Form Definition
  empForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    // CPF Validator replaces custom one with Library one
    cpf: ['', [Validators.required, cpfLibValidator()]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^(\(?\d{2}\)?\s?)?(\d{4,5}[-\s]?\d{4})$/)]],
    role: ['', Validators.required],
    // NEW Field for eSocial/Compliance
    cbo: ['', [
      Validators.required, 
      Validators.pattern(/^[0-9.-]+$/),
      Validators.minLength(6),
      Validators.maxLength(10)
    ]],
    registration: ['', Validators.required],
    companyId: ['1', Validators.required], 
    departmentId: ['1', Validators.required],
    shiftId: ['1', Validators.required],
    admissionDate: [new Date().toISOString().split('T')[0], Validators.required],
    status: ['ATIVO'],
    salary: [3000, Validators.required],
    bankHoursBalance: [0],
    vacationBalance: [0],
    performanceRating: [3],
    lastVacationDate: ['']
  });

  toggleBiometrics(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    this.hrService.toggleBiometrics(checked);
  }
  
  updateSearch(e: Event) {
    const target = e.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  // Format CPF on Blur using library
  formatCpf() {
    const control = this.empForm.get('cpf');
    if (control?.value) {
      // Formats to XXX.XXX.XXX-XX automatically
      const formatted = cpf.format(control.value);
      control.setValue(formatted, { emitEvent: false });
    }
  }

  // Helper Methods for Display
  getCompanyName(id: string) { return this.hrService.companies().find(c => c.id === id)?.name || id; }
  getDeptName(id: string) { return this.hrService.departments().find(d => d.id === id)?.name || id; }
  getShiftName(id: string) { return this.hrService.shifts().find(s => s.id === id)?.name || id; }

  // Modal Actions
  openModal() {
    this.empForm.reset({
      companyId: '1', departmentId: '1', shiftId: '1', 
      admissionDate: new Date().toISOString().split('T')[0],
      status: 'ATIVO',
      salary: 3000,
      bankHoursBalance: 0,
      vacationBalance: 0,
      performanceRating: 0,
      lastVacationDate: '',
      phoneNumber: '',
      cbo: ''
    });
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  submitEmployee() {
    if (this.empForm.valid) {
      this.hrService.addEmployee(this.empForm.value);
      this.closeModal();
    }
  }
}