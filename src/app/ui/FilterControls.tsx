interface FilterControlsProps {
  sortAscending: boolean;
  setSortAscending: (value: boolean) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  restaurantOptions: string[];
  selectedRestaurant: string;
  setSelectedRestaurant: (value: string) => void;
  cityOptions: string[];
  selectedCity: string;
  setSelectedCity: (value: string) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  sortAscending,
  setSortAscending,
  searchTerm,
  setSearchTerm,
  restaurantOptions,
  selectedRestaurant,
  setSelectedRestaurant,
  cityOptions,
  selectedCity,
  setSelectedCity,
}) => {
  return (
    <div className="flex flex-col gap-4 mb-4">
      {/* Search and Sort Controls */}
      <div className="flex items-center">
        <button
          onClick={() => setSortAscending(!sortAscending)}
          className="px-4 py-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600"
        >
          Päivämäärä {sortAscending ? "↑" : "↓"}
        </button>
        <input
          type="text"
          placeholder="Haku"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="ml-2 px-4 py-2 border rounded-lg text-black"
        />
      </div>

      {/* Filter Selection Section */}
      <div className="flex items-center gap-4">
        <select
          value={selectedRestaurant}
          onChange={(e) => setSelectedRestaurant(e.target.value)}
          className="px-4 py-2 border rounded-lg text-black"
        >
          <option value="">Kaikki ravintolat</option>
          {restaurantOptions.map((restaurant) => (
            <option key={restaurant} value={restaurant}>
              {restaurant}
            </option>
          ))}
        </select>

        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="px-4 py-2 border rounded-lg text-black"
        >
          <option value="">Kaikki kaupungit</option>
          {cityOptions.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterControls;
