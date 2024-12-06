export type User = {
  username: string;
  password: string;
  userid: string;
};

export type FormState = {
  date?: string;
  restaurants?: {
    name: string;
    city: string;
    dishes: { dish: string; description: string }[];
  }[];
  error?: null | string;
};

export type ResultListData =
  | {
      restaurant_name: string;
      dish_name: string;
      description: string;
      date: Date;
      id: string;
      city: string;
    }[]
  | null;
