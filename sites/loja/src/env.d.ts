/// <reference types="astro/client" />
declare namespace App {
  interface Locals {
    settings: any;
    customer: { id: number; name: string; email: string } | null;
  }
}
