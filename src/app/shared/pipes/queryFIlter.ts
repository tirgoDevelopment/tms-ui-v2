export function generateQueryFilter(filter: any): string {
    const queryParts: string[] = [];
    const filterEntries: any[] = Object.entries(filter); 
  
    filterEntries.forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (key.toLowerCase().includes('date') || key.toLowerCase().includes('from') || key.toLowerCase().includes('to')) {
          value = formatDate(value); 
        }
        queryParts.push(`${key}=${encodeURIComponent(value)}`);
      }
    });
    return queryParts.length ? `${queryParts.join('&')}` : '';
  }
  
  function formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }