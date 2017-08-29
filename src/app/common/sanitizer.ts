import { ClassProvider, SecurityContext, NgModule } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

export class NoSanitizationService {
    sanitize(ctx: SecurityContext, value: any): string {
        return value;
    }
}

export const NO_SANITIZATION_PROVIDERS: ClassProvider = {provide: DomSanitizer,
    useClass: NoSanitizationService};
