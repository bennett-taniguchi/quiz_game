import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { generate, count } from "random-words";
import Head from "next/head";
import synonyms from 'synonyms'
import { useEffect, useState } from "react";

export default function Home() {
  const [guess, setGuess] = useState("");
  const [correct, setCorrect] = useState<Map<string, number>>(new Map());
  const [covered, setCovered] = useState([]);
  const [dictionary, setDictionary] = useState<Map<string, number[]>>();

  const [score, setScore] = useState(0);
  const [secretKeyword, setSecretKeyword] = useState("");
  const [originalArray, setOriginalArray] = useState([]);
  const [finished, setFinished] = useState(false);

  const [hint, setHint] = useState("");

  function changeBlocks(val) {
    let r = dictionary.get(val);
    let current = [...covered];
    r.forEach((entry) => (current[entry] = val + " "));
    setCovered(current);
  }

 
  function uncoverAll() {
    console.log("correct answer");
    let blocks = covered;
    for (let i = 0; i < blocks.length; i++) {
      blocks[i] = originalArray[i] + " ";
    }
    setCovered(blocks);
    setFinished(true);
  }

  function onGuess(val) {
    
    if (val.toLocaleLowerCase() == (secretKeyword) ) {
      uncoverAll();
      setScore(score + 1);
    }
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
    let lowered = (guess + e.nativeEvent.key).toLocaleLowerCase()
    if (e.nativeEvent.key == "Enter") setGuess("");
    if (
      dictionary.has(lowered) &&
      !correct.has(lowered)
    ) {
      onGuess(guess + e.nativeEvent.key);
    }
  }

  async function queryKeyword() {
    setFinished(false);
    setGuess('')
    let randomWord = generate(1);
  
    const res = await fetch("/api/wikipedia/get/" + randomWord, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();

    let parsed = JSON.parse(data.message).extract.split(" ");
    setOriginalArray(parsed);

 
    setSecretKeyword((JSON.parse(data.message).title + "").toLocaleLowerCase());

    console.log(parsed)
    if(parsed.length < 10 || JSON.parse(data.message).description == 'Topics referred to by the same term') {
     setHint((synonyms(secretKeyword).n).join(', '))
    } else {
      setHint(JSON.parse(data.message).description);
    }
   
    let arr = [];
    let dict = new Map();
    parsed.forEach((s, i) => {
      if (dict.has(s)) {
        let val = dict.get(s);
        val.push(i);
        dict.set(s.toLowerCase(), val);
      } else {
        dict.set(s.toLowerCase(), [i]);
      }
      const replaced = s.replace(/./g, "█");

      arr.push(replaced + " ");
    });
    setCovered(arr);
    setDictionary(dict);
  }

  useEffect(() => {}, [covered, dictionary]); // initial covering

  return (
    <div>
      <Head>
        <title>Create Next App</title>

        <link rel="icon" href="/favicon.ico" />

        <link
          rel="stylesheet"
          href="https://en.wikipedia.org/w/load.php?debug=false&lang=en&modules=site.styles&only=styles&skin=vector"
        />
      </Head>

      <h1 className="text-center text-3xl pb-5">Word Guessing Game</h1>

      <Card>
        <div
          id="wiki-content"
          className="grid grid-cols-1 gap-4 justify-items-center p-100"
        >
          <div className="text-center text-sm py-5 px-10">{covered}</div>

          <div className="w-1/2">
            <Input
              className=" items-center"
              type="form"
              value={guess}
              placeholder="Guess"
              onKeyDown={handleKeyPress}
              onChange={(e) => setGuess(e.target.value)}
            />
          </div>
          <p>Hint: Score: {score}</p>
          {finished ? (
            <p>
              Congrats the word was <i>{secretKeyword}</i> Press the Button to
              play again
            </p>
          ) : (
            <p>Hint: {hint}</p>
          )}
          <div>
            <Button variant="outline" onClick={() => queryKeyword()}>
              New Secret Word
            </Button>
            <Button variant="outline" onClick={() => uncoverAll()}>
              Reveal
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
