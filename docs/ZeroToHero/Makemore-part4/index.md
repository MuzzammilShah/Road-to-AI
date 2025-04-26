<!-- ---
hide:
  - navigation
--- -->

# **:material-chart-timeline-variant-shimmer: LANGUAGE MODEL - 4 (BACKPROPAGATION II)**

**Timeline: 15th January - 6th February, 2025**

## Introduction and Overview

Welcome to my documentation for **Makemore Part 4** from Andrej Karpathy's Neural Networks: Zero to Hero series. In this section we take the 2-layer MLP (with BatchNorm) from the previous video/lecture and **backpropagate through it manually without using PyTorch autograd's loss.backward()**. So we will be manually backpropagating through the cross entropy loss, 2nd linear layer, tanh, batchnorm, 1st linear layer, and the embedding table. 

Along the way, we get a strong intuitive understanding about how gradients flow backwards through the compute graph and on the level of efficient Tensors, not just individual scalars like in micrograd. This helps build competence and intuition around how neural nets are optimized and sets you up to more confidently innovate on and debug modern neural networks.

## Key Resources: Video, Codes and Lecture notes

- I watched the lecture on YouTube: [Building Makemore Part 4](https://youtu.be/q8SA3rM6ckI?si=e-ON-yHPUtFWzY2L)
- The colab notebook initial template - Save a copy of [this notebook](https://colab.research.google.com/drive/1WV2oi2fh9XXyldh02wupFQX0wh5ZC-z-?usp=sharing) and start working on it as you follow along in the lecture.
- My notebooks and code implementations will be available within this documentation itself, feel free to use that as a reference as well or If you wish to view the repository where I originally worked on, you can view it here: [Neural Networks - Language Model 4](https://github.com/MuzzammilShah/NeuralNetworks-LanguageModels-4)
- Notes have been taken whenever necessary and have been marked with timestamps to the video.

!!! note "Note from the author"
    The format and structure of this particular section of the project will be different from what I've implemented so far, as Andrej Karpathy himself had quoted- "I recommend you work through the exercise yourself but work with it in tandem and whenever you are stuck unpause the video and see me give away the answer. This video is not super intended to be simply watched."

    So keeping this in mind, we will be focusing more on the notebook itself and only making notes whenever absolutely necessary.
    
    You will find my notes/key points as comments in the code cells (Apart from the time stamps with necessary headers which will be in their normal format ofcourse)

&nbsp;

*Have fun, Happy Learning!*