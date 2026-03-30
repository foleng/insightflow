<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface NavItemProps extends HTMLAttributes<HTMLButtonElement> {
    active: boolean;
    label: string;
    activeColor: string;
    disabled?: boolean;
  }

  let { active, label, activeColor, disabled = false, onClick, ...rest } = $props<NavItemProps>();
</script>

<button
  {disabled}
  class="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-colors hover:bg-slate-800 dark:hover:bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
  classList={{ 'bg-blue-500/10': active, 'text-blue-400': active }}
  style={active ? { backgroundColor: `${activeColor}11`, color: activeColor } : {}}
  onclick={onClick}
  {...rest}
>
  <slot name="icon"></slot>
  <span>{label}</span>
</button>