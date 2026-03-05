export interface RefrigeratorItem {
  id: string;
  name: string;
  amount?: string;
  addedDate: string;
  expireDate: string;
}

export interface CookingSelection {
  itemId: string;
  consumeAll: boolean;
}

export interface Dish {
  name: string;
  steps: string[];
}
