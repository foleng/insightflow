<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface NavItemProps extends HTMLAttributes<HTMLButtonElement> {
    active: boolean;
    label: string;
    activeColor: string;
    disabled?: boolean;
    onclick?: (event: MouseEvent) => void;
  }

  let { active, label, activeColor, disabled = false, onclick, ...rest } = $props<NavItemProps>();
</script>

<button
  {disabled}
  class={`flex items-center gap-3 w-full text-left px-5 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 hover:bg-white/5 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed ${active ? 'bg-white/10 text-white' : ''}`}
  {onclick}
  {...rest}
>
  <slot name="icon"></slot>
  <span>{label}</span>
</button>