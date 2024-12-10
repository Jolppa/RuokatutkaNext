"use client";

import { useState } from "react";
import Form from "./Form";
import ResultList from "./ResultList";

export default function Content() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <ResultList refreshKey={refreshKey} />
      <Form onActionComplete={() => setRefreshKey((prev) => prev + 1)} />
    </>
  );
}
