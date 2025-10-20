"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import * as BABYLON from "@babylonjs/core";

export default function RandomPage() {
  const [randomBook, setRandomBook] = useState(null);

  useEffect(() => {
    // não tornar a função useEffect async diretamente
    const run = async () => {
      if (typeof window === "undefined") return;

      // Primeiro: buscar o livro
      const fetchRandomBook = async () => {
        try {
          const response = await fetch(
            "https://openlibrary.org/subjects/horror.json?limit=1"
          );
          const data = await response.json();
          const total = data.work_count || 1;
          const randomOffset = Math.floor(Math.random() * total);
          const randomResponse = await fetch(
            `https://openlibrary.org/subjects/horror.json?limit=1&offset=${randomOffset}`
          );
          const randomData = await randomResponse.json();
          const book = randomData.works ? randomData.works[0] : null;
          return book;
        } catch (error) {
          console.error("Error when fetching books:", error);
          return null;
        }
      };

      const book = await fetchRandomBook();
      setRandomBook(book);

      // Depois de ter o book (ou null) inicializa Babylon
      const canvas = document.getElementById("renderCanvas");
      if (!canvas) {
        console.error("Canvas não encontrado");
        return;
      }

      const engine = new BABYLON.Engine(canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true,
      });

      const createScene = () => {
        const scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color4(0, 0, 0, 0); // fundo transparente

        const camera = new BABYLON.FreeCamera(
          "camera1",
          new BABYLON.Vector3(0, 1.5, -4),
          scene
        );
        camera.setTarget(new BABYLON.Vector3(0, 1, 0));
        camera.attachControl(canvas, true);

        const light = new BABYLON.HemisphericLight(
          "hlight",
          new BABYLON.Vector3(0, 1, 0),
          scene
        );
        light.intensity = 1.5;

        // Box (lombada + verso)
        const box = BABYLON.MeshBuilder.CreateBox(
          "box",
          { width: 1.5, height: 2, depth: 0.4 },
          scene
        );
        box.position.y = 1;
        box.rotation.y = 0.5;

        const cylinder = BABYLON.MeshBuilder.CreateCylinder("cylinder", {
          height: box.height,
          diameter: 0.4,
        });
        cylinder.parent = box;
        cylinder.position = new BABYLON.Vector3(0.75 , 0, 0);

        const sideMat = new BABYLON.StandardMaterial("sideMat", scene);
        sideMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
        sideMat.specularColor = new BABYLON.Color3(0, 0, 0);
        box.material = sideMat;
        cylinder.material = sideMat;

        // Se tiver capa, cria um plane frontal com a textura
        if (book && book.cover_id) {
          const coverUrl = `https://covers.openlibrary.org/b/id/${book.cover_id}-L.jpg`;

          const coverMat = new BABYLON.StandardMaterial("coverMat", scene);
          coverMat.diffuseTexture = new BABYLON.Texture(coverUrl, scene);
          coverMat.specularColor = new BABYLON.Color3(0, 0, 0);
          coverMat.backFaceCulling = false; // mostrar dos dois lados se necessário

          // Plane que ficará levemente à frente da face frontal do box
          const coverPlane = BABYLON.MeshBuilder.CreatePlane(
            "coverPlane",
            { width: 1.42, height: 1.92 },
            scene
          );
          // posicione o plane um pouco à frente no eixo Z relativo ao box
          // como box.depth = 0.4, metade é 0.2; usa 0.21 para evitar z-fighting
          coverPlane.position = new BABYLON.Vector3(0, 0, -0.21);
          coverPlane.parent = box; // prende à caixa para girar junto
          coverPlane.material = coverMat;
        }

        return scene;
      };

      const scene = createScene();

      engine.runRenderLoop(() => {
        scene.render();
      });

      window.addEventListener("resize", () => engine.resize());
    };

    run();

    // cleanup opcional quando o componente desmontar
    return () => {
      const canvas = document.getElementById("renderCanvas");
      if (canvas) {
        // tenta limpar listeners, se precisarmos fazer mais clean up podemos melhorar
        window.removeEventListener("resize", () => {});
      }
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        textAlign: "center",
        color: "red",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        paddingTop: 24,
        background: "transparent",
      }}
    >
      <canvas
        id="renderCanvas"
        style={{
          width: "60%",
          height: "60vh",
          backgroundColor: "transparent",
          display: "block",
        }}
      ></canvas>

      <h1 style={{ color: "white" }}>
        {randomBook ? randomBook.title : "Foreseeing..."} <br />
        {randomBook && randomBook.first_publish_year} <br />
        {randomBook && randomBook.cover_id && (
          <Image
            src={`https://covers.openlibrary.org/b/id/${randomBook.cover_id}-L.jpg`}
            alt={randomBook.title}
            width={200}
            height={300}
            priority
          />
        )}
        <br />
        {randomBook && (
          <a
            href={"https://openlibrary.org/" + randomBook.key}
            style={{ color: "red", textDecoration: "none" }}
            target="_blank"
            rel="noopener noreferrer"
          >
            Go to Book Page
          </a>
        )}
      </h1>
    </div>
  );
}
