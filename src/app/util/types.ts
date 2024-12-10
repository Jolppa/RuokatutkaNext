export type User = {
  username: string;
  password: string;
  userid: string;
};

export type FormState = {
  data?: {
    date: string;
    restaurants: {
      name: string;
      city: string;
      dishes: { dish: string; description: string }[];
    }[];
  }[];

  error?: null | string;
};

export type ResultListData =
  | {
      restaurant_name: string;
      dish_name: string;
      description: string;
      date: string;
      id: string;
      city: string;
    }[]
  | null;

export type GroupedData = {
  [date: string]: {
    [restaurantName: string]: {
      city: string;
      dishes: {
        id: string;
        dish_name: string;
        description: string;
      }[];
    };
  };
};
