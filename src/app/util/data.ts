"use server";
import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { v4 as uuidv4 } from "uuid";
import { ResultListData } from "./types";

export async function fetchData(): Promise<ResultListData> {
  try {
    const session = await auth();

    if (!session || !session.user) {
      throw new Error("User is not authenticated");
    }

    const data = await sql`
    SELECT DISTINCT
      r.name AS restaurant_name, 
      r.city,
      d.name AS dish_name, 
      d.description,
      d.date,
      d.id
    FROM 
      searches s
    JOIN 
      restaurants r ON s.city = r.city
    JOIN 
      dishes d ON r.id = d.restaurant_id
    WHERE 
      s.user_id = ${session.user.id};
  `;
    const response = data.rows as ResultListData;
    return response;
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return null;
  }
}

export async function getUser(username: string, password: string) {
  const data = await sql`
    SELECT * FROM users WHERE username = ${username};
  `;
  const user = data.rows[0];
  if (!user) {
    return null;
  }
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return null;
  }
  return { id: user.userid, name: user.username };
}

export async function saveDataToDatabase(
  user_id: string,
  data: {
    date: string;
    restaurants: {
      name: string;
      city: string;
      dishes: { dish: string; description: string }[];
    }[];
  }[]
): Promise<void> {
  try {
    for (const day of data) {
      for (const restaurant of day.restaurants) {
        // Insert a new search record
        await sql`
          INSERT INTO searches (id, user_id, city, date) 
          VALUES (${uuidv4()},${user_id}, ${
          restaurant.city
        }, ${new Date().toLocaleString("fi-FI")}) 
          RETURNING id
        `;

        // Insert restaurant
        const restaurantResult = await sql`
          INSERT INTO restaurants (id, name, city) 
          VALUES (${uuidv4()},${restaurant.name}, ${restaurant.city}) 
          ON CONFLICT (name, city) DO UPDATE SET name = EXCLUDED.name
          RETURNING id
        `;
        const restaurantId = restaurantResult.rows[0].id;

        for (const dish of restaurant.dishes) {
          // console.log(day.date);
          // Insert dish
          await sql`
            INSERT INTO dishes (id, name, restaurant_id, description, date) 
            VALUES (${uuidv4()},${dish.dish}, ${restaurantId}, ${
            dish.description
          }, ${day.date.split("T")[0]})
            ON CONFLICT (name, restaurant_id) DO UPDATE SET description = EXCLUDED.description
          `;
        }
      }
    }
    console.log("Data saved to database successfully.");
  } catch (error) {
    console.error("Failed to save data to database:", error);
  }
}

export async function seed() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      userid SERIAL PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS searches (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(userid),
      city VARCHAR(255) NOT NULL,
      date TIMESTAMP NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS restaurants (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      city VARCHAR(255) NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS dishes (
      id SERIAL PRIMARY KEY,
      name VARCHAR(1024) NOT NULL,
      restaurant_id INTEGER REFERENCES restaurants(id),
      description TEXT,
      date TIMESTAMP NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS favorites (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(userid),
      restaurant_id INTEGER REFERENCES restaurants(id)
    );
  `;
}
