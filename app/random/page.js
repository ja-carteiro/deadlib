'use client';

import { Suspense, useEffect, useState } from "react";

export default function Home() {
  const [randomBook, setRandomBook] = useState(null);

  useEffect(() => {
    const fetchRandomBook = async () => {
      try {
        const response = await fetch("https://openlibrary.org/subjects/horror.json?limit=1");
        const data = await response.json();
        const total = data.work_count;
        const randomOffset = Math.floor(Math.random() * total);
        const randomResponse = await fetch(
          `https://openlibrary.org/subjects/horror.json?limit=1&offset=${randomOffset}`
        );
        const randomData = await randomResponse.json();
        const book = randomData.works[0];

        setRandomBook(book);
      } catch (error) {
        console.error("Error when fetching books:", error);
      }
    };

    fetchRandomBook();
  }, []);

  return (
    <div>
      <h1>
        {randomBook ? randomBook.title : "Foreseeing..."}
      </h1>
    </div>
  );
}