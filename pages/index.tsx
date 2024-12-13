import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Html } from "next/document";
import Head from "next/head";
import Link from "next/link";
import Script from "next/script";

import { useEffect, useState } from "react";

export default function Home() {
  const [res, setRes] = useState("");

  const [guess, setGuess] = useState("");
  const [correct, setCorrect] = useState<Map<string, number>>(new Map());
  const [string, setString] = useState(
    "Chocolate is a food made from roasted and ground cocoa beans that can be a liquid, solid, or paste, either on its own or as a flavoring in other foods. The cacao tree has been used as a source of food for at least 5,300 years, starting with the Mayo-Chinchipe culture in what is present-day Ecuador. Later, Mesoamerican civilizations consumed cacao beverages, of which one, chocolate, was introduced to Europe in the 16th century.The seeds of the cacao tree (Theobroma cacao) have an intense bitter taste and must be fermented to develop the flavor. After fermentation, the seeds are dried, cleaned, and roasted. The shell is removed to produce nibs, which are then ground to cocoa mass, unadulterated chocolate in rough form. Once the cocoa mass is liquefied by heating, it is called chocolate liquor. The liquor may also be cooled and processed into its two components: cocoa solids and cocoa butter. Baking chocolate, also called bitter chocolate, contains cocoa solids and cocoa butter in varying proportions without any added sugar. Powdered baking cocoa, which contains more fiber than cocoa butter, can be processed with alkali to produce Dutch cocoa. Much of the chocolate consumed today is in the form of sweet chocolate, a combination of cocoa solids, cocoa butter, and added vegetable oils and sugar. Milk chocolate is sweet chocolate that additionally contains milk powder. White chocolate contains cocoa butter, sugar, and milk, but no cocoa solids. Chocolate is one of the most popular food types and flavors in the world, and many foodstuffs involving chocolate exist, particularly desserts, including cakes, pudding, mousse, brownies, and chocolate chip cookies. Many candies are filled with or coated with sweetened chocolate. Chocolate bars, either made of solid chocolate or other ingredients coated in chocolate, are eaten as snacks. Gifts of chocolate molded into different shapes (such as eggs, hearts, and coins) are traditional on certain Western holidays, including Christmas, Easter, Valentine's Day, and Hanukkah. Chocolate is also used in cold and hot beverages, such as chocolate milk and hot chocolate, and in some alcoholic drinks, such as crème de cacao.".split(
      " "
    )
  );
  const [covered, setCovered] = useState([]);
  const [dictionary, setDictionary] = useState<Map<string, number[]>>();

  function changeBlocks(val) {
    let r = dictionary.get(val);

    let current = [...covered];
    r.forEach((entry) => (current[entry] = val));
    setCovered(current);
  }

  function onGuess(val) {
    if (dictionary.has(val)) {
      let d = correct;
      if (correct && !correct.has(val)) {
        d.set(val, 1);
      }
      setCorrect(d);
      changeBlocks(val);
    }
  }
  function handleKeyPress(e) {
    if (e.nativeEvent.key == "Enter") setGuess("");
    if (
      dictionary.has(guess + e.nativeEvent.key) &&
      !correct.has(guess + e.nativeEvent.key)
    ) {
      console.log("wow");
      onGuess(guess + e.nativeEvent.key);
    }
  }

  function replaceContentWithBlocks(htmlString) {
    return htmlString.replace(
      /<([a-zA-Z0-9]+)>(.*?)<\/\1>/g,
      (match, tag, content) => {
        // Create a block string of the same length as the content
        const blockContent = "█".repeat(content.length);
        // Return the tag with the replaced content
        return `<${tag}>${blockContent}</${tag}>`;
      }
    );
  }
  async function clickButton() {
    const res = await fetch("/api/wikipedia/get/", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();

    setRes(data.message.replace(/\\(?!n)/g, "").replace(/\\n/g, "\n"));
  }

  useEffect(() => {
    let arr = [];
    let dict = new Map();
    string.forEach((s, i) => {
      if (dict.has(s)) {
        let val = dict.get(s);
        val.push(i);
        dict.set(s, val);
      } else {
        dict.set(s, [i]);
      }
      const replaced = s.replace(/./g, "█");

      arr.push(replaced + " ");
    });
    setCovered(arr);
    setDictionary(dict);
  }, []); // initial covering

  useEffect(() => {
    const root = document.getElementsByClassName("mw-parser-output");
    let children;
    let nodeNames = new Map();
    if (root.length != 0) {
      children = root[0].children;
    }

    if (children && children.length != 0)
      for (const child of children) {
        if (!nodeNames.has(child.nodeName)) {
          nodeNames.set(child.nodeName, [
            "name",
            child.nodeName,
            "type",
            child.nodeType,
            "content",
            child.textContent,
          ]);
        }

        if (child.nodeType === 1) {
          // Check if the node is an element node

          if (
            [
              "P",
              "H1",
              "H2",
              "H3",
              "SPAN",
              "A",
              "LINK",
              "A",
              "FIGURE",
              "TABLE",
              "UL",
            ].includes(child.nodeName)
          ) {
            // Check if the element is text-based
            //console.log('Text-based node:', child.nodeName, 'with content:', child.textContent);
            //child.textContent="ARF"
            // alter valid text in here
          }
        }
        if (child.className == "navbox" || child.role == "navigation")
          child.remove();
        if (
          child.nodeType === 1 &&
          child.textContent.includes("References") &&
          child.textContent.includes("Contents")
        ) {
          //nav table
          child.remove();
        }
      }

    let reflist = document.getElementsByClassName("reflist");
    if (reflist.length > 0) {
      // Convert HTMLCollection to Array and iterate
      Array.from(reflist).forEach((reflist) => reflist.remove());
    }

    let refbegin = document.getElementsByClassName("refbegin");
    if (refbegin.length > 0) {
      // Convert HTMLCollection to Array and iterate
      Array.from(refbegin).forEach((refbegin) => refbegin.remove());
    }

    let infobox = document.getElementsByClassName("infobox");
    if (infobox.length > 0) {
      // Convert HTMLCollection to Array and iterate
      Array.from(infobox).forEach((infobox) => infobox.remove());
    }
  }, [correct, covered, guess]);

  return (
    <div>
      <Head>
        <title>Create Next App</title>

        <link rel="icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://en.wikipedia.org/w/load.php?modules=site&skin=vector"
        />
        <link
          rel="stylesheet"
          href="https://en.wikipedia.org/w/load.php?debug=false&lang=en&modules=site.styles&only=styles&skin=vector"
        />
        <link
          rel="stylesheet"
          href="/w/load.php?lang=en&amp;modules=ext.cite.styles%7Cext.uls.interlanguage%7Cext.visualEditor.desktopArticleTarget.noscript%7Cext.wikimediaBadges%7Cext.wikimediamessages.styles%7Cjquery.makeCollapsible.styles%7Cskins.vector.icons%2Cstyles%7Cskins.vector.search.codex.styles%7Cwikibase.client.init&amp;only=styles&amp;skin=vector-2022"
        />
      </Head>

      <p className="text-sm">
        <div
          dangerouslySetInnerHTML={{
            __html: res,
          }}
        />
      </p>
      <Card>
        <div
          id="wiki-content"
          className="grid grid-cols-1 gap-4 justify-items-center p-100"
        >
          {covered}

          <Input type="form" placeholder="Search" />
          <Input
            type="form"
            value={guess}
            placeholder="Guess"
            onKeyDown={handleKeyPress}
            onChange={(e) => setGuess(e.target.value)}
          />
          <p>
            Hint: Categories: Aphrodisiac foods Baking Candy Cooking Desserts
            Mesoamerican cuisine Mexican cuisine Snack foods
          </p>
          <Button variant="outline" onClick={() => clickButton()}>
            Click to Guess
          </Button>
        </div>
      </Card>
    </div>
  );
}
