"use client";

import React, { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const suits = ['♠', '♥', '♦', '♣'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const hardTotalChart = [
  ["H", "D", "D", "D", "D", "H", "H", "H", "H", "H"],  // 9
  ["D", "D", "D", "D", "D", "D", "D", "D", "H", "H"], // 10
  ["D", "D", "D", "D", "D", "D", "D", "D", "D", "H"], // 11
  ["H", "H", "S", "S", "S", "H", "H", "H", "H", "H"], // 12
  ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"], // 13
  ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"], // 14
  ["S", "S", "S", "S", "S", "H", "H", "H", "R", "R"], // 15
  ["S", "S", "S", "S", "S", "H", "H", "R", "R", "R"], // 16
  ["S", "S", "S", "S", "S", "S", "S", "S", "S", "RS"], // 17
]

const softTotalChart = [
  ["H", "H", "H", "D", "D", "H", "H", "H", "H", "H"], // A, 2
  ["H", "H", "H", "D", "D", "H", "H", "H", "H", "H"], // A, 3
  ["H", "H", "D", "D", "D", "H", "H", "H", "H", "H"], // A, 4
  ["H", "H", "D", "D", "D", "H", "H", "H", "H", "H"], // A, 5
  ["H", "D", "D", "D", "D", "H", "H", "H", "H", "H"], // A, 6
  ["DS", "DS", "DS", "DS", "DS", "S", "S", "H", "H", "H"], // A, 7
  ["S", "S", "S", "S", "DS", "S", "S", "S", "S", "S"], // A, 8
  ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"]  // A, 9
]

const getRandomCard = () => {
  const suit = suits[Math.floor(Math.random() * suits.length)];
  const value = values[Math.floor(Math.random() * values.length)];
  return { suit, value };
};

const getInitialHand = () => {
  let hand = [getRandomCard(), getRandomCard()];

  while (calculateHandValue(hand)[0] === 21) {
    hand = [getRandomCard(), getRandomCard()];
  }

  return hand;
};

const calculateHandValue = (hand) => {
  let value = 0;
  let aceCount = 0;
  for (const card of hand) {
    if (card.value === 'A') {
      aceCount++;
      value += 11;
    } else if (['K', 'Q', 'J', '10'].includes(card.value)) {
      value += 10;
    } else {
      value += parseInt(card.value);
    }
  }
  const soft = aceCount > 0 && value <= 21;
  while (value > 21 && aceCount > 0) {
    value -= 10;
    aceCount--;
  }
  return [value, soft];
};

const getCorrectMove = (playerHand, dealerUpCard) => {
  const [playerTotal, soft] = calculateHandValue(playerHand);
  const dealerValue = dealerUpCard.value === 'A' ? 11 - 2 : Math.min(parseInt(dealerUpCard.value) || 10, 10) - 2;

  let bestMove;

  if (soft && playerTotal <= 19) {
    bestMove = softTotalChart[playerTotal - 13][dealerValue];
  } else if (playerTotal >= 17) {
    bestMove = 'S';
  } else if (playerTotal <= 8) {
    bestMove = 'H';
  } else {
    bestMove = hardTotalChart[playerTotal - 9][dealerValue];
  }

  return bestMove;
};

const BlackjackSimulator = () => {
  const [playerHand, setPlayerHand] = useState(getInitialHand());
  const [dealerUpCard, setDealerUpCard] = useState(getRandomCard());
  const [result, setResult] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const handleMove = (move) => {
    const correctMove = getCorrectMove(playerHand, dealerUpCard);
    const isCorrect = correctMove.includes(move);
    setResult({ move, correctMove, isCorrect });
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
    setTimeout(resetHand, 3000);
  };

  const resetHand = () => {
    setPlayerHand(getInitialHand());
    setDealerUpCard(getRandomCard());
    setResult(null);
  };

  return (
    <div className="flex flex-col items-center justify-between h-screen p-4 bg-green-800 text-white">
      <div className="text-2xl font-bold">
        Score: {score.correct}/{score.total}
      </div>
      
      <div className="flex flex-col items-center">
        <div className="mb-8">
          <div className="text-xl mb-2">Dealer&apos;s Hand</div>
          <div className="flex">
            <div className="bg-gray-300 w-16 h-24 rounded mr-2"></div>
            <div className="bg-white text-black w-16 h-24 rounded flex items-center justify-center text-2xl">
              {dealerUpCard.value}{dealerUpCard.suit}
            </div>
          </div>
        </div>
        
        <div>
          <div className="text-xl mb-2">Your Hand</div>
          <div className="flex">
            {playerHand.map((card, index) => (
              <div key={index} className="bg-white text-black w-16 h-24 rounded flex items-center justify-center text-2xl mr-2">
                {card.value}{card.suit}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex space-x-4 mb-8">
        <button onClick={() => handleMove('H')} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Hit
        </button>
        <button onClick={() => handleMove('S')} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          Stand
        </button>
        <button onClick={() => handleMove('D')} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
          Double
        </button>
        <button onClick={() => handleMove('R')} className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
          Surrender
        </button>
      </div>
      
      {result && (
        <Alert className={`mb-4 ${result.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
          <AlertDescription>
            {result.isCorrect ? (
              <div className="flex items-center">
                <ArrowRight className="mr-2" />
                Correct! The right move was {result.correctMove}.
              </div>
            ) : (
              <div className="flex items-center">
                <X className="mr-2" />
                Incorrect. The right move was {result.correctMove}.
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default BlackjackSimulator;