"use server";

import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { AuthError } from "next-auth";
import { sql } from "@vercel/postgres";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { entryObject, User } from "./types";
import { redirect } from "next/navigation";
import { FormState } from "./types";
import { signIn, signOut } from "../../auth";
import { auth } from "../../auth";
import { saveDataToDatabase } from "./data";
import { validateCityData } from "./validation";

//! This whole function needs a lot of work, but it works for now
export async function listRestaurants(
  prevState: FormState | undefined,
  formData: FormData
): Promise<FormState> {
  // Currently the issue with Vercel is that this function takes too long to run. Next step would be to optimize the function
  // TODO
  // * 1. Add proper validation
  // * 2. Refactor / Optimize

  let browser;
  try {
    const startTime = Date.now();
    console.log("Function started");

    const session = await auth();
    // Validate the form data here

    // VALIDATION SECTION
    //! This needs improvement
    const rawCity = formData.get("kaupunki");
    if (!rawCity) {
      throw new Error("Kaupunki on pakollinen kenttä.");
    }

    const userId = session?.user?.id || undefined;
    if (!userId) {
      throw new Error("Käyttäjä ei ole kirjautunut sisään.");
    }

    validateCityData({ kaupunki: rawCity as string });

    // END VALIDATION SECTION

    function delay(time: number) {
      return new Promise(function (resolve) {
        setTimeout(resolve, time);
      });
    }

    if (
      process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "test"
    ) {
      browser = await puppeteer.launch({
        executablePath:
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        headless: true,
        defaultViewport: { width: 1366, height: 768 },
        args: [],
        devtools: false,
      });
    } else {
      // This is for Vercel
      const executablePath = await chromium.executablePath();
      if (!executablePath) {
        throw new Error("Chromium executable path not found");
      }
      browser = await puppeteer.launch({
        executablePath: executablePath,
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        headless: chromium.headless,
      });
    }
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
    });

    await page.goto("https://www.lounaat.info");

    // * SELECTORS
    const banner =
      "body > div.zevoy-banner > div > div.banner-promo.active > div.banner-close > div";
    const viewFilter = "#view-filter";
    const studentFilter =
      "#view-filter-dropdown > li > ul > li:nth-child(3) > a";
    const searchButton = "#locator";
    const searchInput = "#address";
    const readyButton = "#dialog > div > div:nth-child(2) > div > button";
    // * END SELECTORS

    // accept cookies
    try {
      await page.waitForSelector(banner, { timeout: 5000 });
      await page.waitForSelector(".css-47sehv", { timeout: 3000 });
      await page.$eval(".css-47sehv", (button) =>
        (button as HTMLInputElement).click()
      );
      await page.click(banner);
    } catch {
      // Handle errors related to selectors not being found
      console.error("No banner detected. Moving on...");
    }

    await page.waitForSelector(viewFilter);
    await page.click(viewFilter);

    await page.waitForSelector(studentFilter);
    await page.click(studentFilter);

    await page.waitForSelector(searchButton);
    await page.click(searchButton);

    await page.waitForSelector(searchInput);
    await page.type(searchInput, rawCity as string);

    await delay(2000);

    await page.keyboard.press("Enter");

    const city = await page.$eval(
      searchInput,
      (el) => (el as HTMLInputElement).value
    );

    // await page.waitForSelector(readyButton);
    //! This works inconsistentently
    await page.waitForNetworkIdle();

    await page.click(readyButton);

    // await page.waitForNetworkIdle();
    // await delay(2000);
    await page.waitForSelector(".menu");

    const days = await page.$$eval(".dayview-filter", (days) => {
      return days.map((day) => day.children.length)[0];
    });

    const data = [];

    for (let i = 0; i < days; i++) {
      const entryObj: entryObject = { date: "", restaurants: [] };

      // This changes the day
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
      const date = new Date(Date.UTC(year, parseInt(month) - 1, parseInt(day)));

      entryObj.date = date.toISOString();

      // Wait for the dishes to load
      //! This fails sometimes. Delay(2000) is slow but works
      await page.waitForSelector(".menu");

      const restaurants = await page.$$eval(
        ".menu",
        (entries, city) => {
          // const cleanUpString = (str: string) =>
          //   str.replace(/\s+/g, " ").trim();
          return entries
            .map((entry: Element) => {
              // const name = cleanUpString(
              //   entry.querySelector("div.item-header > h3")?.textContent || ""
              // );
              const name =
                entry.querySelector("div.item-header > h3")?.textContent || "";
              const dishes = Array.from(entry.querySelectorAll(".dish")).map(
                (menu) => {
                  // const dish = menu?.textContent || "";
                  // // if (dish) {
                  // //   dish = cleanUpString(dish.replace(/[^a-zA-ZåäöÅÄÖ ]/g, ""));
                  // // }

                  // const description =
                  //   menu.querySelector(".menu-item-price")?.textContent || "";
                  // return { dish, description };
                  const cloneMenu = menu.cloneNode(true) as HTMLElement;
                  cloneMenu.querySelectorAll("a")?.forEach((el) => el.remove());
                  const dish = cloneMenu.textContent || "";
                  const description =
                    menu.querySelector(".menu-item-price")?.textContent || "";
                  return { dish, description };
                }
              );
              if (dishes.length === 0) {
                // dishes.push({ dish: "No dishes found", description: "" });
                return null;
              }

              return { city, name, dishes };
            })
            .filter((entry) => entry !== null);
        },
        city
      );
      entryObj.restaurants = [...restaurants];

      data.push(entryObj);
    }

    await browser.close();
    console.log("Data parsed successfully");
    // take time
    console.log(`Parser done in ${Date.now() - startTime}ms`);

    // Save to database

    if (process.env.NODE_ENV !== "test") {
      console.log("Saving data to database");
      await saveDataToDatabase(userId, data);
    }
    console.log(`Function completed in ${Date.now() - startTime}ms`);
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

// * AUTHENTICATION ACTIONS

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
): Promise<string> {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Works for now, but add zod validation here later
  if (!username || !password || !confirmPassword) {
    return "Täytä kaikki kentät.";
  }

  if (password !== confirmPassword) {
    return "Salasanat eivät täsmää.";
  }

  if (username.length < 3) {
    return "Käyttäjätunnuksen on oltava vähintään 3 merkkiä pitkä.";
  }

  if (password.length < 6) {
    return "Salasanan on oltava vähintään 6 merkkiä pitkä.";
  }

  const hashedPassword = await bcrypt.hash(password as string, 10);

  try {
    // Check if the user already exists
    const users =
      await sql<User>`SELECT * FROM users WHERE username = ${username}`;
    if (users.rows.length > 0) {
      console.log("User already exists.");
      return "Käyttäjätunnus on jo käytössä.";
    }

    await sql<User>`
      INSERT INTO users (userid,username, password) VALUES (${uuidv4()},${username}, ${hashedPassword})
    `;
    console.log("User registered successfully.");
    await signIn("credentials", { username, password, redirect: false });
  } catch (error) {
    console.error("Failed to register user:", error);
    return "Tapahtui virhe. Yritä uudelleen myöhemmin.";
  }
  redirect("/tutka");
}
