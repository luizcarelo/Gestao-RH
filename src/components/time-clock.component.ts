import { Component, inject, signal, computed, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HrService, Punch } from '../services/hr.service';

@Component({
  selector: 'app-time-clock',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="space-y-6 pb-20 relative">
      <!-- Sync Progress Floating Toast -->
      @if (hrService.syncState().isSyncing) {
        <div class="fixed top-24 right-4 z-40 bg-white rounded-lg shadow-xl border border-blue-100 p-4 w-72 animate-slide-in">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-bold text-blue-800 flex items-center gap-2">
              <span class="animate-spin text-lg">🔄</span> Sincronizando...
            </span>
            <span class="text-xs font-mono text-blue-600">
              {{ hrService.syncState().current }} / {{ hrService.syncState().total }}
            </span>
          </div>
          <div class="w-full bg-blue-100 rounded-full h-2 overflow-hidden">
            <div class="bg-blue-600 h-full transition-all duration-300 ease-out"
                 [style.width.%]="(hrService.syncState().current / hrService.syncState().total) * 100">
            </div>
          </div>
          <p class="text-[10px] text-blue-400 mt-2 text-center">Enviando marcações offline para a nuvem.</p>
        </div>
      }

      <!-- Header -->
      <div class="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Registro de Ponto (REP-P)</h2>
          <p class="text-slate-500 text-sm mt-1">Conforme Portaria MTP 671/2021</p>
        </div>
        <div class="text-right">
          <div class="text-3xl font-mono font-bold text-blue-600 tracking-wider">{{ currentTime() | date:'HH:mm:ss' }}</div>
          <div class="text-slate-400 text-sm">{{ currentTime() | date:'EEEE, d MMMM y' }}</div>
        </div>
      </div>

      <!-- Security Lockout Banner -->
      @if (hrService.isLockedOut()) {
        <div class="bg-red-50 border-l-4 border-red-600 p-6 rounded-r shadow-lg animate-fade-in mb-6">
          <div class="flex items-center gap-4">
            <div class="bg-red-100 p-3 rounded-full text-red-600">
              <span class="text-3xl">🚫</span>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-red-800 uppercase tracking-wide">Acesso Bloqueado Temporariamente</h3>
              <p class="text-red-700 mt-1">
                Detectamos múltiplas falhas de autenticação biométrica (Anti-Fraud Protection).
              </p>
              <div class="mt-3 flex items-center gap-2 text-sm font-medium text-red-800 bg-red-100/50 p-2 rounded w-fit">
                <span>⏱️ Liberação prevista:</span>
                <span class="font-mono text-lg">{{ hrService.lockoutEndTime() | date:'HH:mm' }}</span>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Offline Warning -->
      @if (!hrService.isOnline() && !hrService.isLockedOut()) {
        <div class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r shadow-sm animate-fade-in">
          <div class="flex items-start gap-3">
            <span class="text-2xl">📡</span>
            <div>
              <h3 class="font-bold text-amber-800">Você está offline</h3>
              <p class="text-sm text-amber-700">As marcações serão salvas no seu dispositivo e sincronizadas automaticamente quando a conexão retornar. O registro legal (hash) será gerado localmente.</p>
            </div>
          </div>
        </div>
      }

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Action Area -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white p-8 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center min-h-[400px] relative">
            
            @if (hrService.isLockedOut()) {
              <div class="absolute inset-0 bg-slate-50/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                 <div class="text-center p-8">
                   <span class="text-5xl opacity-50">🔒</span>
                   <p class="mt-4 text-slate-500 font-bold">Funcionalidade suspensa.</p>
                 </div>
              </div>
            }

            @if (loadingLocation()) {
              <div class="animate-pulse flex flex-col items-center gap-4">
                <div class="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="animate-spin text-2xl">🌍</span>
                </div>
                <p class="text-slate-500 font-medium">Obtendo geolocalização segura...</p>
              </div>
            } @else {
              <div class="w-full max-w-md space-y-8" [class.opacity-20]="hrService.isLockedOut()">
                <div class="text-center">
                   @if (hrService.isOnline()) {
                    <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-200 mb-4">
                      <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      Geolocalização Ativa
                    </span>
                  } @else {
                    <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200 mb-4">
                      <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                      GPS Pendente (Offline)
                    </span>
                  }

                  @if (hrService.systemConfig().requireBiometrics) {
                    <span class="ml-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200 mb-4">
                      <span>📸</span> Biometria Obrigatória
                    </span>
                  }
                  
                  <h3 class="text-lg font-medium text-slate-700 mb-2">Selecione o tipo de marcação</h3>
                  
                  <div class="grid grid-cols-2 gap-4">
                    <button (click)="initiatePunch('ENTRADA')" 
                      [disabled]="hrService.isShiftActive() || hrService.isLockedOut()"
                      class="p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-2 group"
                      [class.border-slate-100]="hrService.isShiftActive()"
                      [class.bg-slate-50]="hrService.isShiftActive()"
                      [class.opacity-50]="hrService.isShiftActive()"
                      [class.border-blue-100]="!hrService.isShiftActive()"
                      [class.bg-blue-50]="!hrService.isShiftActive()"
                      [class.hover:border-blue-500]="!hrService.isShiftActive()">
                      <span class="text-3xl">☀️</span>
                      <span class="font-bold text-slate-700">Início Expediente</span>
                    </button>

                    <button (click)="initiatePunch('SAIDA')"
                      [disabled]="!hrService.isShiftActive() || hrService.isLockedOut()"
                      class="p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-2 group"
                      [class.border-slate-100]="!hrService.isShiftActive()"
                      [class.bg-slate-50]="!hrService.isShiftActive()"
                      [class.opacity-50]="!hrService.isShiftActive()"
                      [class.border-red-100]="hrService.isShiftActive()"
                      [class.bg-red-50]="hrService.isShiftActive()"
                      [class.hover:border-red-500]="hrService.isShiftActive()">
                      <span class="text-3xl">🌙</span>
                      <span class="font-bold text-slate-700">Fim Expediente</span>
                    </button>

                    <button (click)="initiatePunch('INTERVALO_SAIDA')"
                      [disabled]="!hrService.isShiftActive() || hrService.isLockedOut()"
                      class="p-4 rounded-xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50 transition-all flex flex-col items-center gap-1 opacity-90 disabled:opacity-40">
                      <span class="text-xl">🍽️</span>
                      <span class="font-medium text-sm text-slate-600">Saída Almoço</span>
                    </button>

                    <button (click)="initiatePunch('INTERVALO_RETORNO')"
                      [disabled]="hrService.isShiftActive() || hrService.isLockedOut()"
                      class="p-4 rounded-xl border border-slate-200 hover:border-green-400 hover:bg-green-50 transition-all flex flex-col items-center gap-1 opacity-90 disabled:opacity-40">
                      <span class="text-xl">🔙</span>
                      <span class="font-medium text-sm text-slate-600">Volta Almoço</span>
                    </button>
                  </div>
                </div>

                <div class="text-center text-xs text-slate-400">
                  <p>IP: {{ hrService.isOnline() ? '200.189.x.x' : 'Offline' }} • Hash antifraude ativo</p>
                  <p class="mt-1">Ao marcar, você declara ciência da veracidade desta informação.</p>
                </div>
              </div>
            }
          </div>

          <!-- Daily Mirror (Espelho de Ponto) -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div class="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
               <h3 class="font-bold text-slate-800 flex items-center gap-2">
                 <span>📋</span> Espelho de Ponto (Hoje)
               </h3>
               
               <div class="flex items-center gap-4 text-xs font-medium">
                  <div class="text-slate-500">
                    Previsão: <span class="text-slate-800">8h00</span>
                  </div>
                  <div class="px-3 py-1 rounded-full"
                       [class.bg-slate-100]="dailyTotal().hours === 0"
                       [class.bg-blue-100]="dailyTotal().hours > 0 && dailyTotal().hours <= 8"
                       [class.text-blue-700]="dailyTotal().hours > 0 && dailyTotal().hours <= 8"
                       [class.bg-orange-100]="dailyTotal().hours > 8"
                       [class.text-orange-700]="dailyTotal().hours > 8">
                     Trabalhado: {{ dailyTotal().text }}
                  </div>
               </div>
             </div>

             <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                   <thead class="bg-white border-b border-slate-100 text-xs uppercase text-slate-500">
                      <tr>
                        <th class="px-4 py-3 font-semibold">Hora</th>
                        <th class="px-4 py-3 font-semibold">Evento</th>
                        <th class="px-4 py-3 font-semibold">Fonte</th>
                        <th class="px-4 py-3 font-semibold">NSR / Hash (Legal)</th>
                        <th class="px-4 py-3 font-semibold text-right">Status</th>
                      </tr>
                   </thead>
                   <tbody class="divide-y divide-slate-50">
                      @for (punch of dailyPunches(); track punch.id) {
                         <tr class="hover:bg-slate-50 transition-colors">
                            <td class="px-4 py-3 font-mono font-bold text-slate-700">
                               {{ punch.timestamp | date:'HH:mm' }}
                            </td>
                            <td class="px-4 py-3">
                               <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border"
                                 [class.bg-green-50]="punch.type.includes('ENTRADA') || punch.type.includes('RETORNO')"
                                 [class.text-green-700]="punch.type.includes('ENTRADA') || punch.type.includes('RETORNO')"
                                 [class.border-green-200]="punch.type.includes('ENTRADA') || punch.type.includes('RETORNO')"
                                 [class.bg-red-50]="punch.type.includes('SAIDA')"
                                 [class.text-red-700]="punch.type.includes('SAIDA')"
                                 [class.border-red-200]="punch.type.includes('SAIDA')">
                                 {{ formatType(punch.type) }}
                               </span>
                            </td>
                            <td class="px-4 py-3 text-xs text-slate-500">
                               @if (punch.source === 'REP-P') {
                                 <span class="flex items-center gap-1">📱 REP-P Mobile</span>
                               } @else {
                                 <span class="flex items-center gap-1 text-amber-600">✍️ {{ punch.source }}</span>
                               }
                            </td>
                            <td class="px-4 py-3">
                               <div class="font-mono text-[10px] text-slate-400 flex flex-col">
                                  <span class="truncate max-w-[100px]" title="{{punch.hash}}">{{ punch.hash }}</span>
                                  @if (!punch.synced) { <span class="text-amber-500">Aguardando sync</span> }
                               </div>
                            </td>
                            <td class="px-4 py-3 text-right">
                               @if (punch.synced) {
                                  <span class="text-green-600 text-xs">● Recebido</span>
                               } @else {
                                  <span class="text-amber-500 text-xs animate-pulse">● Fila</span>
                               }
                            </td>
                         </tr>
                      }
                      
                      @if (dailyPunches().length === 0) {
                         <tr>
                            <td colspan="5" class="px-4 py-8 text-center text-slate-400">
                               Nenhuma marcação registrada hoje.
                            </td>
                         </tr>
                      }
                   </tbody>
                </table>
             </div>
             
             <!-- Inconsistency Footer -->
             @if (hasInconsistency()) {
               <div class="bg-red-50 p-3 border-t border-red-100 flex items-start gap-2 text-xs text-red-700">
                  <span class="text-lg">⚠️</span>
                  <div class="mt-0.5">
                    <strong>Inconsistência Detectada:</strong> O número de batidas está ímpar. 
                    Verifique se você esqueceu de registrar a saída ou retorno do intervalo.
                  </div>
               </div>
             }
          </div>

        </div>

        <!-- History Sidebar -->
        <div class="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col h-full">
          <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>📅</span> Timeline
          </h3>
          
          <div class="space-y-4 flex-1 overflow-y-auto pr-2">
            @for (punch of hrService.punches(); track punch.id) {
              <div class="bg-white p-4 rounded-lg shadow-sm border border-slate-200 relative overflow-hidden">
                <div class="absolute top-0 left-0 w-1 h-full" 
                  [class.bg-green-500]="punch.type.includes('ENTRADA') || punch.type.includes('RETORNO')"
                  [class.bg-red-500]="punch.type.includes('SAIDA')"></div>
                
                <div class="flex justify-between items-start mb-2">
                  <span class="text-xs font-bold text-slate-500 uppercase tracking-wide">{{ formatType(punch.type) }}</span>
                  <span class="text-xs text-slate-400 font-mono">{{ punch.hash.substring(0,8) }}...</span>
                </div>
                
                <div class="flex justify-between items-end">
                  <span class="text-xl font-bold text-slate-800">{{ punch.timestamp | date:'HH:mm' }}</span>
                  @if (punch.synced) {
                    <span class="text-xs text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded">
                      <span>☁️</span> Sincronizado
                    </span>
                  } @else {
                     <span class="text-xs text-orange-600 flex items-center gap-1 bg-orange-50 px-2 py-1 rounded animate-pulse" title="Aguardando conexão">
                      <span>🔄</span> Fila Offline
                    </span>
                  }
                </div>
                
                <div class="mt-2 flex justify-between items-center text-xs text-slate-400">
                   <span class="truncate max-w-[150px]">📍 {{ punch.location }}</span>
                   @if (punch.photo) {
                     <span class="text-blue-500 text-[10px] border border-blue-200 rounded px-1">📸 Foto OK</span>
                   }
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Admin / Demo Toggle for Biometrics -->
      <div class="mt-8 border-t border-slate-200 pt-6">
         <div class="flex items-center justify-between bg-slate-100 p-4 rounded-lg">
           <div>
             <h4 class="font-bold text-slate-700 text-sm">Configuração Admin (Demo)</h4>
             <p class="text-xs text-slate-500">Simule a exigência de biometria facial</p>
           </div>
           <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" [checked]="hrService.systemConfig().requireBiometrics" 
                     (change)="toggleBiometrics($event)" class="sr-only peer">
              <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span class="ml-3 text-sm font-medium text-slate-700">Exigir Foto</span>
            </label>
         </div>
         @if (hrService.auditLogs().length > 0) {
            <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
               <h4 class="font-bold text-red-800 text-sm mb-2">Logs de Segurança (Simulação)</h4>
               <ul class="text-xs space-y-1 text-red-700 font-mono">
                 @for (log of hrService.auditLogs(); track log.id) {
                   <li>[{{ log.timestamp | date:'HH:mm:ss' }}] {{ log.type }} - {{ log.description }}</li>
                 }
               </ul>
            </div>
         }
      </div>
    </div>

    <!-- Camera / Biometrics Modal -->
    @if (isCameraOpen()) {
      <div class="fixed inset-0 z-50 bg-black flex flex-col">
        <!-- Close Button -->
        <button (click)="closeCamera()" class="absolute top-4 right-4 z-50 text-white p-2 bg-black/50 rounded-full hover:bg-black/70 transition">
           <span class="text-2xl">✕</span>
        </button>

        <div class="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
           <video #videoElement autoplay playsinline class="w-full h-full object-cover transform scale-x-[-1]"></video>
           
           <!-- Overlay Container -->
           <div class="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              
              <!-- HUD Viewfinder -->
              <div class="relative w-72 h-96">
                
                <!-- Corner Markers -->
                <svg class="absolute top-0 left-0 w-8 h-8 transition-colors duration-300" [class.text-red-500]="livenessStep() === 'ERROR'" [class.text-white]="livenessStep() !== 'ERROR'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round">
                    <path d="M2 10V2h8" />
                </svg>
                <svg class="absolute top-0 right-0 w-8 h-8 transition-colors duration-300" [class.text-red-500]="livenessStep() === 'ERROR'" [class.text-white]="livenessStep() !== 'ERROR'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round">
                    <path d="M22 10V2h-8" />
                </svg>
                <svg class="absolute bottom-0 left-0 w-8 h-8 transition-colors duration-300" [class.text-red-500]="livenessStep() === 'ERROR'" [class.text-white]="livenessStep() !== 'ERROR'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round">
                    <path d="M2 14v8h8" />
                </svg>
                <svg class="absolute bottom-0 right-0 w-8 h-8 transition-colors duration-300" [class.text-red-500]="livenessStep() === 'ERROR'" [class.text-white]="livenessStep() !== 'ERROR'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round">
                    <path d="M22 14v8h-8" />
                </svg>

                <!-- Face Frame (Inner Oval) -->
                <div class="absolute inset-4 rounded-[40%] overflow-hidden border-2 transition-all duration-500"
                     [class.border-blue-400]="livenessStep() === 'SCANNING'"
                     [class.border-dashed]="livenessStep() === 'SCANNING'"
                     [class.border-white-20]="livenessStep() === 'INIT'"
                     [class.border-green-500]="livenessStep() === 'SUCCESS'"
                     [class.border-solid]="livenessStep() === 'SUCCESS'"
                     [class.border-red-500]="livenessStep() === 'ERROR'"
                     [class.animate-shake]="livenessStep() === 'ERROR'">

                     <!-- SCANNING EFFECT -->
                     @if (livenessStep() === 'SCANNING') {
                       <!-- Grid Background -->
                       <div class="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.3)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
                       
                       <!-- Moving Beam -->
                       <div class="absolute top-0 w-full h-2 bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,1)] animate-scan-radar"></div>
                     }

                     <!-- SUCCESS EFFECT -->
                     @if (livenessStep() === 'SUCCESS') {
                        <div class="absolute inset-0 border-[6px] border-green-500 rounded-[40%] animate-pulse shadow-[0_0_30px_rgba(34,197,94,0.6)]"></div>
                        <div class="absolute inset-0 bg-green-500/10"></div>
                        <div class="absolute inset-0 flex items-center justify-center animate-scale-up">
                           <div class="bg-green-500 text-white rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-10 h-10">
                               <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                             </svg>
                           </div>
                        </div>
                     }

                     <!-- ERROR EFFECT -->
                     @if (livenessStep() === 'ERROR') {
                        <div class="absolute inset-0 bg-red-500/20"></div>
                        <div class="absolute inset-0 flex items-center justify-center">
                           <div class="bg-red-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
                             <span class="text-3xl font-bold">!</span>
                           </div>
                        </div>
                     }
                </div>
              </div>
              
              <!-- Status Badge -->
              <div class="mt-8 px-6 py-3 rounded-full font-medium backdrop-blur-md transition-all duration-300 shadow-lg border"
                   [class.bg-black-60]="livenessStep() !== 'SUCCESS' && livenessStep() !== 'ERROR'"
                   [class.border-white-10]="livenessStep() !== 'SUCCESS' && livenessStep() !== 'ERROR'"
                   [class.bg-green-600]="livenessStep() === 'SUCCESS'"
                   [class.border-green-400]="livenessStep() === 'SUCCESS'"
                   [class.bg-red-600]="livenessStep() === 'ERROR'"
                   [class.border-red-400]="livenessStep() === 'ERROR'"
                   [class.text-white]="true">
                @switch (livenessStep()) {
                  @case ('INIT') { <span class="text-slate-200">Posicione seu rosto na moldura</span> }
                  @case ('SCANNING') { <span class="text-blue-300 flex items-center gap-2"><span class="animate-spin">🌀</span> Verificando vivacidade...</span> }
                  @case ('SUCCESS') { <span class="text-white font-bold flex items-center gap-2"><span>✅</span> Biometria Confirmada!</span> }
                  @case ('ERROR') { <span class="text-white font-bold flex items-center gap-2"><span>⚠️</span> Falha na Detecção</span> }
                }
              </div>
              
              @if (livenessStep() === 'ERROR') {
                 <div class="mt-2 text-white text-xs bg-red-900/80 px-4 py-2 rounded-lg">
                   Tentativa {{ attempts() }}/3. Verifique a iluminação.
                 </div>
              }
           </div>
        </div>

        <div class="h-32 bg-slate-900 flex items-center justify-center gap-8 pb-safe border-t border-slate-800">
           @if (livenessStep() === 'SUCCESS') {
             <div class="flex flex-col items-center gap-2 animate-scale-up">
                <button (click)="captureAndConfirm()" class="w-16 h-16 bg-white rounded-full border-4 border-slate-300 flex items-center justify-center active:scale-95 transition hover:bg-slate-50 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  <div class="w-14 h-14 bg-white border-2 border-slate-900 rounded-full"></div>
                </button>
                <span class="text-white text-xs font-medium">Capturar & Confirmar</span>
             </div>
           } @else {
             <div class="text-slate-500 text-sm flex items-col items-center gap-2 opacity-50">
               <div class="w-16 h-16 rounded-full border-4 border-slate-700 bg-slate-800"></div>
               <span class="text-xs">Aguardando...</span>
             </div>
           }
        </div>
        
        <canvas #canvasElement class="hidden"></canvas>
      </div>
    }
  `,
  styles: [`
    @keyframes scanRadar {
      0% { top: 0%; opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { top: 100%; opacity: 0; }
    }
    .animate-scan-radar {
      animation: scanRadar 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }
    @keyframes scaleUp {
      0% { transform: scale(0.5); opacity: 0; }
      60% { transform: scale(1.1); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    .animate-scale-up {
      animation: scaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    .animate-shake {
      animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
    }
    @keyframes slideIn {
       from { transform: translateX(100%); opacity: 0; }
       to { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-in {
      animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .bg-black-60 { background-color: rgba(0,0,0,0.6); }
    .border-white-20 { border-color: rgba(255,255,255,0.2); }
    .border-white-10 { border-color: rgba(255,255,255,0.1); }
  `]
})
export class TimeClockComponent implements OnDestroy {
  hrService = inject(HrService);
  currentTime = signal(new Date());
  loadingLocation = signal(false);

  // Camera State
  isCameraOpen = signal(false);
  livenessStep = signal<'INIT' | 'SCANNING' | 'SUCCESS' | 'ERROR'>('INIT');
  pendingPunchType = signal<Punch['type'] | null>(null);
  attempts = signal(0);
  
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  stream: MediaStream | null = null;
  scanTimeout: any;

  // Mirror Logic
  dailyPunches = computed(() => {
    const today = new Date().setHours(0,0,0,0);
    return this.hrService.punches()
      .filter(p => new Date(p.timestamp).setHours(0,0,0,0) === today)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  });

  dailyTotal = computed(() => {
    const punches = this.dailyPunches();
    let totalMs = 0;
    
    // Simple pair calculation: Entry -> Next Punch
    // Note: Real world scenarios need complex shift logic. This is a visual approximation.
    for (let i = 0; i < punches.length - 1; i += 2) {
      const start = punches[i];
      const end = punches[i+1];
      
      // Only count if pairs match (In -> Out) or (Return -> Out)
      if (start.type.includes('SAIDA')) continue; // Should start with entry

      const duration = new Date(end.timestamp).getTime() - new Date(start.timestamp).getTime();
      totalMs += duration;
    }

    const hours = Math.floor(totalMs / (1000 * 60 * 60));
    const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return {
       hours,
       minutes,
       text: `${hours}h ${minutes}m`
    };
  });

  hasInconsistency = computed(() => {
    return this.dailyPunches().length % 2 !== 0;
  });

  constructor() {
    setInterval(() => {
      this.currentTime.set(new Date());
    }, 1000);
  }

  ngOnDestroy() {
    this.stopCamera();
    clearTimeout(this.scanTimeout);
  }

  formatType(type: string) {
    return type.replace('_', ' ');
  }

  toggleBiometrics(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    this.hrService.toggleBiometrics(checked);
  }

  initiatePunch(type: Punch['type']) {
    this.pendingPunchType.set(type);

    if (this.hrService.systemConfig().requireBiometrics) {
      this.openCamera();
    } else {
      this.processPunch(type, undefined);
    }
  }

  async openCamera() {
    // Check if locked
    if (this.hrService.isLockedOut()) {
      alert('Bloqueio temporário ativo.');
      return;
    }

    this.isCameraOpen.set(true);
    this.livenessStep.set('INIT');
    this.attempts.set(0);

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 720 } },
        audio: false 
      });
      
      setTimeout(() => {
        if (this.videoElement) {
          this.videoElement.nativeElement.srcObject = this.stream;
          this.startLivenessCheck();
        }
      }, 100);

    } catch (err) {
      console.error('Erro ao acessar camera:', err);
      alert('Permissão de câmera negada. Não é possível registrar o ponto com biometria.');
      this.closeCamera();
    }
  }

  startLivenessCheck() {
    this.livenessStep.set('SCANNING');
    
    // Simulate complex Liveness Logic
    this.scanTimeout = setTimeout(() => {
      // Simulate random failure (15% chance of failure for demo purposes)
      const livenessScore = Math.random(); 
      const threshold = 0.85; // Success threshold (inverted logic here: if random > 0.15 it succeeds, so 85% success rate)
      
      // In a real scenario, this score comes from ML models processing the video stream
      if (livenessScore < threshold) {
        this.livenessStep.set('SUCCESS');
      } else {
        this.handleLivenessFailure(livenessScore);
      }
    }, 2500);
  }

  handleLivenessFailure(score: number) {
    const currentAttempts = this.attempts() + 1;
    this.attempts.set(currentAttempts);
    this.livenessStep.set('ERROR');

    // Audit Log Trigger
    if (currentAttempts >= 3) {
      this.hrService.logFraudAttempt(
        `Falha repetida de liveness (Score: ${score.toFixed(2)}).`,
        { attempts: currentAttempts, device: navigator.userAgent }
      );
    }

    // Lockout Logic Check
    if (currentAttempts > 3) {
      this.closeCamera();
      this.hrService.triggerSecurityLockout();
      return;
    }

    // Retry Logic
    if (currentAttempts <= 3) {
       setTimeout(() => {
         if (this.isCameraOpen()) {
           this.startLivenessCheck();
         }
       }, 2000); // Give user 2 seconds to see error before retrying
    }
  }

  closeCamera() {
    this.stopCamera();
    this.isCameraOpen.set(false);
    this.pendingPunchType.set(null);
    clearTimeout(this.scanTimeout);
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  captureAndConfirm() {
    if (!this.videoElement || !this.canvasElement) return;

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const photoBase64 = canvas.toDataURL('image/jpeg', 0.8);
      const type = this.pendingPunchType();
      
      if (type) {
        this.processPunch(type, photoBase64);
      }
      
      this.closeCamera();
    }
  }

  processPunch(type: Punch['type'], photo?: string) {
    if (this.hrService.isOnline()) {
      this.loadingLocation.set(true);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.loadingLocation.set(false);
          const loc = `Lat: ${position.coords.latitude.toFixed(4)}, Long: ${position.coords.longitude.toFixed(4)}`;
          this.hrService.addPunch(type, loc, photo);
        },
        (error) => {
          this.loadingLocation.set(false);
          this.hrService.addPunch(type, 'Localização Indisponível (Erro GPS)', photo);
        }
      );
    } else {
      this.hrService.addPunch(type, '📍 GPS Pendente (Offline)', photo);
    }
  }
}