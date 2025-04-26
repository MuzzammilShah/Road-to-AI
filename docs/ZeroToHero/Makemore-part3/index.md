<!-- ---
hide:
  - navigation
--- -->

# **:material-graph-outline: LANGUAGE MODEL - 3**

**Timeline: 6th - 14th January, 2025**

## Introduction

Welcome to my documentation for **Makemore Part 3** from Andrej Karpathy's Neural Networks: Zero to Hero series. This section focuses on the intricacies of **activations, gradients, and the introduction of Batch Normalization** in the context of training deep neural networks. Here, I’ve compiled my notes and insights from the lecture to serve as a reference for understanding these critical concepts and their practical applications.

## Overview of Makemore Part 3

In this part of the series, I explored the following key topics:

**Understanding Activations and Gradients**: The lecture emphasizes the importance of monitoring activations and gradients during training. It discusses how improper scaling can lead to issues such as saturation in activation functions (e.g., `tanh`), which can hinder learning.

**Key Concepts Covered**:

- **Initialization Issues**: The video begins by examining how weight initialization affects training. It highlights that initializing weights too high or too low can lead to poor performance and suggests using small random values instead.

- **Saturated Activations**: The lecture addresses the problem of saturated activations in the `tanh` function, where outputs can become stuck at extreme values (-1 or 1). This saturation can slow down learning significantly.

- **Kaiming Initialization**: A method for initializing weights that helps maintain a healthy scale of activations throughout the layers. This technique is crucial for ensuring effective training in deeper networks.

- **Batch Normalization**: The core innovation introduced in this lecture is Batch Normalization, which normalizes the inputs to each layer. This technique stabilizes learning and allows for faster convergence by reducing internal covariate shift.

- **Visualizations for Diagnostics**: Throughout the lecture, various visualizations are utilized to monitor forward pass activations and backward pass gradients. These tools help diagnose issues within the network and understand its health during training.

## Key Resources

**Video Lecture**

- I watched the lecture on YouTube: [Building Makemore Part 3](https://youtu.be/P6sfmUTpUmc?si=6072SkRZSdY1pPB2)

**Codes:**

- The Jupyter notebooks and code implementations are available within this documentation itself.
- If you wish to view the repository where I originally worked on, you can view it here: [Neural Networks - Language Model 3](https://github.com/MuzzammilShah/NeuralNetworks-LanguageModels-3)

## Structure of Contents

- The lecture documentation has been divided into 1 set only, with one main notebook and two additional notebooks.
- Notes have been marked with timestamps to the video.
- This allows for simplicity and better understanding, as the lecture is long.

&nbsp;

*Have fun, Happy Learning!*