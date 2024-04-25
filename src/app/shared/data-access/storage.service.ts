import {inject, Injectable, InjectionToken, PLATFORM_ID} from "@angular/core";
import {Observable, of} from "rxjs";
import {Checklist} from "../interfaces/checklist";
import {ChecklistItem} from "../interfaces/checklist-item";

// https://angularstart.com/standard/modules/angular-quicklists/11/
export const LOCAL_STORAGE = new InjectionToken<Storage>(
  'window local storage object',
  {
    providedIn: 'root',
    factory: () => {
      return inject(PLATFORM_ID) === 'browser'
        ? window.localStorage
        : ({} as Storage)
    }
  }
);

@Injectable({
  providedIn: 'root'
})
// Responsibility: Handle local storage
export class StorageService {
  public storage = inject(LOCAL_STORAGE);

  public loadChecklists(): Observable<Checklist[]> {
    const checklists = this.storage.getItem('checklists');
    return of(checklists
      ? (JSON.parse(checklists) as Checklist[])
      : []
    );
  }

  public loadChecklistItems(): Observable<ChecklistItem[]> {
    const checklistItems = this.storage.getItem('checklistItems');
    return of(checklistItems
      ? (JSON.parse(checklistItems) as ChecklistItem[])
      : []
    );
  }

  public saveChecklists(checklists: Checklist[]): void {
    this.storage.setItem('checklists', JSON.stringify(checklists));
  }

  public saveChecklistItems(checklistItems: ChecklistItem[]): void {
    this.storage.setItem('checklistItems', JSON.stringify(checklistItems));
  }
}
