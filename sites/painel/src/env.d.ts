/// <reference types="astro/client" />
declare namespace App {
  interface Locals {
    user: { id: number; name: string; email: string; role: 'proprietario' | 'gerente' | 'atendente'; mustChangePassword: boolean } | null;
    token: string;
    settings: any;
  }
}
