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
  class="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-colors hover:bg-slate-800 dark:hover:bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
  class:active
  style:background-color={active ? `${activeColor}11` : undefined}
  style:color={active ? activeColor : undefined}
  {onclick}
  {...rest}
>
  <slot name="icon"></slot>
  <span>{label}</span>
</button>