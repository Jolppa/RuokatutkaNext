"use server";

import puppeteer from "puppeteer";
import { AuthError } from "next-auth";
import { sql } from "@vercel/postgres";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { User } from "./types";
import { redirect } from "next/navigation";
import { FormState } from "./types";
import { z } from "zod";
import { signIn, signOut } from "../../auth";
import { auth } from "../../auth";
import { saveDataToDatabase } from "./data";

export async function listRestaurants(
  prevState: FormState | undefined,
  formData: FormData
): Promise<FormState> {
  let browser;
  try {
    const session = await auth();
    // Validate the form data here
    const rawCity = formData.get("kaupunki");
    const userId = session?.user?.id || undefined;

    if (!rawCity) {
      throw new Error("Kaupunki on pakollinen kenttä.");
    }

    if (!userId) {
      throw new Error("Käyttäjä ei ole kirjautunut sisään.");
    }

    // VALIDATION SECTION
    //! This needs improvement
    const parsedFormData = z.object({
      kaupunki: z
        .string()
        .min(4, { message: "Kirjoita vähintään 4 kirjainta" }),
    });

    const validatedFormData = parsedFormData.safeParse({
      kaupunki: rawCity as string,
    });

    if (!validatedFormData.success) {
      throw new Error(validatedFormData.error.errors[0].message);
    }

    // END VALIDATION SECTION

    function delay(time: number) {
      return new Promise(function (resolve) {
        setTimeout(resolve, time);
      });
    }

    browser = await puppeteer.launch({
      headless: false,
      devtools: false,
    });
    const page = await browser.newPage();

    // Set viewport and user agent (just in case for nice viewing)
    await page.setViewport({ width: 1366, height: 768 });
    await page.goto("https://www.lounaat.info");
    // wait for the page to load
    // Make it so that the banner is clicked if it exists

    // SELECTORS
    const banner =
      "body > div.zevoy-banner > div > div.banner-promo.active > div.banner-close > div";
    const viewFilter = "#view-filter";
    const studentFilter =
      "#view-filter-dropdown > li > ul > li:nth-child(3) > a";
    const searchButton = "#locator";
    const searchInput = "#address";
    const readyButton = "#dialog > div > div:nth-child(2) > div > button";
    // END SELECTORS

    await page.waitForSelector(banner);
    await page.waitForSelector(".css-47sehv");
    // accept cookies
    await page.$eval(".css-47sehv", (button) =>
      (button as HTMLInputElement).click()
    );
    await page.click(banner);

    await page.waitForSelector(viewFilter);
    await page.click(viewFilter);

    await page.waitForSelector(studentFilter);
    await page.click(studentFilter);

    await page.waitForSelector(searchButton);
    await page.click(searchButton);

    await page.waitForSelector(searchInput);
    await page.type(searchInput, rawCity as string);

    await delay(2000);

    const city = await page.$eval(
      searchInput,
      (el) => (el as HTMLInputElement).value
    );
    console.log(city);
    // press enter
    await page.keyboard.press("Enter");

    // await page.waitForSelector(readyButton);
    await page.waitForNetworkIdle();

    await page.click(readyButton);

    await page.waitForNetworkIdle();

    const days = await page.$$eval(".dayview-filter", (days) => {
      return days.map((day) => day.children.length)[0];
    });

    const data = [];

    for (let i = 0; i < days; i++) {
      // Move this type to the types file
      const entryObj: {
        date: string;
        restaurants: {
          name: string;
          city: string;
          dishes: { dish: string; description: string }[];
        }[];
      } = { date: "", restaurants: [] };

      if (i !== 0) {
        await page.$eval("#day-filter", (dayFilter) =>
          (dayFilter as HTMLInputElement).click()
        );
        // wait for the day to load
        //! This is not working properly
        await page.waitForSelector(
          `.dayview-filter > li:nth-child(${i + 1}) > a`
        );
        await delay(2000);
        await page.$eval(
          `.dayview-filter > li:nth-child(${i + 1}) > a`,
          (day) => (day as HTMLAnchorElement).click()
        );
      }

      const dateString = (await page.$eval(
        'span[data-lounaat-filter="day-text"]',
        (el) => el.textContent || ""
      )) as string;

      const [day, month] = dateString.substring(2).split(".");
      const year = new Date().getFullYear();
      const date = new Date(year, parseInt(month) - 1, parseInt(day));

      entryObj.date = date.toISOString();

      // Wait for the dishes to load
      await page.waitForSelector(".menu-item");

      const restaurants = await page.$$eval(
        ".menu",
        (entries, city) => {
          const cleanUpString = (str: string) =>
            str.replace(/\s+/g, " ").trim();
          return entries.map((entry: Element) => {
            const name = cleanUpString(
              entry.querySelector("div.item-header > h3")?.textContent || ""
            );
            const dishes = Array.from(entry.querySelectorAll(".dish")).map(
              (menu) => {
                let dish = menu?.textContent || "";
                if (dish) {
                  dish = cleanUpString(dish.replace(/[^a-zA-ZåäöÅÄÖ ]/g, ""));
                  console.log(dish);
                }

                const description =
                  menu.querySelector(".menu-item-price")?.textContent || "";
                return { dish, description };
              }
            );
            if (dishes.length === 0) {
              dishes.push({ dish: "No dishes found", description: "" });
            }
            return { city, name, dishes };
          });
        },
        city
      );
      entryObj.restaurants = [...restaurants];

      data.push(entryObj);
    }

    await browser.close();

    // Save to database

    await saveDataToDatabase(userId, data);
    console.log("end");
    // I don't know if we are doing anything with the data
    return { data };
  } catch (error) {
    console.error("Failed to list restaurants:", error);
    return {
      error: "Jotain meni pieleen, yritä uudelleen.",
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// AUTHENTICATION ACTIONS

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    await signIn("credentials", { username, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
  }
  redirect("/tutka");
}

export async function signout() {
  await signOut({ redirect: false });
  redirect("/");
}

export async function register(
  prevState: string | undefined,
  formData: FormData
) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  if (!username || !password) {
    return "Please fill out the form.";
  }

  const hashedPassword = await bcrypt.hash(password as string, 10);

  try {
    // Check if the user already exists
    const users =
      await sql<User>`SELECT * FROM users WHERE username = ${username}`;
    if (users.rows.length > 0) {
      console.log("User already exists.");
      return "User already exists.";
    }

    await sql<User>`
      INSERT INTO users (userid,username, password) VALUES (${uuidv4()},${username}, ${hashedPassword})
    `;
    console.log("User registered successfully.");
    await signIn("credentials", { username, password, redirect: false });
  } catch (error) {
    console.error("Failed to register user:", error);
    return "Failed to register user.";
  }
  redirect("/dashboard");
}
