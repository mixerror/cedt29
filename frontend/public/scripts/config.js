// Backend URL
export const BACKEND_URL = "http://localhost:3222";

// Tailwind theme extension
tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        }
      }
    }
  }
};

// Personalities
export const personality = {
  Standard: {
    description: "คุณคือนักลงทุนที่เน้นการสอนและแนะนำ ... (ไม่เกิน 3 บรรทัด)",
  },
  Negotiation: {
    description: "คุณคือนักลงทุนในสถานการณ์การต่อรองจริง ... (ไม่เกิน 3 บรรทัด)",
  },
  "Data-Driven": {
    description: "Data-driven investor mode.",
  },
};
