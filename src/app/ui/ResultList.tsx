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

interface ResultListProps {
  refreshKey: number;
}

const ResultList = ({ refreshKey }: ResultListProps) => {
  const [sortAscending, setSortAscending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<ResultListData>(null);
  const [groupedData, setGroupedData] = useState<GroupedData>({});
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch and group data whenever refreshKey changes
  useEffect(() => {
    const getData = async () => {
      const result = await fetchData();
      setData(result);
      const grouped = groupDataByDateAndRestaurant(result);
      setGroupedData(grouped);
      setCurrentPage(1); // Reset to first page when new data arrives
    };
    getData();
  }, [refreshKey]);

  // Filter and sort data
  const filteredGroupedData: GroupedData = {};
  Object.entries(groupedData).forEach(([date, restaurants]) => {
    const filteredRestaurants = filterRestaurants(restaurants, searchTerm);
    if (Object.keys(filteredRestaurants).length > 0) {
      filteredGroupedData[date] = filteredRestaurants;
    }
  });

  const sortedDates = getSortedDates(filteredGroupedData, sortAscending);

  // Pagination logic
  const totalPages = Math.max(sortedDates.length, 1); // Ensure at least 1 page
  const currentDate = sortedDates[currentPage - 1];

  // This will adjust currentPage if it exceeds totalPages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <section className="border-white border-2 rounded-lg p-4 w-1/2">
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
      {/* Search and Sort Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <button
            onClick={() => {
              setSortAscending(!sortAscending);
              setCurrentPage(1); // Reset to first page when sorting changes
            }}
            className="px-4 py-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600"
          >
            Päivämäärä {sortAscending ? "↑" : "↓"}
          </button>
          <input
            type="text"
            placeholder="Haku"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page when search term changes
            }}
            className="ml-2 px-4 py-2 border rounded-lg text-black"
          />
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600 disabled:bg-gray-400"
            >
              Edellinen
            </button>
            <span className="px-4 py-2">
              Sivu {currentPage} / {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600 disabled:bg-gray-400"
            >
              Seuraava
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ResultList;
