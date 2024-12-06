const browser = await puppeteer.launch({
  headless: true,
  // slowMo: 100,
  // devtools: true,
});
const page = await browser.newPage();

try {
  await page.goto("https://www.lounaat.info/turkuamk");
  // wait for the page to load
  await page.waitForSelector(".css-47sehv");
  // accept cookies
  await page.$eval(".css-47sehv", (button) => button.click());

  const searchWord = req.body.search;
  if (!searchWord) {
    await browser.close();
    return res.status(400).json({ error: "Search query missing" });
  }
  const searches = { searchWord, entries: [] };

  // Get amount of days from amount of children
  const days = await page.$$eval(".dayview-filter", (days) => {
    return days.map((day) => day.children.length)[0];
  });

  // Loop through each day dishes
  for (let i = 0; i < days; i++) {
    // let entryObject = { date: "", entries: [] };
    let entryObject = { date: "", searchResults: [] };
    if (i !== 0) {
      await page.$eval("#day-filter", (dayFilter) => dayFilter.click());
      // wait for the day to load
      await page.waitForSelector(
        `.dayview-filter > li:nth-child(${i + 1}) > a`
      );
      const day = await page.$(`.dayview-filter > li:nth-child(${i + 1}) > a`);
      day.evaluate((day) => {
        day.click();
      });
    }

    const dateElement = await page.$('span[data-lounaat-filter="day-text"]');
    // current date
    let date = await page.evaluate((elem) => elem.textContent, dateElement);

    date = date.trim();
    let year = new Date().getFullYear();
    date = `${date}${year}`;
    entryObject.date = date;

    // Wait for the dishes to load
    await page.waitForSelector(".menu-item");

    // List of date results
    // Structure = [{dishName, restaurantName}]
    let listOfResults = await page.$$eval(
      ".menu",
      (restaurants, searchWord) => {
        //! Return this list
        let lst = [];
        const cleanUpString = (str) => str.replace(/\s+/g, " ").trim();
        restaurants.forEach((restaurant) => {
          let restaurantName =
            restaurant.querySelector(".item-header").textContent;

          // Clean up the restaurant name
          restaurantName = cleanUpString(
            restaurantName.replace(/[^a-zA-ZåäöÅÄÖ ]/g, "")
          );

          //! Issue here: Sometimes the actual dish name is in ".dish" and sometimes in ".info"
          //! Temp fix: Check both
          //! There is for sure a better way to do this, but this works for now
          const infoSections = [...restaurant.querySelectorAll(".info")];

          if (infoSections.length > 0) {
            infoSections.forEach((infoSection) => {
              let dishName = infoSection.textContent;

              // Clean up the dish name
              dishName = dishName.replace(/[^\p{L}\s]/gu, " ").trim();
              dishName = dishName
                .replace(/\b[a-zåäöÅÄÖ]\b|\bklo\b/g, "")
                .trim();
              dishName = cleanUpString(dishName);

              if (dishName.toLowerCase().includes(searchWord.toLowerCase())) {
                lst.push({ dishName, restaurantName });
              }
            });
          }

          const dishes = [...restaurant.querySelectorAll(".dish")];
          // Dish name clean up and add it to the searchResults array if it includes the searchWord
          dishes.forEach((dish) => {
            let dishName = dish.textContent;

            // Clean up the dish name
            //! Possible issue here: Might still be removing "ö" letter, but not "ä"
            dishName = dishName.replace(/[^\p{L}\s]/gu, " ").trim();
            dishName = dishName.replace(/\b[a-zåäöÅÄÖ]\b|\bklo\b/g, "").trim();
            dishName = cleanUpString(dishName);

            if (dishName.toLowerCase().includes(searchWord.toLowerCase())) {
              lst.push({ dishName, restaurantName });
            }
          });
        });
        return lst;
      },

      searchWord
    );

    if (listOfResults.length > 0) {
      entryObject.searchResults.push(...listOfResults);
      searches.entries.push(entryObject);
    }
  }
  await browser.close();
  // Save the search to the database

  // {searchWord, entries: [{date, searchResults: [{dishName, restaurantName}]}]}
  if (req.user) {
    for (const entry of searches.entries) {
      const search = await Dish.findOne({
        searchWord: searchWord,
        user: req.user.userId,
      });
      if (search) {
        let entryExists = false;
        for (const elem of search.entries) {
          if (elem.date === entry.date) {
            entryExists = true;
            // Check if the entry already exists
            for (const newResult of entry.searchResults) {
              const resultExists = elem.searchResults.some(
                (existingResult) =>
                  existingResult.dishName === newResult.dishName &&
                  existingResult.restaurantName === newResult.restaurantName
              );
              if (!resultExists) {
                elem.searchResults.push(newResult);
              }
            }
          }
        }

        if (!entryExists) {
          search.entries.push(entry);
        }

        await search.save();
      } else {
        // if the search doesn't exist, create a new search
        const newSearch = new Dish({
          searchWord,
          entries: [entry],
          user: req.user.userId,
        });
        await newSearch.save();

        const user = await User.findById(req.user.userId);
        user.dishes.push(newSearch._id);
        await user.save();
      }
    }
  }
  res.json({ searches });
} catch (error) {
  await browser.close();
  console.log(error);
  res.status(500).json({ error: "Internal server error" });
}
