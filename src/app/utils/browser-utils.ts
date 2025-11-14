// src/app/utils/browser-utils.ts

/** Obtiene un valor de localStorage solo si estamos en el navegador */
export function getLocalStorageItem(key: string): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(key);
  }
  return null;
}

/** Guarda un valor en localStorage solo si estamos en el navegador */
export function setLocalStorageItem(key: string, value: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(key, value);
  }
}

/** Elimina un valor de localStorage solo si estamos en el navegador */
export function removeLocalStorageItem(key: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(key);
  }
}

/** Muestra alertas de forma segura (en navegador o SSR) */
export function showAlert(message: string): void {
  if (typeof window !== 'undefined' && window.alert) {
    window.alert(message);
  } else {
    console.log('ALERTA:', message);
  }
}
