import { MockData } from "./types";

export const mockData: MockData = {
  user: {
    username: "Esimerkki123",
    password: "Salasana123",
    userID: "123",
  },
  restaurants: [
    {
      name: "Ravintola 1",
      menus: [
        { dish: "Ruoka 1", date: "04-11-2024" },
        { dish: "Ruoka 2", date: "04-11-2024" },
      ],
    },
    {
      name: "Ravintola 2",
      menus: [
        { dish: "Ruoka 3", date: "04-11-2024" },
        { dish: "Ruoka 4", date: "04-11-2024" },
      ],
    },
  ],
};
