export function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }
  
  export function nowISO() {
    return new Date().toISOString();
  }
  
  export function addYearsISO(dateISO: string, years: number) {
    if (!dateISO) return '';
  
    const date = new Date(`${dateISO}T00:00:00`);
  
    if (Number.isNaN(date.getTime())) return '';
  
    date.setFullYear(date.getFullYear() + years);
  
    return date.toISOString().slice(0, 10);
  }
  
  export function daysBetweenISO(fromISO: string, toISO: string) {
    if (!fromISO || !toISO) return 0;
  
    const from = new Date(`${fromISO}T00:00:00`);
    const to = new Date(`${toISO}T00:00:00`);
  
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return 0;
    }
  
    const diff = to.getTime() - from.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
  
  export function formatDateLabel(dateISO?: string) {
    if (!dateISO) return '—';
  
    const date = new Date(`${dateISO}T00:00:00`);
  
    if (Number.isNaN(date.getTime())) return dateISO;
  
    return date.toLocaleDateString('es-NI', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  }