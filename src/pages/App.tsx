import React, { KeyboardEvent, useEffect, useState } from 'react';
import styles from './App.module.css';
import { clsx } from "clsx";

export default function App() {
  const [wordList, setWordList] = useState<string[]>([]);
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState<string[]>(Array(6).fill(''));
  const [currentRow, setCurrentRow] = useState(0);
  const [showAnimation, setShowAnimation] = useState<'win' | 'wrong' | null>(null);

  async function fetchWordList() {
    const wordListJson = await fetch('/word-list.json');
    const _wordList = await wordListJson.json();
    setWordList(_wordList);
  }

  useEffect(() => {
    void fetchWordList();
  }, []);

  useEffect(() => {
    if (wordList.length > 0 && targetWord === '') {
      const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
      setTargetWord(randomWord);
      console.log(randomWord);
    }
  }, [wordList]);

  const triggerAnimation = (type: 'win' | 'wrong') => {
    setShowAnimation(type);
    setTimeout(() => setShowAnimation(null), 2000); // Assuming the animation lasts 4 seconds
  };

  const handleInput = (event: KeyboardEvent<HTMLDivElement>) => {
    const newGuesses = [...guesses];
    if (event.key === 'Enter') {
      const guess = guesses[currentRow];
      if (guess === targetWord) {
        setCurrentRow(currentRow + 1);
        triggerAnimation('win');
      } else if (wordList.includes(guess)) {
        setCurrentRow(currentRow + 1);
      } else {
        triggerAnimation('wrong');
      }
    } else if (event.key === 'Backspace') {
      newGuesses[currentRow] = newGuesses[currentRow].slice(0, -1);
      setGuesses(newGuesses);
    } else if (event.key.length === 1 && newGuesses[currentRow].length < 5) {
      newGuesses[currentRow] += event.key.toLowerCase();
      setGuesses(newGuesses);
    }
  }

  function checkLetter(letter: string, index: number) {
    console.log(targetWord);
    const wordIndex = index % 5;
    const row = Math.floor(index / 5);
    if (currentRow <= row) {
      return;
    } else if (letter === targetWord[wordIndex]) {
      return styles.correct;
    } else if (targetWord.includes(letter)) {
      return styles.inWord;
    } else {
      return styles.incorrect;
    }
  }

  return (
    <div className={styles.container} onKeyDown={handleInput} tabIndex={0}>
      <h1>React Wordle</h1>
      <div className={clsx(styles.grid, showAnimation === 'wrong' && styles.vibrateAnimation)}>
        {guesses
          .flatMap((guess) => guess.padEnd(5, " ").split(''))
          .map((letter, index) => (
            <div
              key={index}
              className={clsx(styles.letter, checkLetter(letter, index))}
            >
              {letter.toUpperCase()}
            </div>
          ))}
      </div>
      {showAnimation === 'win' && <div className={styles.win}>You Win</div>}
    </div>
  );
};