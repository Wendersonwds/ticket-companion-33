import { useTheme, themes, ThemeName } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Palette, Check } from 'lucide-react';

const swatches: Record<ThemeName, string> = {
  light: 'bg-white border-slate-300',
  dark: 'bg-slate-900 border-slate-700',
  ocean: 'bg-[hsl(195,90%,55%)] border-[hsl(210,50%,15%)]',
  sunset: 'bg-[hsl(330,85%,62%)] border-[hsl(280,35%,15%)]',
};

export function ThemeToggle({ size = 'icon' }: { size?: 'icon' | 'sm' | 'default' }) {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={size} aria-label="Alterar tema">
          <Palette className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Tema do site</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themes.map(t => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => setTheme(t.id)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className={`h-4 w-4 rounded-full border ${swatches[t.id]}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{t.label}</p>
              <p className="text-[11px] text-muted-foreground truncate">{t.description}</p>
            </div>
            {theme === t.id && <Check className="h-3.5 w-3.5 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
