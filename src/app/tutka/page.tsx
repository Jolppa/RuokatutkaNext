"use client";

import { useState } from "react";
import Form from "../ui/Form";
import ResultList from "../ui/ResultList";

export default function Page() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <ResultList refreshKey={refreshKey} />
      <Form onActionComplete={() => setRefreshKey((prev) => prev + 1)} />
    </>
  );
}
