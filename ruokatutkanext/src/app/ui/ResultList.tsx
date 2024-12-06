import { NextPage } from "next";
import { fetchData } from "../util/data";

const ResultList: NextPage = async () => {
  const data = await fetchData();
  // console.log(data);

  //! Need to display the dishes categorized by restaurant, date, and city
  return (
    <section className="border-white border-2 rounded-lg p-4 w-1/2 max-h-96 my-12 overflow-y-scroll">
      {data && data.length > 0 ? (
        data.map((item) => (
          <div key={item.id} className="flex flex-col">
            <h2 className="text-lg font-bold">{item.restaurant_name}</h2>
            <p className="text-sm">{item.dish_name}</p>
            <p className="text-sm">{item.description}</p>
          </div>
        ))
      ) : (
        <p>Hakuja ei löytynyt</p>
      )}
    </section>
  );
};

export default ResultList;
