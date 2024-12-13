"use client";

import { useState, useEffect } from "react";
import { fetchData } from "../util/data";
import { ResultListData, GroupedData } from "../util/types";
import {
  groupDataByDateAndRestaurant,
  filterRestaurants,
  getSortedDates,
  getDateColor,
  highlightText,
} from "../util/dataUtils";

import FilterControls from "./FilterControls";
import PaginationControls from "./PaginationControls";

interface ResultListProps {
  refreshKey: number;
}

const ResultList = ({ refreshKey }: ResultListProps) => {
  const [sortAscending, setSortAscending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<ResultListData>(null);
  const [groupedData, setGroupedData] = useState<GroupedData>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [restaurantOptions, setRestaurantOptions] = useState<string[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");

  // Fetch and group data whenever refreshKey changes
  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      const result = await fetchData();
      setData(result);
      setLoading(false);
      const grouped = groupDataByDateAndRestaurant(result);
      setGroupedData(grouped);
      setCurrentPage(1);

      // Extract unique restaurants and cities
      const restaurantsSet = new Set<string>();
      const citiesSet = new Set<string>();

      result?.forEach((item) => {
        if (item.restaurant_name) restaurantsSet.add(item.restaurant_name);
        if (item.city) citiesSet.add(item.city);
      });

      setRestaurantOptions(Array.from(restaurantsSet).sort());
      setCityOptions(Array.from(citiesSet).sort());
    };
    getData();
  }, [refreshKey]);

  // Filter and sort data
  const filteredGroupedData: GroupedData = {};
  Object.entries(groupedData).forEach(([date, restaurants]) => {
    const filteredRestaurants = filterRestaurants(
      restaurants,
      searchTerm,
      selectedRestaurant,
      selectedCity
    );
    if (Object.keys(filteredRestaurants).length > 0) {
      filteredGroupedData[date] = filteredRestaurants;
    }
  });

  const sortedDates = getSortedDates(filteredGroupedData, sortAscending);

  // Pagination logic
  const totalPages = Math.max(sortedDates.length, 1);
  const currentDate = sortedDates[currentPage - 1];

  // Adjust currentPage if it exceeds totalPages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (loading) {
    return <p>Haetaan...</p>;
  }

  return (
    <section className="border shadow-2xl rounded-lg p-4 w-1/2">
      {/* Data Display */}
      {data && currentDate ? (
        <div
          key={currentDate}
          className={`my-4 p-4 rounded-lg ${getDateColor(currentDate)}`}
        >
          <h2 className="text-xl font-bold mb-4">
            {new Date(currentDate).toLocaleDateString("fi-FI")}
          </h2>
          <div className="h-96 overflow-y-auto">
            {Object.entries(filteredGroupedData[currentDate]).map(
              ([restaurantName, restaurantData]) => (
                <div key={restaurantName} className="mb-6">
                  <h3 className="text-lg font-bold">
                    {highlightText(restaurantName, searchTerm)}
                  </h3>
                  <p className="text-sm text-gray-400">{restaurantData.city}</p>
                  <ul className="ml-4 mt-2 list-disc">
                    {restaurantData.dishes.map((dish) => (
                      <li key={dish.id} className="mb-2">
                        <p className="text-md font-semibold">
                          {highlightText(dish.dish_name, searchTerm)}
                        </p>
                        {dish.description && (
                          <p className="text-sm text-gray-400">
                            {highlightText(dish.description, searchTerm)}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            )}
          </div>
        </div>
      ) : (
        <p>Ei tuloksia.</p>
      )}

      {/* Filter Controls */}
      <FilterControls
        sortAscending={sortAscending}
        setSortAscending={(value) => {
          setSortAscending(value);
          setCurrentPage(1);
        }}
        searchTerm={searchTerm}
        setSearchTerm={(value) => {
          setSearchTerm(value);
          setCurrentPage(1);
        }}
        restaurantOptions={restaurantOptions}
        selectedRestaurant={selectedRestaurant}
        setSelectedRestaurant={(value) => {
          setSelectedRestaurant(value);
          setCurrentPage(1);
        }}
        cityOptions={cityOptions}
        selectedCity={selectedCity}
        setSelectedCity={(value) => {
          setSelectedCity(value);
          setCurrentPage(1);
        }}
      />

      {/* Pagination Controls */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </section>
  );
};

export default ResultList;
