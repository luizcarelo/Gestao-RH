import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-3 select-none">
      <!-- Logo Icon -->
      <div [class]="iconSizeClasses()" 
           class="relative shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800 shadow-lg overflow-hidden border border-white/10 group-hover:shadow-blue-500/20 transition-all duration-300">
        
        <!-- Abstract Geometric Shapes for "Trust & Growth" -->
        <!-- Green arc/circle for growth/compliance -->
        <div class="absolute -top-1 -right-1 w-2/3 h-2/3 bg-emerald-500 rounded-full blur-[1px] opacity-90"></div>
        
        <!-- Blue overlay for depth -->
        <div class="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-900/60 to-transparent"></div>

        <!-- Central Symbol: Shield with Check (SVG) -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="relative z-10 text-white w-3/5 h-3/5 drop-shadow-md">
           <path fill-rule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.352-.272-2.636-.759-3.807a.75.75 0 00-.724-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
        </svg>
      </div>

      <!-- Brand Text -->
      @if (showText()) {
        <div class="flex flex-col justify-center">
          <h1 [class]="textSizeClasses()" class="font-extrabold tracking-tight leading-none flex items-center gap-0.5">
            <span [class]="theme() === 'dark' ? 'text-white' : 'text-slate-800'">Gestão</span>
            <span class="text-blue-500">RH</span>
          </h1>
          <div class="flex items-center gap-1.5 mt-0.5">
             <div class="h-0.5 w-3 bg-emerald-500 rounded-full"></div>
             <span [class]="subtextSizeClasses()" class="uppercase tracking-widest font-semibold text-emerald-500">
               Compliance
             </span>
          </div>
        </div>
      }
    </div>
  `
})
export class LogoComponent {
  size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  showText = input(true);
  theme = input<'light' | 'dark'>('light');

  iconSizeClasses = computed(() => {
    switch (this.size()) {
      case 'sm': return 'w-8 h-8 rounded-lg';
      case 'lg': return 'w-14 h-14 rounded-2xl';
      case 'xl': return 'w-20 h-20 rounded-3xl';
      case 'md': 
      default: return 'w-10 h-10 rounded-xl';
    }
  });

  textSizeClasses = computed(() => {
    switch (this.size()) {
      case 'sm': return 'text-sm';
      case 'lg': return 'text-2xl';
      case 'xl': return 'text-3xl';
      case 'md': 
      default: return 'text-lg';
    }
  });

  subtextSizeClasses = computed(() => {
    switch (this.size()) {
      case 'sm': return 'text-[8px]';
      case 'lg': return 'text-xs';
      case 'xl': return 'text-sm';
      case 'md': 
      default: return 'text-[10px]';
    }
  });
}