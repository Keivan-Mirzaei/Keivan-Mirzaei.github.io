# Conditional Probabilities and Expectations

## Introduction

To deeply understand the concept of conditional probabilities and expectations, one needs to first understand the necessity behind these definitions. To give a good example of the situation, let us suppose that an imaginary experiment is set. A machine flips a fair coin up to 5 times. Before each round you need to decide if you want to play the following round and if yes, how much you bet. At the first glance, it might seem like you have an advantage over the opponent (which in this case happens to be a machine) as you are the one who declares the finish (almost) and the pot. Speculations aside, who has the upper hand in this seemingly boring game?

## An Analysis of the Game

To begin the analysis of the game above, we need to tailor a probability space for this scenario. As it is pretty clear, we can define our sample space to be $\Omega = {\{H, T\}}^{5}$ where $H$ stands for heads and $T$ stands for tails (we can suppose that the coin flip continues even after we quit and stops at the 5^th^). A scenario in this setting is just a sequence of heads and tails; something like $\omega=(T, H, H, H, T)$.

What is the best we can get 