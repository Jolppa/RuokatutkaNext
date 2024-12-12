import { ResultListData } from "./types";
import { GroupedData } from "./types";

export const groupDataByDateAndRestaurant = (data: ResultListData) => {
  const groupedData: GroupedData = {};
  data?.forEach((item) => {
    const date = item.date.split("T")[0];
    if (!groupedData[date]) {
      groupedData[date] = {};
    }
    if (!groupedData[date][item.restaurant_name]) {
      groupedData[date][item.restaurant_name] = {
        city: item.city,
        dishes: [],
      };
    }
    groupedData[date][item.restaurant_name].dishes.push({
      id: item.id,
      dish_name: item.dish_name,
      description: item.description,
    });
  });
  return groupedData;
};

export const filterRestaurants = (
  restaurants: GroupedData[string],
  searchTerm: string,
  selectedRestaurant: string,
  selectedCity: string
) => {
  const lowerSearchTerm = searchTerm.toLowerCase();

  return Object.entries(restaurants).reduce(
    (result, [restaurantName, restaurantData]) => {
      // Filter by selected restaurant
      if (selectedRestaurant && restaurantName !== selectedRestaurant) {
        return result;
      }

      // Filter by selected city
      if (selectedCity && restaurantData.city !== selectedCity) {
        return result;
      }

      // Search term filtering
      const matchesSearchTerm =
        restaurantName.toLowerCase().includes(lowerSearchTerm) ||
        restaurantData.city.toLowerCase().includes(lowerSearchTerm) ||
        restaurantData.dishes.some((dish) =>
          dish.dish_name.toLowerCase().includes(lowerSearchTerm)
        );

      if (matchesSearchTerm || !searchTerm.trim()) {
        result[restaurantName] = restaurantData;
      }

      return result;
    },
    {} as GroupedData[string]
  );
};

export const getSortedDates = (
  groupedData: GroupedData,
  sortAscending: boolean
) => {
  return Object.keys(groupedData).sort((a, b) => {
    const comparison = new Date(a).getTime() - new Date(b).getTime();
    return sortAscending ? comparison : -comparison;
  });
};

export const getDateColor = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date.getTime() === today.getTime()) return "bg-green-800/50";
  if (date < today) return "bg-red-800/50";
  return "bg-yellow-800/50";
};

export const highlightText = (text: string, highlight: string) => {
  if (!highlight.trim()) {
    return text;
  }
  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span className="bg-yellow-300 text-black" key={index}>
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};
