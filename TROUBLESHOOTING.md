# 🔧 Troubleshooting TypeScript & D3.js

## Error yang Sering Terjadi

### 1. GeoPath Type Error
```
Argument of type 'GeoPath<any, GeoPermissibleObjects>' is not assignable to parameter of type 'string | number | boolean | readonly (string | number)[] | ValueFn<SVGPathElement, unknown, string | number | boolean | readonly (string | number)[] | null> | null'.
```

**Solusi:**
- Gunakan type assertion: `(d: any) => geoPath(d) || ""`
- Atau gunakan komponen `AttackMapSimple.tsx` yang sudah diperbaiki

### 2. D3.js Import Issues
```
Module not found: Can't resolve 'd3-geo'
```

**Solusi:**
```bash
npm install d3 d3-geo @types/d3 @types/d3-geo --legacy-peer-deps
```

### 3. TypeScript Strict Mode
Jika error masih terjadi, ubah `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": false,
    "noImplicitAny": false
  }
}
```

## Alternatif Komponen

Jika `AttackMap.tsx` masih error, gunakan `AttackMapSimple.tsx`:

```tsx
// Di App.tsx, ganti import:
import AttackMapSimple from './components/AttackMapSimple';

// Dan ganti komponen:
<AttackMapSimple attacks={attacks} />
```

## Testing

### 1. Test Komponen
```bash
cd frontend
npm start
```

### 2. Test WebSocket
Buka `test-websocket-demo.html` di browser

### 3. Test Backend
```bash
npm run dev:demo
```

## Fallback Options

### 1. Gunakan JavaScript
Rename file dari `.tsx` ke `.jsx` dan hapus type annotations

### 2. Gunakan Any Types
```tsx
const geoPath: any = d3.geoPath().projection(projection);
```

### 3. Disable TypeScript Checking
```tsx
// @ts-ignore
.attr("d", geoPath)
```

## Dependencies yang Diperlukan

```json
{
  "dependencies": {
    "d3": "^7.9.0",
    "d3-geo": "^3.1.1",
    "@types/d3": "^7.4.3",
    "@types/d3-geo": "^3.1.0"
  }
}
```

## Versi yang Kompatibel

- React: ^18.0.0 atau ^19.0.0
- TypeScript: ^4.9.0
- D3.js: ^7.0.0
- Node.js: ^16.0.0

## Quick Fix

Jika semua gagal, gunakan komponen sederhana:

```tsx
const SimpleMap = ({ attacks }: { attacks: Attack[] }) => {
  return (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ff4444',
      fontSize: '24px'
    }}>
      <div>
        <h1>🌍 Norse Attack Map</h1>
        <p>Attacks: {attacks.length}</p>
        <p>Status: Connected</p>
      </div>
    </div>
  );
};
```

---

**Catatan:** Error TypeScript dengan D3.js adalah masalah umum. Solusi di atas sudah terbukti bekerja untuk sebagian besar kasus.
