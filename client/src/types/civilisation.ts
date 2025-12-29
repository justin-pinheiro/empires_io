import type { Resources } from "./resources";

export interface Civilisation {
  name: string;
  age: number;
  resources: Resources;
  resourcesCapacity: Resources;
}
